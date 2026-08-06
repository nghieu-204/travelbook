const { pool } = require('../../config/db');
const sampleTours = require('../../data/sampleTours');

// 1. Lấy danh sách tours (Sử dụng JOIN để lấy tên địa lý thật thay vì ID)
const getTours = async (req, res) => {
    try {
        const { keyword, location, region, category, minPrice, maxPrice, departureDate, duration, tourType, rating, departureLocation } = req.query;
        
        let query = `
            SELECT t.*, 
                   GREATEST(0, t.available_spots - COALESCE((SELECT SUM(b.adults + b.children) FROM bookings b WHERE b.tour_id = t.id AND b.status != 'Hủy'), 0)) AS available_spots,
                   (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', d.id, 'name', d.name, 'is_primary', td.is_primary)), ']') FROM tour_destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id) AS destinations,
                   (SELECT r.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS region, 
                   (SELECT c.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id JOIN tourcategory c ON r.category_id = c.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS category,
                   (SELECT d.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS province,
                   (SELECT co.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS country
            FROM tours t
            WHERE 1=1
        `;
        let params = [];

        console.log(`[getTours] req.query.location:`, req.query.location);
        console.log(`[getTours] isAdmin: ${req.query.isAdmin}, URL: ${req.url}`);
        if (req.query.isAdmin !== 'true') {
            query += ' AND t.status = "Active"';
        }

        if (keyword && keyword.trim() !== '') {
            query += ' AND (t.name LIKE ? OR t.id IN (SELECT td.tour_id FROM tour_destination td JOIN destination d ON td.destination_id = d.id WHERE d.name LIKE ?) OR t.description LIKE ?)';
            const searchTerm = `%${keyword.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm);
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
        const tourTypes = ensureArray(tourType);
        if (tourTypes.length > 0) {
            const placeholders = tourTypes.map(() => '?').join(',');
            query += ` AND t.id IN (SELECT tt.tour_id FROM tour_tourtype tt JOIN tourtype type ON tt.type_id = type.id WHERE type.name IN (${placeholders}))`;
            params.push(...tourTypes);
        }

        if (rating && !isNaN(rating) && Number(rating) > 0) {
            query += ' AND CAST(t.rating AS DECIMAL(3,1)) >= ?';
            params.push(Number(rating));
        }

        const departureLocs = ensureArray(departureLocation);
        if (departureLocs.length > 0) {
            const placeholders = departureLocs.map(() => '?').join(',');
            query += ` AND t.departure_location IN (${placeholders})`;
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
        res.status(500).json({ message: "Lỗi server khi lấy danh sách tour" });
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
                   (SELECT co.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS country
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
        tour.tourTypes = types.map(t => t.name);

        const [occasions] = await pool.query('SELECT occ.name FROM tour_occasion to_occ JOIN occasion occ ON to_occ.occasion_id = occ.id WHERE to_occ.tour_id = ?', [id]);
        tour.occasions = occasions.map(o => o.name);

        res.json(tour);
    } catch (error) {
        console.error("Lỗi lấy chi tiết tour:", error);
        res.status(500).json({ message: "Lỗi server khi lấy chi tiết tour" });
    }
};

// 3. Admin: Thêm tour mới (Lưu ID thay vì chuỗi)
const createTour = async (req, res) => {
    try {
        const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, tourTypes, occasions, tour_code, notes, departure_location } = req.body;
        
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
        if (tourTypes) {
            let typesArr = typeof tourTypes === 'string' ? JSON.parse(tourTypes) : tourTypes;
            for (let typeId of typesArr) {
                await pool.query('INSERT IGNORE INTO Tour_TourType (tour_id, type_id) VALUES (?, ?)', [tourId, typeId]);
            }
        }
        if (occasions) {
            let occArr = typeof occasions === 'string' ? JSON.parse(occasions) : occasions;
            for (let occId of occArr) {
                await pool.query('INSERT IGNORE INTO Tour_Occasion (tour_id, occasion_id) VALUES (?, ?)', [tourId, occId]);
            }
        }

        res.status(201).json({ message: "🎉 Thêm tour mới thành công!", tourId });
    } catch (error) {
        console.error("Lỗi thêm tour:", error.message);
        res.status(500).json({ message: "Lỗi máy chủ khi thêm tour" });
    }
};

// 4. Admin: Cập nhật tour (Lưu ID thay vì chuỗi)
const updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, tourTypes, occasions, tour_code, notes, departure_location } = req.body;

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
        if (tourTypes) {
            await pool.query('DELETE FROM Tour_TourType WHERE tour_id = ?', [id]);
            let typesArr = typeof tourTypes === 'string' ? JSON.parse(tourTypes) : tourTypes;
            for (let typeId of typesArr) {
                await pool.query('INSERT IGNORE INTO Tour_TourType (tour_id, type_id) VALUES (?, ?)', [id, typeId]);
            }
        }
        if (occasions) {
            await pool.query('DELETE FROM Tour_Occasion WHERE tour_id = ?', [id]);
            let occArr = typeof occasions === 'string' ? JSON.parse(occasions) : occasions;
            for (let occId of occArr) {
                await pool.query('INSERT IGNORE INTO Tour_Occasion (tour_id, occasion_id) VALUES (?, ?)', [id, occId]);
            }
        }

        res.json({ message: "🎉 Cập nhật thông tin tour thành công!" });
    } catch (error) {
        console.error("Lỗi cập nhật tour:", error.message);
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: "Lỗi máy chủ khi xóa tour" });
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
        res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái" });
    }
};

// 7. Nạp Data Mẫu
const seedData = async (req, res) => {
    try {
        res.json({ message: "Tính năng nạp dữ liệu mẫu hiện đã được tích hợp qua module riêng." });
    } catch (error) {
        console.error("Lỗi nạp seed:", error);
        res.status(500).json({ message: "Lỗi khi nạp dữ liệu mẫu" });
    }
};

// --- CÁC HÀM QUẢN LÝ ĐỊA LÝ (METADATA) DÙNG CHUNG ---
const getMetadata = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM tourcategory');
        const [regions] = await pool.query('SELECT * FROM region');
        const [countries] = await pool.query('SELECT * FROM country');
        const [destinations] = await pool.query('SELECT * FROM destination');
        
        let tourTypes = [];
        let occasions = [];
        try {
            const [typesRes] = await pool.query('SELECT * FROM TourType');
            tourTypes = typesRes;
            const [occasionsRes] = await pool.query('SELECT * FROM Occasion');
            occasions = occasionsRes;
        } catch(e) { console.error("Could not fetch tags", e.message); }
        
        res.json({ categories, regions, countries, destinations, tourTypes, occasions });
    } catch (error) {
        console.error("Lỗi getMetadata:", error);
        res.status(500).json({ message: "Lỗi tải metadata" });
    }
};

const createDestination = async (req, res) => {
    try {
        const { name, region_id } = req.body;
        if (!name || !region_id) return res.status(400).json({ message: "Thiếu dữ liệu" });
        const [result] = await pool.query('INSERT INTO destination (name, region_id) VALUES (?, ?)', [name, region_id]);
        res.status(201).json({ id: result.insertId, name, region_id });
    } catch (error) {
        res.status(500).json({ message: "Lỗi tạo điểm đến" });
    }
};

const updateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, region_id } = req.body;
        await pool.query('UPDATE destination SET name=?, region_id=? WHERE id=?', [name, region_id, id]);
        res.json({ id, name, region_id });
    } catch (error) {
        res.status(500).json({ message: "Lỗi sửa điểm đến" });
    }
};

const deleteDestination = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM destination WHERE id=?', [id]);
        res.json({ message: "Xóa điểm đến thành công" });
    } catch (error) {
        console.error("Lỗi xóa destination:", error);
        res.status(500).json({ message: "Lỗi khi xóa điểm đến" });
    }
};

// --- CÁC HÀM QUẢN LÝ TAGS (TourType, Occasion) ---
const createTag = async (req, res) => {
    try {
        const { name, category } = req.body;
        const table = category === 'type' ? 'TourType' : 'Occasion';
        const [result] = await pool.query(`INSERT INTO ${table} (name) VALUES (?)`, [name]);
        res.status(201).json({ tag: { id: result.insertId, name, category } });
    } catch (error) {
        console.error("Lỗi tạo tag:", error);
        res.status(500).json({ message: "Lỗi khi tạo tag" });
    }
};

const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category } = req.body;
        const table = category === 'type' ? 'TourType' : 'Occasion';
        await pool.query(`UPDATE ${table} SET name = ? WHERE id = ?`, [name, id]);
        res.json({ message: "Cập nhật tag thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật tag:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật tag" });
    }
};

const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.query;
        const table = category === 'type' ? 'TourType' : 'Occasion';
        await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
        res.json({ message: "Xóa tag thành công" });
    } catch (error) {
        console.error("Lỗi xóa tag:", error);
        res.status(500).json({ message: "Lỗi khi xóa tag" });
    }
};

// Lấy metadata cho bộ lọc nâng cao
const getFiltersMetadata = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM tourcategory');
        const [regions] = await pool.query('SELECT * FROM region');
        const [countries] = await pool.query('SELECT * FROM country');
        const [destinations] = await pool.query('SELECT id, name, region_id, country_id FROM destination');
        const [tourTypes] = await pool.query('SELECT name FROM tourtype');
        const [departureLocations] = await pool.query('SELECT DISTINCT departure_location FROM tours WHERE departure_location IS NOT NULL AND departure_location != ""');

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
            tourTypes: tourTypes.map(t => t.name),
            departureLocations: departureLocations.map(dl => dl.departure_location)
        });
    } catch (error) {
        console.error('Lỗi khi lấy filter metadata:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu bộ lọc' });
    }
};

module.exports = {
    getTours, getTourById, seedData, createTour, updateTour, updateTourStatus, deleteTour,
    getMetadata, getFiltersMetadata,
    createDestination, updateDestination, deleteDestination,
    createTag, updateTag, deleteTag
};
