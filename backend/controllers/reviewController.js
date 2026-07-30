const { pool } = require('../config/db');

// Lấy danh sách đánh giá của 1 tour
exports.getReviewsByTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const [reviews] = await pool.query(
            'SELECT * FROM reviews WHERE tour_id = ? ORDER BY created_at DESC',
            [tourId]
        );
        res.json(reviews);
    } catch (error) {
        console.error('❌ Lỗi lấy nhận xét:', error.message);
        res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách nhận xét.' });
    }
};

// Kiểm tra điều kiện đánh giá (chỉ sau khi đặt hàng xong và trải nghiệm dịch vụ)
exports.checkEligibility = async (req, res) => {
    try {
        const { tourId, userId, email } = req.query;

        if (!userId && !email) {
            return res.json({ 
                canReview: false, 
                reason: 'Vui lòng đăng nhập tài khoản khách hàng để kiểm tra quyền đánh giá!' 
            });
        }

        // Kiểm tra xem khách đã đặt tour này chưa
        const [bookings] = await pool.query(
            `SELECT id, departure_date, status FROM bookings 
             WHERE tour_id = ? AND (user_id = ? OR user_email = ?) 
             ORDER BY id DESC`,
            [tourId, userId || 0, email || '']
        );

        if (bookings.length === 0) {
            return res.json({ 
                canReview: false, 
                reason: 'Vui lòng đặt tour để có thể đánh giá' 
            });
        }

        // Kiểm tra xem có đơn hàng nào đã hoàn thành
        const completedBookings = bookings.filter(b => b.status === 'Đã hoàn thành').length;

        if (completedBookings === 0) {
            return res.json({ 
                canReview: false, 
                reason: 'Chỉ những khách hàng đã trải nghiệm và hoàn thành tour mới có thể đánh giá.' 
            });
        }

        // Kiểm tra xem người dùng đã review bao nhiêu lần cho tour này
        const [existingReviews] = await pool.query(
            `SELECT id FROM reviews WHERE tour_id = ? AND (user_id = ? OR user_email = ?)`,
            [tourId, userId || 0, email || '']
        );

        // Mỗi lần hoàn thành tour chỉ được đánh giá 1 lần
        if (existingReviews.length >= completedBookings) {
            return res.json({ 
                canReview: false, 
                reason: 'Bạn đã hoàn thành đánh giá cho chuyến đi này.' 
            });
        }

        return res.json({ 
            canReview: true, 
            message: '🎉 Bạn đã đặt tour này, có thể viết nhận xét & đánh giá ngay.' 
        });
    } catch (error) {
        console.error('❌ Lỗi kiểm tra điều kiện đánh giá:', error.message);
        res.status(500).json({ canReview: false, reason: 'Lỗi máy chủ kiểm tra quyền đánh giá.' });
    }
};

// Thêm đánh giá mới & cập nhật lại rating trung bình cho tour
exports.createReview = async (req, res) => {
    try {
        const { tour_id, user_id, user_email, user_name, user_avatar, rating, comment } = req.body;

        if (!tour_id || !user_name || !comment) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin đánh giá!' });
        }

        // Kiểm tra bảo mật phía backend: bắt buộc phải có đơn đặt tour (tạm thời cho phép ngay sau khi đặt, không bị hủy)
        const [bookings] = await pool.query(
            `SELECT id, departure_date, status FROM bookings 
             WHERE tour_id = ? AND (user_id = ? OR user_email = ?)`,
            [tour_id, user_id || 0, user_email || '']
        );

        if (bookings.length === 0) {
            return res.status(403).json({ message: 'Vui lòng đặt tour để có thể đánh giá' });
        }

        const completedBookings = bookings.filter(b => b.status === 'Đã hoàn thành').length;

        if (completedBookings === 0) {
            return res.status(403).json({ message: 'Chỉ những khách hàng đã trải nghiệm và hoàn thành tour mới có thể đánh giá.' });
        }

        // Kiểm tra xem người dùng đã review bao nhiêu lần cho tour này
        const [existingReviews] = await pool.query(
            `SELECT id FROM reviews WHERE tour_id = ? AND (user_id = ? OR user_email = ?)`,
            [tour_id, user_id || 0, user_email || '']
        );

        if (existingReviews.length >= completedBookings) {
            return res.status(403).json({ message: 'Bạn đã hoàn thành đánh giá cho chuyến đi này.' });
        }

        const validRating = Number(rating) || 5;

        // Thêm nhận xét vào bảng reviews
        const [result] = await pool.query(
            `INSERT INTO reviews (tour_id, user_id, user_name, user_avatar, rating, comment) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                tour_id,
                user_id || null,
                user_name,
                user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
                validRating,
                comment
            ]
        );

        // Tính lại trung bình cộng rating và tổng số đánh giá của tour
        const [stats] = await pool.query(
            'SELECT AVG(rating) as avgRating, COUNT(*) as totalReviews FROM reviews WHERE tour_id = ?',
            [tour_id]
        );

        let newAvgRating = parseFloat(stats[0].avgRating || validRating).toFixed(1);
        let newTotalReviews = stats[0].totalReviews || 1;

        await pool.query(
            'UPDATE tours SET rating = ?, reviews_count = ? WHERE id = ?',
            [newAvgRating, newTotalReviews, tour_id]
        );

        // Trả về nhận xét vừa tạo
        const [newReview] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);

        res.status(201).json({
            message: '🎉 Thêm nhận xét & đánh giá thành công!',
            review: newReview[0],
            newRating: newAvgRating,
            newReviewsCount: newTotalReviews
        });
    } catch (error) {
        console.error('❌ Lỗi thêm nhận xét:', error.message);
        res.status(500).json({ message: 'Lỗi máy chủ khi lưu nhận xét.' });
    }
};
