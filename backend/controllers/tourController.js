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

// Lấy dữ liệu Metadata cho Taxonomy (Phân cấp & Tagging)
const getMetadata = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM TourCategory');
        const [regions] = await pool.query('SELECT * FROM Region');
        const [destinations] = await pool.query('SELECT * FROM Destination');
        const [tourTypes] = await pool.query('SELECT * FROM TourType');
        const [occasions] = await pool.query('SELECT * FROM Occasion');

        res.json({
            categories,
            regions,
            destinations,
            tourTypes,
            occasions
        });
    } catch (error) {
        console.error('Lỗi lấy metadata:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy metadata' });
    }
};

// Tạo Tour Mới theo cấu trúc Schema V2 (Database Transaction)
const createTourV2 = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            title, description, status,
            start_date, duration, price_adult, price_child, max_seats,
            destination_id, tour_types, occasions,
            images, itinerary
        } = req.body;

        // 1. Insert vào bảng Tour_v2
        const [tourResult] = await connection.query(`
            INSERT INTO Tour_v2 
            (destination_id, title, price_adult, price_child, start_date, max_seats, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            destination_id || 1,
            title || 'Tour Không tên',
            price_adult || 0,
            price_child || 0,
            start_date || new Date().toISOString().split('T')[0],
            max_seats || 30,
            status || 'Active'
        ]);

        const tourId = tourResult.insertId;

        // 2. Insert vào bảng Tour_TourType (Pivot)
        if (Array.isArray(tour_types) && tour_types.length > 0) {
            for (const typeId of tour_types) {
                await connection.query(
                    'INSERT INTO Tour_TourType (tour_id, type_id) VALUES (?, ?)',
                    [tourId, typeId]
                );
            }
        }

        // 3. Insert vào bảng Tour_Occasion (Pivot)
        if (Array.isArray(occasions) && occasions.length > 0) {
            for (const occId of occasions) {
                await connection.query(
                    'INSERT INTO Tour_Occasion (tour_id, occasion_id) VALUES (?, ?)',
                    [tourId, occId]
                );
            }
        }

        // 4. Insert vào bảng TourImages
        if (Array.isArray(images) && images.length > 0) {
            for (const img of images) {
                await connection.query(
                    'INSERT INTO TourImages (tour_id, image_url, is_main) VALUES (?, ?, ?)',
                    [tourId, img.url, img.isMain ? 1 : 0]
                );
            }
        }

        // 5. Đồng bộ sang bảng tours cũ để hiển thị ở frontend danh sách
        try {
            const mainImg = Array.isArray(images) && images.length > 0
                ? (images.find(img => img.isMain)?.url || images[0]?.url)
                : '/images/destinations/danang.jpg';

            await connection.query(
                `INSERT INTO tours (id, name, location, region, price, child_price, available_spots, departure_date, duration, category, image, description, itinerary)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    tourId, // Keep IDs in sync
                    title || 'Tour Không tên',
                    'Việt Nam', // Placeholder for legacy location
                    'Miền Trung', // Placeholder for legacy region
                    price_adult || 0,
                    price_child || 0,
                    max_seats || 30,
                    start_date || new Date().toISOString().split('T')[0],
                    duration || '3 Ngày 2 Đêm',
                    'Trong nước', // Placeholder for legacy category
                    mainImg,
                    description,
                    JSON.stringify(itinerary || [])
                ]
            );
        } catch (syncError) {
            console.error("Lỗi đồng bộ sang bảng tours cũ:", syncError);
            // Non-blocking error, allow transaction to commit for V2
        }

        await connection.commit();
        res.json({ message: "✅ Tạo Tour V2 thành công!", tourId });
    } catch (error) {
        await connection.rollback();
        console.error("Lỗi khi tạo tour V2 (Transaction Rolled Back):", error);
        res.status(500).json({ message: "Lỗi tạo tour V2" });
    } finally {
        connection.release();
    }
};

// Quick Add Destination
const createDestination = async (req, res) => {
    try {
        const { region_id, name } = req.body;
        if (!region_id || !name) {
            return res.status(400).json({ message: "Thiếu thông tin region_id hoặc name" });
        }

        const [result] = await pool.query(
            'INSERT INTO Destination (region_id, name) VALUES (?, ?)',
            [region_id, name]
        );

        res.status(201).json({
            message: "Tạo điểm đến thành công",
            destination: { id: result.insertId, region_id, name }
        });
    } catch (error) {
        console.error("Lỗi tạo điểm đến:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi tạo điểm đến mới" });
    }
};

// Admin: Cập nhật điểm đến
const updateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const { region_id, name } = req.body;
        if (!region_id || !name) {
            return res.status(400).json({ message: "Thiếu thông tin region_id hoặc name" });
        }

        await pool.query(
            'UPDATE Destination SET region_id = ?, name = ? WHERE id = ?',
            [region_id, name, id]
        );

        res.json({ message: "Cập nhật điểm đến thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật điểm đến:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật điểm đến" });
    }
};

// Admin: Xóa điểm đến
const deleteDestination = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM Destination WHERE id = ?', [id]);
        res.json({ message: "Đã xóa điểm đến khỏi hệ thống!" });
    } catch (error) {
        console.error("Lỗi xóa điểm đến:", error.message);
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(400).json({ message: "Không thể xóa điểm đến này vì đang được sử dụng trong các Tour." });
        }
        res.status(500).json({ message: "Lỗi máy chủ khi xóa điểm đến" });
    }
};

// ================= QUẢN LÝ NHÃN (TAGS) =================

// Admin: Tạo Nhãn (TourType hoặc Occasion)
const createTag = async (req, res) => {
    try {
        const { category, name } = req.body;
        if (!name) return res.status(400).json({ message: "Thiếu tên nhãn" });

        let result;
        if (category === 'type') {
            [result] = await pool.query('INSERT INTO TourType (name) VALUES (?)', [name]);
        } else if (category === 'occasion') {
            [result] = await pool.query('INSERT INTO Occasion (name) VALUES (?)', [name]);
        } else {
            return res.status(400).json({ message: "Category không hợp lệ (type/occasion)" });
        }

        res.status(201).json({ message: "Tạo nhãn thành công", tag: { id: result.insertId, name, category } });
    } catch (error) {
        console.error("Lỗi tạo tag:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi tạo nhãn" });
    }
};

// Admin: Cập nhật Nhãn
const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, name } = req.body;

        if (category === 'type') {
            await pool.query('UPDATE TourType SET name = ? WHERE id = ?', [name, id]);
        } else if (category === 'occasion') {
            await pool.query('UPDATE Occasion SET name = ? WHERE id = ?', [name, id]);
        } else {
            return res.status(400).json({ message: "Category không hợp lệ" });
        }

        res.json({ message: "Cập nhật nhãn thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật tag:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật nhãn" });
    }
};

// Admin: Xóa Nhãn
const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.query; // Vì là DELETE, dùng query param

        if (category === 'type') {
            await pool.query('DELETE FROM TourType WHERE id = ?', [id]);
        } else if (category === 'occasion') {
            await pool.query('DELETE FROM Occasion WHERE id = ?', [id]);
        } else {
            return res.status(400).json({ message: "Category không hợp lệ" });
        }

        res.json({ message: "Xóa nhãn thành công" });
    } catch (error) {
        console.error("Lỗi xóa tag:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi xóa nhãn" });
    }
};

module.exports = {
    getTours,
    getTourById,
    seedData,
    createTour,
    updateTour,
    deleteTour,
    getMetadata,
    createTourV2,
    createDestination,
    updateDestination,
    deleteDestination,
    createTag,
    updateTag,
    deleteTag
};
