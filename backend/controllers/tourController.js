const { pool } = require('../config/db');
const sampleTours = require('../data/sampleTours');

// Lấy danh sách tours (hỗ trợ tìm kiếm, lọc theo địa điểm, danh mục, giá)
const getTours = async (req, res) => {
    try {
        const { keyword, location, region, category, minPrice, maxPrice, departureDate, duration } = req.query;
        let query = 'SELECT * FROM tours WHERE 1=1';
        let params = [];

        if (keyword && keyword.trim() !== '') {
            query += ' AND (name LIKE ? OR location LIKE ? OR description LIKE ?)';
            const searchTerm = `%${keyword.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        if (location && location !== 'Tất cả' && location.trim() !== '') {
            query += ' AND location = ?';
            params.push(location.trim());
        }
        if (region && region !== 'Tất cả' && region.trim() !== '') {
            query += ' AND region = ?';
            params.push(region.trim());
        }
        if (category && category !== 'Tất cả' && category.trim() !== '') {
            query += ' AND category = ?';
            params.push(category.trim());
        }
        if (minPrice && !isNaN(minPrice) && Number(minPrice) > 0 && minPrice !== 'Tất cả') {
            query += ' AND price >= ?';
            params.push(Number(minPrice));
        }
        if (maxPrice && !isNaN(maxPrice) && Number(maxPrice) > 0 && maxPrice !== 'Tất cả') {
            query += ' AND price <= ?';
            params.push(Number(maxPrice));
        }
        if (departureDate && departureDate.trim() !== '' && departureDate !== 'Tất cả') {
            query += ' AND departure_date >= ?';
            params.push(departureDate.trim());
        }
        if (duration && duration !== 'Tất cả' && duration.trim() !== '') {
            if (duration.includes('1-3')) {
                query += ' AND (duration LIKE ? OR duration LIKE ? OR duration LIKE ?)';
                params.push('%1 Ngày%', '%2 Ngày%', '%3 Ngày%');
            } else if (duration.includes('4-5')) {
                query += ' AND (duration LIKE ? OR duration LIKE ?)';
                params.push('%4 Ngày%', '%5 Ngày%');
            } else if (duration.includes('Trên 5')) {
                query += ' AND (duration NOT LIKE ? AND duration NOT LIKE ? AND duration NOT LIKE ? AND duration NOT LIKE ? AND duration NOT LIKE ?)';
                params.push('%1 Ngày%', '%2 Ngày%', '%3 Ngày%', '%4 Ngày%', '%5 Ngày%');
            } else {
                query += ' AND duration LIKE ?';
                params.push(`%${duration.trim()}%`);
            }
        }

        query += ' ORDER BY id DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi truy vấn tours:", error.message);
        // Fallback data khi DB chưa chạy hoặc lỗi kết nối
        let fallbackTours = sampleTours.map((t, idx) => ({ id: idx + 1, ...t }));
        if (req.query.region && req.query.region !== 'Tất cả') {
            fallbackTours = fallbackTours.filter(t => t.region === req.query.region);
        }
        if (req.query.maxPrice && !isNaN(req.query.maxPrice)) {
            fallbackTours = fallbackTours.filter(t => t.price <= Number(req.query.maxPrice));
        }
        res.json(fallbackTours);
    }
};

// Lấy chi tiết 1 tour theo ID
const getTourById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM tours WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy thông tin tour" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi truy vấn chi tiết tour:", error.message);
        const fallbackTour = sampleTours.find((_, idx) => idx + 1 === Number(req.params.id)) || { id: Number(req.params.id), ...sampleTours[0] };
        res.json(fallbackTour);
    }
};

// Nạp/Reset dữ liệu mẫu (Seed API)
const seedData = async (req, res) => {
    try {
        await seedTours(true);
        res.json({ message: "Nạp dữ liệu mẫu thành công! Đã có 10 tour chuẩn 5 sao." });
    } catch (error) {
        console.error("Lỗi nạp seed:", error);
        res.status(500).json({ message: "Lỗi khi nạp dữ liệu mẫu" });
    }
};

// Admin: Thêm tour mới
const createTour = async (req, res) => {
    try {
        const { name, location, region, price, original_price, child_price, available_spots, departure_date, duration, category, image, gallery, badge, description, itinerary, included, excluded } = req.body;
        
        const galleryJson = typeof gallery === 'string' ? gallery : JSON.stringify(gallery || [image]);
        const itineraryJson = typeof itinerary === 'string' ? itinerary : JSON.stringify(itinerary || []);
        const includedJson = typeof included === 'string' ? included : JSON.stringify(included || []);
        const excludedJson = typeof excluded === 'string' ? excluded : JSON.stringify(excluded || []);

        const [result] = await pool.query(
            `INSERT INTO tours (name, location, region, price, original_price, child_price, available_spots, departure_date, duration, category, image, gallery, badge, description, itinerary, included, excluded)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, location, region || 'Miền Nam', price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, category, image, galleryJson, badge || 'Mới', description, itineraryJson, includedJson, excludedJson]
        );

        res.status(201).json({ message: "🎉 Thêm tour mới thành công!", tourId: result.insertId });
    } catch (error) {
        console.error("Lỗi thêm tour:", error.message);
        res.status(500).json({ message: "Lỗi máy chủ khi thêm tour" });
    }
};

// Admin: Cập nhật tour
const updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, region, price, original_price, child_price, available_spots, departure_date, duration, category, image, gallery, badge, description, itinerary, included, excluded } = req.body;

        const galleryJson = typeof gallery === 'string' ? gallery : JSON.stringify(gallery || [image]);
        const itineraryJson = typeof itinerary === 'string' ? itinerary : JSON.stringify(itinerary || []);
        const includedJson = typeof included === 'string' ? included : JSON.stringify(included || []);
        const excludedJson = typeof excluded === 'string' ? excluded : JSON.stringify(excluded || []);

        await pool.query(
            `UPDATE tours SET name=?, location=?, region=?, price=?, original_price=?, child_price=?, available_spots=?, departure_date=?, duration=?, category=?, image=?, gallery=?, badge=?, description=?, itinerary=?, included=?, excluded=?
             WHERE id=?`,
            [name, location, region || 'Miền Nam', price, original_price, child_price, available_spots, departure_date || '2026-08-15', duration, category, image, galleryJson, badge, description, itineraryJson, includedJson, excludedJson, id]
        );

        res.json({ message: "🎉 Cập nhật thông tin tour thành công!" });
    } catch (error) {
        console.error("Lỗi cập nhật tour:", error.message);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật tour" });
    }
};

// Admin: Xóa tour
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

module.exports = {
    getTours,
    getTourById,
    seedData,
    createTour,
    updateTour,
    deleteTour
};
