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
                   c.name AS category 
            FROM tours t
            LEFT JOIN destination d ON t.destination_id = d.id
            LEFT JOIN region r ON d.region_id = r.id
            LEFT JOIN tourcategory c ON r.category_id = c.id
            WHERE 1=1
        `;
        let params = [];

        console.log(`[getTours] isAdmin: ${req.query.isAdmin}, URL: ${req.url}`);
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
                   d.name AS location, 
                   r.name AS region, 
                   c.name AS category 
            FROM tours t
            LEFT JOIN destination d ON t.destination_id = d.id
            LEFT JOIN region r ON d.region_id = r.id
            LEFT JOIN tourcategory c ON r.category_id = c.id
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

        // Lấy Tags
        try {
            const [types] = await pool.query('SELECT type_id FROM Tour_TourType WHERE tour_id = ?', [id]);
            tour.tourTypes = types.map(t => t.type_id);
            const [occasions] = await pool.query('SELECT occasion_id FROM Tour_Occasion WHERE tour_id = ?', [id]);
            tour.occasions = occasions.map(o => o.occasion_id);
        } catch(e) { console.error("Could not fetch tags for tour", e.message); }

        res.json(tour);
    } catch (error) {
        console.error("Lỗi truy vấn chi tiết tour:", error.message);
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
            `INSERT INTO tours (name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, tour_code, notes, departure_location)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, image, galleryJson, badge || 'Mới', description, itineraryJson, includedJson, excludedJson, destination_id || null, tour_code || null, notesJson, departure_location || 'TP HCM']
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
            `UPDATE tours SET name=?, price=?, original_price=?, child_price=?, available_spots=?, departure_date=?, duration=?, image=?, gallery=?, badge=?, description=?, itinerary=?, included=?, excluded=?, destination_id=?, tour_code=?, notes=?, departure_location=?
             WHERE id=?`,
            [name, price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, image, galleryJson, badge, description, itineraryJson, includedJson, excludedJson, destination_id || null, tour_code || null, notesJson, departure_location || 'TP HCM', id]
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
        const [destinations] = await pool.query('SELECT * FROM destination');
        
        let tourTypes = [];
        let occasions = [];
        try {
            const [typesRes] = await pool.query('SELECT * FROM TourType');
            tourTypes = typesRes;
            const [occasionsRes] = await pool.query('SELECT * FROM Occasion');
            occasions = occasionsRes;
        } catch(e) { console.error("Could not fetch tags", e.message); }
        
        res.json({ categories, regions, destinations, tourTypes, occasions });
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

module.exports = {
    getTours, getTourById, seedData, createTour, updateTour, updateTourStatus, deleteTour,
    getMetadata,
    createDestination, updateDestination, deleteDestination,
    createTag, updateTag, deleteTag
};
