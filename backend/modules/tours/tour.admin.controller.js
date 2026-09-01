const { pool } = require('../../config/db');
const sampleTours = require('../../data/sampleTours');

// 1. Lấy danh sách tours (Sử dụng JOIN để lấy tên địa lý thật thay vì ID)
const getTours = async (req, res) => {
    try {
        const { keyword, location, region, category, minPrice, maxPrice, departureDate, duration } = req.query;
        
        let query = `
            SELECT t.*, 
                   d.name AS location, 
                   r.name AS region,
                   c.name AS category,
                   (SELECT l.name FROM landmarks l WHERE l.id = t.landmark_id LIMIT 1) AS landmark_name,
                   (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', dest.id, 'name', dest.name, 'is_primary', td.is_primary)), ']') FROM tour_destination td JOIN destination dest ON td.destination_id = dest.id WHERE td.tour_id = t.id) AS destinations
            FROM tours t
            LEFT JOIN region r ON r.id = (SELECT r2.id FROM tour_destination td2 JOIN destination d2 ON td2.destination_id = d2.id LEFT JOIN country co2 ON d2.country_id = co2.id JOIN region r2 ON r2.id = COALESCE(d2.region_id, co2.region_id) WHERE td2.tour_id = t.id AND td2.is_primary = TRUE LIMIT 1)
            LEFT JOIN tourcategory c ON c.id = (SELECT c2.id FROM tour_destination td3 JOIN destination d3 ON td3.destination_id = d3.id LEFT JOIN country co3 ON d3.country_id = co3.id JOIN region r3 ON r3.id = COALESCE(d3.region_id, co3.region_id) JOIN tourcategory c2 ON r3.category_id = c2.id WHERE td3.tour_id = t.id AND td3.is_primary = TRUE LIMIT 1)
            WHERE 1=1
        `;
        let params = [];

        if (req.query.isAdmin !== 'true') {
            query += ' AND t.status = "Active"';
        }

        if (keyword && keyword.trim() !== '') {
            query += ' AND (t.name LIKE ? OR d.name LIKE ? OR t.description LIKE ?)';
            const searchTerm = `%${keyword.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        // Vì Frontend vẫn gửi lên tên (VD: 'Miền Nam') trên URL query nên ta so sánh với cột name của bảng join
        if (location && location !== 'Tất cả' && location.trim() !== '') {
            query += ' AND d.name = ?';
            params.push(location.trim());
        }
        if (region && region !== 'Tất cả' && region.trim() !== '') {
            query += ' AND r.name = ?';
            params.push(region.trim());
        }
        if (category && category !== 'Tất cả' && category.trim() !== '') {
            query += ' AND c.name = ?';
            params.push(category.trim());
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
            if (duration.includes('1-3')) {
                query += ' AND (t.duration LIKE ? OR t.duration LIKE ? OR t.duration LIKE ?)';
                params.push('%1 Ngày%', '%2 Ngày%', '%3 Ngày%');
            } else if (duration.includes('4-5')) {
                query += ' AND (t.duration LIKE ? OR t.duration LIKE ?)';
                params.push('%4 Ngày%', '%5 Ngày%');
            } else if (duration.includes('Trên 5')) {
                query += ' AND (t.duration NOT LIKE ? AND t.duration NOT LIKE ? AND t.duration NOT LIKE ? AND t.duration NOT LIKE ? AND t.duration NOT LIKE ?)';
                params.push('%1 Ngày%', '%2 Ngày%', '%3 Ngày%', '%4 Ngày%', '%5 Ngày%');
            } else {
                query += ' AND t.duration LIKE ?';
                params.push(`%${duration.trim()}%`);
            }
        }

        query += ' ORDER BY t.id DESC';

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
                   d.name AS location, 
                   r.name AS region,
                   c.name AS category,
                   (SELECT l.name FROM landmarks l WHERE l.id = t.landmark_id LIMIT 1) AS landmark_name,
                   (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', dest.id, 'name', dest.name, 'is_primary', td.is_primary)), ']') FROM tour_destination td JOIN destination dest ON td.destination_id = dest.id WHERE td.tour_id = t.id) AS destinations
            FROM tours t
            LEFT JOIN region r ON r.id = (SELECT r2.id FROM tour_destination td2 JOIN destination d2 ON td2.destination_id = d2.id LEFT JOIN country co2 ON d2.country_id = co2.id JOIN region r2 ON r2.id = COALESCE(d2.region_id, co2.region_id) WHERE td2.tour_id = t.id AND td2.is_primary = TRUE LIMIT 1)
            LEFT JOIN tourcategory c ON c.id = (SELECT c2.id FROM tour_destination td3 JOIN destination d3 ON td3.destination_id = d3.id LEFT JOIN country co3 ON d3.country_id = co3.id JOIN region r3 ON r3.id = COALESCE(d3.region_id, co3.region_id) JOIN tourcategory c2 ON r3.category_id = c2.id WHERE td3.tour_id = t.id AND td3.is_primary = TRUE LIMIT 1)
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

        // Lấy Tags
        try {
            const [types] = await pool.query('SELECT type_id FROM tour_tourtype WHERE tour_id = ?', [id]);
            tour.tourtypes = types.map(t => t.type_id);
            const [occasions] = await pool.query('SELECT occasion_id FROM tour_occasion WHERE tour_id = ?', [id]);
            tour.occasions = occasions.map(o => o.occasion_id);
        } catch(e) { console.error("Could not fetch tags for tour", e.message); }

        res.json(tour);
    } catch (error) {
        console.error("Lỗi truy vấn chi tiết tour:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// 2.5 Admin: Upload Tour Images
const uploadTourImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Không có file nào được upload" });
        }
        
        // Tạo mảng URLs
        const imageUrls = req.files.map(file => `/uploads/tours/${file.filename}`);
        
        res.status(200).json({ 
            message: "Upload ảnh thành công", 
            urls: imageUrls 
        });
    } catch (error) {
        console.error("Lỗi upload ảnh:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình upload ảnh" });
    }
};

const uploadItineraryImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Không có file nào được upload" });
        }
        
        const imageUrls = req.files.map(file => `/uploads/tours/itinerary/${file.filename}`);
        
        res.status(200).json({ 
            message: "Upload ảnh thành công", 
            urls: imageUrls 
        });
    } catch (error) {
        console.error("Lỗi upload ảnh lịch trình:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình upload ảnh" });
    }
};

// 3. Admin: Thêm tour mới (Lưu ID thay vì chuỗi)
const createTour = async (req, res) => {
    try {
        const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, destinations, tourtypes, occasions, tour_code, notes, landmarks, departure_destination_id } = req.body;
        
        const galleryJson = typeof gallery === 'string' && gallery.startsWith('[') ? gallery : JSON.stringify(gallery || [image]);
        const itineraryJson = typeof itinerary === 'string' && itinerary.startsWith('[') ? itinerary : JSON.stringify(itinerary || []);
        const includedJson = typeof included === 'string' && included.startsWith('[') ? included : JSON.stringify(included || []);
        const excludedJson = typeof excluded === 'string' && excluded.startsWith('[') ? excluded : JSON.stringify(excluded || []);
        const notesJson = typeof notes === 'string' && notes.startsWith('[') ? notes : JSON.stringify(notes || []);

        const [result] = await pool.query(
            `INSERT INTO tours (name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, tour_code, notes, landmarks, departure_destination_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, image, galleryJson, badge || 'Mới', description, itineraryJson, includedJson, excludedJson, tour_code || null, notesJson, landmarks || null, departure_destination_id || null]
        );

        const tourId = result.insertId;

        // Insert Destinations
        if (destinations) {
            let destArr = typeof destinations === 'string' ? JSON.parse(destinations) : destinations;
            for (let destId of destArr) {
                const isPrimary = (destId === destination_id) || (destId === Number(destination_id));
                await pool.query('INSERT IGNORE INTO tour_destination (tour_id, destination_id, is_primary) VALUES (?, ?, ?)', [tourId, destId, isPrimary]);
            }
        }

        // Insert Tags
        if (tourtypes) {
            let typesArr = typeof tourtypes === 'string' ? JSON.parse(tourtypes) : tourtypes;
            for (let typeId of typesArr) {
                await pool.query('INSERT IGNORE INTO tour_tourtype (tour_id, type_id) VALUES (?, ?)', [tourId, typeId]);
            }
        }
        if (occasions) {
            let occArr = typeof occasions === 'string' ? JSON.parse(occasions) : occasions;
            for (let occId of occArr) {
                await pool.query('INSERT IGNORE INTO tour_occasion (tour_id, occasion_id) VALUES (?, ?)', [tourId, occId]);
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
        const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, destinations, tourtypes, occasions, tour_code, notes, landmarks, departure_destination_id } = req.body;

        const galleryJson = typeof gallery === 'string' && gallery.startsWith('[') ? gallery : JSON.stringify(gallery || [image]);
        const itineraryJson = typeof itinerary === 'string' && itinerary.startsWith('[') ? itinerary : JSON.stringify(itinerary || []);
        const includedJson = typeof included === 'string' && included.startsWith('[') ? included : JSON.stringify(included || []);
        const excludedJson = typeof excluded === 'string' && excluded.startsWith('[') ? excluded : JSON.stringify(excluded || []);
        const notesJson = typeof notes === 'string' && notes.startsWith('[') ? notes : JSON.stringify(notes || []);

        await pool.query(
            `UPDATE tours SET name=?, price=?, original_price=?, child_price=?, available_spots=?, departure_date=?, duration=?, image=?, gallery=?, badge=?, description=?, itinerary=?, included=?, excluded=?, tour_code=?, notes=?, landmarks=?, departure_destination_id=?
             WHERE id=?`,
            [name, price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, image, galleryJson, badge, description, itineraryJson, includedJson, excludedJson, tour_code || null, notesJson, landmarks || null, departure_destination_id || null, id]
        );

        // Update Destinations
        if (destinations) {
            await pool.query('DELETE FROM tour_destination WHERE tour_id = ?', [id]);
            let destArr = typeof destinations === 'string' ? JSON.parse(destinations) : destinations;
            for (let destId of destArr) {
                const isPrimary = (destId === destination_id) || (destId === Number(destination_id));
                await pool.query('INSERT IGNORE INTO tour_destination (tour_id, destination_id, is_primary) VALUES (?, ?, ?)', [id, destId, isPrimary]);
            }
        }

        // Update Tags
        if (tourtypes) {
            await pool.query('DELETE FROM tour_tourtype WHERE tour_id = ?', [id]);
            let typesArr = typeof tourtypes === 'string' ? JSON.parse(tourtypes) : tourtypes;
            for (let typeId of typesArr) {
                await pool.query('INSERT IGNORE INTO tour_tourtype (tour_id, type_id) VALUES (?, ?)', [id, typeId]);
            }
        }
        if (occasions) {
            await pool.query('DELETE FROM tour_occasion WHERE tour_id = ?', [id]);
            let occArr = typeof occasions === 'string' ? JSON.parse(occasions) : occasions;
            for (let occId of occArr) {
                await pool.query('INSERT IGNORE INTO tour_occasion (tour_id, occasion_id) VALUES (?, ?)', [id, occId]);
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
        
        let tourtypes = [];
        let occasions = [];
        try {
            const [typesRes] = await pool.query('SELECT * FROM tourtype');
            tourtypes = typesRes;
            const [occasionsRes] = await pool.query('SELECT * FROM occasion');
            occasions = occasionsRes;
        } catch(e) { console.error("Could not fetch tags", e.message); }
        
        res.json({ categories, regions, countries, destinations, tourtypes, occasions });
    } catch (error) {
        console.error("Lỗi getMetadata:", error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const createRegion = async (req, res) => {
    try {
        const { name, category_id } = req.body;
        if (!name || !category_id) return res.status(400).json({ message: "Thiếu dữ liệu" });
        const [result] = await pool.query('INSERT INTO region (name, category_id) VALUES (?, ?)', [name, category_id]);
        res.status(201).json({ id: result.insertId, name, category_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const updateRegion = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category_id } = req.body;
        await pool.query('UPDATE region SET name=?, category_id=? WHERE id=?', [name, category_id, id]);
        res.json({ id, name, category_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const deleteRegion = async (req, res) => {
    try {
        const { id } = req.params;
        const [countries] = await pool.query('SELECT id FROM country WHERE region_id = ?', [id]);
        const [destinations] = await pool.query('SELECT id FROM destination WHERE region_id = ?', [id]);
        if (countries.length > 0 || destinations.length > 0) {
            return res.status(400).json({ message: "Không thể xóa khu vực này vì đang chứa các quốc gia hoặc điểm đến bên trong." });
        }
        await pool.query('DELETE FROM region WHERE id=?', [id]);
        res.json({ message: "Xóa vùng miền thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const createCountry = async (req, res) => {
    try {
        const { name, region_id } = req.body;
        if (!name || !region_id) return res.status(400).json({ message: "Thiếu dữ liệu" });
        const [result] = await pool.query('INSERT INTO country (name, region_id) VALUES (?, ?)', [name, region_id]);
        res.status(201).json({ id: result.insertId, name, region_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const updateCountry = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, region_id } = req.body;
        await pool.query('UPDATE country SET name=?, region_id=? WHERE id=?', [name, region_id, id]);
        res.json({ id, name, region_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const deleteCountry = async (req, res) => {
    try {
        const { id } = req.params;
        const [destinations] = await pool.query('SELECT id FROM destination WHERE country_id = ?', [id]);
        if (destinations.length > 0) {
            return res.status(400).json({ message: "Không thể xóa quốc gia này vì đang chứa các điểm đến bên trong." });
        }
        await pool.query('DELETE FROM country WHERE id=?', [id]);
        res.json({ message: "Xóa quốc gia thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const createDestination = async (req, res) => {
    try {
        const { name, region_id, country_id } = req.body;
        if (!name) return res.status(400).json({ message: "Thiếu tên điểm đến" });
        const [result] = await pool.query('INSERT INTO destination (name, region_id, country_id) VALUES (?, ?, ?)', [name, region_id || null, country_id || null]);
        res.status(201).json({ id: result.insertId, name, region_id: region_id || null, country_id: country_id || null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const updateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, region_id, country_id } = req.body;
        await pool.query('UPDATE destination SET name=?, region_id=?, country_id=? WHERE id=?', [name, region_id || null, country_id || null, id]);
        res.json({ id, name, region_id: region_id || null, country_id: country_id || null });
    } catch (error) {
        console.error(error);
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

// --- CÁC HÀM QUẢN LÝ ĐỊA DANH (CẤP 4) ---
const createLandmark = async (req, res) => {
    try {
        const { name, destination_id } = req.body;
        if (!name || !destination_id) return res.status(400).json({ message: "Thiếu tên địa danh hoặc id điểm đến" });
        const [result] = await pool.query('INSERT INTO landmarks (name, destination_id) VALUES (?, ?)', [name, destination_id]);
        res.status(201).json({ id: result.insertId, name, destination_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const updateLandmark = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, destination_id } = req.body;
        await pool.query('UPDATE landmarks SET name=?, destination_id=? WHERE id=?', [name, destination_id, id]);
        res.json({ id, name, destination_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

const deleteLandmark = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM landmarks WHERE id=?', [id]);
        res.json({ message: "Xóa địa danh thành công" });
    } catch (error) {
        console.error("Lỗi xóa địa danh:", error);
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

module.exports = {
    getTours, getTourById, seedData, createTour, updateTour, updateTourStatus, deleteTour, uploadTourImages, uploadItineraryImages,
    getMetadata,
    createRegion, updateRegion, deleteRegion,
    createCountry, updateCountry, deleteCountry,
    createDestination, updateDestination, deleteDestination,
    createLandmark, updateLandmark, deleteLandmark,
    createTag, updateTag, deleteTag
};
