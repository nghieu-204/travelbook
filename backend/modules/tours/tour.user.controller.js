const { pool } = require('../../config/db');
const sampleTours = require('../../data/sampleTours');

// 1. Lấy danh sách tours (Sử dụng JOIN để lấy tên địa lý thật thay vì ID)
const getTours = async (req, res) => {
    try {
        const { keyword, location, region, category, minPrice, maxPrice, departureDate, duration, tourtype, rating, departureLocation } = req.query;
        
        let query = `
            SELECT t.*, 
                   GREATEST(0, t.available_spots - COALESCE((SELECT SUM(b.adults + b.children) FROM bookings b WHERE b.tour_id = t.id AND b.status != 'Hủy'), 0)) AS available_spots,
                   (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', d.id, 'name', d.name, 'is_primary', td.is_primary)), ']') FROM tour_destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id) AS destinations,
                   (SELECT r.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS region, 
                   (SELECT c.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id JOIN tourcategory c ON r.category_id = c.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS category,
                   (SELECT d.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS province,
                   (SELECT co.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS country,
                   (SELECT GROUP_CONCAT(l.name SEPARATOR ', ') FROM landmarks l WHERE JSON_CONTAINS(t.landmarks, CAST(l.id AS CHAR))) AS landmark_name,
                   (SELECT d.name FROM destination d WHERE d.id = t.departure_destination_id) AS departure_location
            FROM tours t
            WHERE 1=1
        `;
        let params = [];

        if (req.query.isAdmin !== 'true') {
            query += ' AND t.status = "Active"';
        }

        if (keyword && keyword.trim() !== '') {
            query += ' AND (t.name LIKE ? OR t.id IN (SELECT td.tour_id FROM tour_destination td JOIN destination d ON td.destination_id = d.id WHERE d.name LIKE ?) OR t.id IN (SELECT t2.id FROM tours t2 JOIN landmarks l ON t2.landmark_id = l.id WHERE l.name LIKE ?) OR t.description LIKE ?)';
            const searchTerm = `%${keyword.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        const ensureArray = (val) => {
            if (!val || val === 'Tất cả') return [];
            return Array.isArray(val) ? val : [val];
        };

        const locations = ensureArray(location);
        if (locations.length > 0) {
            const placeholders = locations.map(() => '?').join(',');
            query += ` AND t.id IN (SELECT td.tour_id FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id WHERE d.name IN (${placeholders}) OR co.name IN (${placeholders}) OR r.name IN (${placeholders}))`;
            params.push(...locations, ...locations, ...locations);
        }

        const regions = ensureArray(region);
        if (regions.length > 0) {
            const placeholders = regions.map(() => '?').join(',');
            query += ` AND t.id IN (SELECT td.tour_id FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id WHERE r.name IN (${placeholders}))`;
            params.push(...regions);
        }

        const categories = ensureArray(category);
        if (categories.length > 0) {
            const placeholders = categories.map(() => '?').join(',');
            query += ` AND t.id IN (SELECT td.tour_id FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id JOIN tourcategory c ON r.category_id = c.id WHERE c.name IN (${placeholders}))`;
            params.push(...categories);
        }
        
        if (minPrice && !isNaN(minPrice) && Number(minPrice) > 0 && minPrice !== 'Tất cả') {
            query += ' AND t.price >= ?';
            params.push(Number(minPrice));
        }
        if (maxPrice && !isNaN(maxPrice) && Number(maxPrice) > 0 && maxPrice !== 'Tất cả') {
            query += ' AND t.price <= ?';
            params.push(Number(maxPrice));
        }
        if (departureDate && departureDate.trim() !== '' && departureDate !== 'Tất cả') {
            query += ' AND t.departure_date >= ?';
            params.push(departureDate.trim());
        }
        if (duration && duration !== 'Tất cả' && duration.trim() !== '') {
            const durations = ensureArray(duration);
            const conditions = durations.map(dur => {
                if (dur.includes('1-3')) {
                    return '(t.duration LIKE "%1 Ngày%" OR t.duration LIKE "%2 Ngày%" OR t.duration LIKE "%3 Ngày%")';
                } else if (dur.includes('4-7') || dur.includes('4-5')) {
                    return '(t.duration LIKE "%4 Ngày%" OR t.duration LIKE "%5 Ngày%" OR t.duration LIKE "%6 Ngày%" OR t.duration LIKE "%7 Ngày%")';
                } else if (dur.includes('Trên 7') || dur.includes('Trên 5')) {
                    return '(t.duration NOT LIKE "%1 Ngày%" AND t.duration NOT LIKE "%2 Ngày%" AND t.duration NOT LIKE "%3 Ngày%" AND t.duration NOT LIKE "%4 Ngày%" AND t.duration NOT LIKE "%5 Ngày%" AND t.duration NOT LIKE "%6 Ngày%" AND t.duration NOT LIKE "%7 Ngày%")';
                } else {
                    return `t.duration LIKE '%${dur.trim()}%'`;
                }
            });
            if (conditions.length > 0) {
                query += ` AND (${conditions.join(' OR ')})`;
            }
        }
        
        // --- NEW ADVANCED FILTERS ---
        const tourtypes = ensureArray(tourtype);
        if (tourtypes.length > 0) {
            const placeholders = tourtypes.map(() => '?').join(',');
            query += ` AND t.id IN (SELECT tt.tour_id FROM tour_tourtype tt JOIN tourtype type ON tt.type_id = type.id WHERE type.name IN (${placeholders}))`;
            params.push(...tourtypes);
        }

        if (rating && !isNaN(rating) && Number(rating) > 0) {
            query += ' AND CAST(t.rating AS DECIMAL(3,1)) >= ?';
            params.push(Number(rating));
        }

        const departureLocs = ensureArray(departureLocation);
        if (departureLocs.length > 0) {
            const placeholders = departureLocs.map(() => '?').join(',');
            query += ` AND t.departure_destination_id IN (SELECT id FROM destination WHERE name IN (${placeholders}))`;
            params.push(...departureLocs);
        }

        if (req.query.sort === 'bestselling') {
            query += ' ORDER BY (SELECT COUNT(*) FROM bookings b WHERE b.tour_id = t.id) DESC, t.id DESC';
        } else {
            query += ' ORDER BY t.id DESC';
        }

        if (req.query.limit && !isNaN(req.query.limit)) {
            query += ' LIMIT ?';
            params.push(Number(req.query.limit));
        }

        const [rows] = await pool.query(query, params);
        rows.forEach(row => {
            try { row.destinations = row.destinations ? JSON.parse(row.destinations) : []; } catch (e) { row.destinations = []; }
        });
        res.json(rows);
    } catch (error) {
        console.error("Lỗi truy vấn tours:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// 2. Lấy chi tiết 1 tour theo ID (Sử dụng JOIN)
const getTourById = async (req, res) => {
    try {
        const { id } = req.params;
        let query = `
            SELECT t.*, 
                   GREATEST(0, t.available_spots - COALESCE((SELECT SUM(b.adults + b.children) FROM bookings b WHERE b.tour_id = t.id AND b.status != 'Hủy'), 0)) AS available_spots,
                   (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', d.id, 'name', d.name, 'is_primary', td.is_primary)), ']') FROM tour_destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id) AS destinations,
                   (SELECT r.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS region, 
                   (SELECT c.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id JOIN tourcategory c ON r.category_id = c.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS category,
                   (SELECT d.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS province,
                   (SELECT co.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS country,
                   (SELECT GROUP_CONCAT(l.name SEPARATOR ', ') FROM landmarks l WHERE JSON_CONTAINS(t.landmarks, CAST(l.id AS CHAR))) AS landmark_name,
                   (SELECT d.name FROM destination d WHERE d.id = t.departure_destination_id) AS departure_location
            FROM tours t
            WHERE t.id = ?
        `;
        if (req.query.isAdmin !== 'true') {
            query += ' AND t.status = "Active"';
        }
        const [rows] = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy thông tin tour" });
        }
        
        const tour = rows[0];

        try { tour.destinations = tour.destinations ? JSON.parse(tour.destinations) : []; } catch (e) { tour.destinations = []; }

        const [types] = await pool.query('SELECT type.name FROM tour_tourtype tt JOIN tourtype type ON tt.type_id = type.id WHERE tt.tour_id = ?', [id]);
        tour.tourtypes = types.map(t => t.name);

        const [occasions] = await pool.query('SELECT occ.name FROM tour_occasion to_occ JOIN occasion occ ON to_occ.occasion_id = occ.id WHERE to_occ.tour_id = ?', [id]);
        tour.occasions = occasions.map(o => o.name);

        res.json(tour);
    } catch (error) {
        console.error("Lỗi lấy chi tiết tour:", error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// 3. Admin: Thêm tour mới (Lưu ID thay vì chuỗi)
const createTour = async (req, res) => {
    try {
        const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, tourtypes, occasions, tour_code, notes, departure_location } = req.body;
        
        const galleryJson = typeof gallery === 'string' && gallery.startsWith('[') ? gallery : JSON.stringify(gallery || [image]);
        const itineraryJson = typeof itinerary === 'string' && itinerary.startsWith('[') ? itinerary : JSON.stringify(itinerary || []);
        const includedJson = typeof included === 'string' && included.startsWith('[') ? included : JSON.stringify(included || []);
        const excludedJson = typeof excluded === 'string' && excluded.startsWith('[') ? excluded : JSON.stringify(excluded || []);
        const notesJson = typeof notes === 'string' && notes.startsWith('[') ? notes : JSON.stringify(notes || []);

        const [result] = await pool.query(
            `INSERT INTO tours (name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, tour_code, notes, departure_location)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, image, galleryJson, badge || 'Mới', description, itineraryJson, includedJson, excludedJson, tour_code || null, notesJson, departure_location || 'TP HCM']
        );

        const tourId = result.insertId;

        // Insert Tags
        if (tourtypes) {
            let typesArr = typeof tourtypes === 'string' ? JSON.parse(tourtypes) : tourtypes;
            for (let typeId of typesArr) {
                await pool.query('INSERT IGNORE INTO Tour_tourtype (tour_id, type_id) VALUES (?, ?)', [tourId, typeId]);
            }
        }
        if (occasions) {
            let occArr = typeof occasions === 'string' ? JSON.parse(occasions) : occasions;
            for (let occId of occArr) {
                await pool.query('INSERT IGNORE INTO Tour_occasion (tour_id, occasion_id) VALUES (?, ?)', [tourId, occId]);
            }
        }

        res.status(201).json({ message: "🎉 Thêm tour mới thành công!", tourId });
    } catch (error) {
        console.error("Lỗi thêm tour:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// 4. Admin: Cập nhật tour (Lưu ID thay vì chuỗi)
const updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, tourtypes, occasions, tour_code, notes, departure_location } = req.body;

        const galleryJson = typeof gallery === 'string' && gallery.startsWith('[') ? gallery : JSON.stringify(gallery || [image]);
        const itineraryJson = typeof itinerary === 'string' && itinerary.startsWith('[') ? itinerary : JSON.stringify(itinerary || []);
        const includedJson = typeof included === 'string' && included.startsWith('[') ? included : JSON.stringify(included || []);
        const excludedJson = typeof excluded === 'string' && excluded.startsWith('[') ? excluded : JSON.stringify(excluded || []);
        const notesJson = typeof notes === 'string' && notes.startsWith('[') ? notes : JSON.stringify(notes || []);

        await pool.query(
            `UPDATE tours SET name=?, price=?, original_price=?, child_price=?, available_spots=?, departure_date=?, duration=?, image=?, gallery=?, badge=?, description=?, itinerary=?, included=?, excluded=?, tour_code=?, notes=?, departure_location=?
             WHERE id=?`,
            [name, price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, image, galleryJson, badge, description, itineraryJson, includedJson, excludedJson, tour_code || null, notesJson, departure_location || 'TP HCM', id]
        );

        // Update Tags
        if (tourtypes) {
            await pool.query('DELETE FROM Tour_tourtype WHERE tour_id = ?', [id]);
            let typesArr = typeof tourtypes === 'string' ? JSON.parse(tourtypes) : tourtypes;
            for (let typeId of typesArr) {
                await pool.query('INSERT IGNORE INTO Tour_tourtype (tour_id, type_id) VALUES (?, ?)', [id, typeId]);
            }
        }
        if (occasions) {
            await pool.query('DELETE FROM Tour_occasion WHERE tour_id = ?', [id]);
            let occArr = typeof occasions === 'string' ? JSON.parse(occasions) : occasions;
            for (let occId of occArr) {
                await pool.query('INSERT IGNORE INTO Tour_occasion (tour_id, occasion_id) VALUES (?, ?)', [id, occId]);
            }
        }

        res.json({ message: "🎉 Cập nhật thông tin tour thành công!" });
    } catch (error) {
        console.error("Lỗi cập nhật tour:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// 5. Admin: Xóa tour
const deleteTour = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tours WHERE id = ?', [id]);
        res.json({ message: "✅ Đã xóa tour khỏi hệ thống!" });
    } catch (error) {
        console.error("Lỗi xóa tour:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// 6. Admin: Cập nhật trạng thái
const updateTourStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE tours SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: "Cập nhật trạng thái thành công!" });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// 7. Nạp Data Mẫu
const seedData = async (req, res) => {
    try {
        res.json({ message: "Tính năng nạp dữ liệu mẫu hiện đã được tích hợp qua module riêng." });
    } catch (error) {
        console.error("Lỗi nạp seed:", error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// --- CÁC HÀM QUẢN LÝ ĐỊA LÝ (METADATA) DÙNG CHUNG ---
const getMetadata = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM tourcategory');
        const [regions] = await pool.query('SELECT * FROM region');
        const [countries] = await pool.query('SELECT * FROM country');
        const [destinations] = await pool.query('SELECT * FROM destination');
        const [tourtypes] = await pool.query('SELECT * FROM tourtype');
        const [occasions] = await pool.query('SELECT * FROM occasion');
        const [landmarks] = await pool.query('SELECT * FROM landmarks');
        
        res.status(200).json({ categories, regions, countries, destinations, tourtypes, occasions, landmarks });
    } catch (error) {
        console.error("Lỗi getMetadata:", error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const createDestination = async (req, res) => {
    try {
        const { name, region_id } = req.body;
        if (!name || !region_id) return res.status(400).json({ message: "Thiếu dữ liệu" });
        const [result] = await pool.query('INSERT INTO destination (name, region_id) VALUES (?, ?)', [name, region_id]);
        res.status(201).json({ id: result.insertId, name, region_id });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const updateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, region_id } = req.body;
        await pool.query('UPDATE destination SET name=?, region_id=? WHERE id=?', [name, region_id, id]);
        res.json({ id, name, region_id });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const deleteDestination = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM destination WHERE id=?', [id]);
        res.json({ message: "Xóa điểm đến thành công" });
    } catch (error) {
        console.error("Lỗi xóa destination:", error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// --- CÁC HÀM QUẢN LÝ TAGS (tourtype, occasion) ---
const createTag = async (req, res) => {
    try {
        const { name, category } = req.body;
        const table = category === 'type' ? 'tourtype' : 'occasion';
        const [result] = await pool.query(`INSERT INTO ${table} (name) VALUES (?)`, [name]);
        res.status(201).json({ tag: { id: result.insertId, name, category } });
    } catch (error) {
        console.error("Lỗi tạo tag:", error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category } = req.body;
        const table = category === 'type' ? 'tourtype' : 'occasion';
        await pool.query(`UPDATE ${table} SET name = ? WHERE id = ?`, [name, id]);
        res.json({ message: "Cập nhật tag thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật tag:", error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.query;
        const table = category === 'type' ? 'tourtype' : 'occasion';
        await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
        res.json({ message: "Xóa tag thành công" });
    } catch (error) {
        console.error("Lỗi xóa tag:", error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Lấy metadata cho bộ lọc nâng cao
const getFiltersMetadata = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM tourcategory');
        const [regions] = await pool.query('SELECT * FROM region');
        const [countries] = await pool.query('SELECT * FROM country');
        const [destinations] = await pool.query('SELECT id, name, region_id, country_id FROM destination');
        const [tourtypes] = await pool.query('SELECT name FROM tourtype');
        const [departureLocations] = await pool.query('SELECT DISTINCT d.name AS departure_location FROM tours t JOIN destination d ON t.departure_destination_id = d.id WHERE t.departure_destination_id IS NOT NULL');

        const domesticCat = categories.find(c => c.name.toLowerCase().includes('trong nước'));
        const intlCat = categories.find(c => c.name.toLowerCase().includes('quốc tế') || c.name.toLowerCase().includes('ngoài nước'));

        let domesticHierarchy = [];
        if (domesticCat) {
            domesticHierarchy = regions
                .filter(r => r.category_id === domesticCat.id)
                .map(r => ({
                    region: r.name,
                    destinations: destinations.filter(d => d.region_id === r.id).map(d => d.name)
                }));
        }

        let internationalHierarchy = [];
        if (intlCat) {
            internationalHierarchy = regions
                .filter(r => r.category_id === intlCat.id)
                .map(r => ({
                    region: r.name,
                    countries: countries
                        .filter(c => c.region_id === r.id)
                        .map(c => ({
                            country: c.name,
                            destinations: destinations.filter(d => d.country_id === c.id).map(d => d.name)
                        }))
                }));
        }

        res.json({
            domestic: domesticHierarchy,
            international: internationalHierarchy,
            tourtypes: tourtypes.map(t => t.name),
            departureLocations: departureLocations.map(dl => dl.departure_location)
        });
    } catch (error) {
        console.error('Lỗi khi lấy filter metadata:', error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

module.exports = {
    getTours, getTourById, seedData, createTour, updateTour, updateTourStatus, deleteTour,
    getMetadata, getFiltersMetadata,
    createDestination, updateDestination, deleteDestination,
    createTag, updateTag, deleteTag
};
