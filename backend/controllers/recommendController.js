const { pool } = require('../config/db');

// Lấy danh sách tour gợi ý cá nhân hóa dựa trên lịch sử hoạt động / đặt tour của người dùng
exports.getRecommendations = async (req, res) => {
    try {
        const { userId, email } = req.query;

        let recommendedTours = [];
        let matchReason = '⭐ Tour phổ biến được yêu thích nhất';

        if (userId || email) {
            // Tìm các tour người dùng từng đặt trong bookings
            const [userBookings] = await pool.query(
                `SELECT DISTINCT t.region, t.category 
                 FROM bookings b 
                 JOIN tours t ON b.tour_id = t.id 
                 WHERE b.user_id = ? OR b.user_email = ?`,
                [userId || 0, email || '']
            );

            if (userBookings.length > 0) {
                const regions = [...new Set(userBookings.map(b => b.region).filter(Boolean))];
                const categories = [...new Set(userBookings.map(b => b.category).filter(Boolean))];

                let queryConditions = [];
                let queryParams = [];

                if (regions.length > 0) {
                    queryConditions.push(`region IN (${regions.map(() => '?').join(',')})`);
                    queryParams.push(...regions);
                }
                if (categories.length > 0) {
                    queryConditions.push(`category IN (${categories.map(() => '?').join(',')})`);
                    queryParams.push(...categories);
                }

                if (queryConditions.length > 0) {
                    const [personalized] = await pool.query(
                        `SELECT * FROM tours WHERE ${queryConditions.join(' OR ')} ORDER BY rating DESC, reviews_count DESC LIMIT 6`,
                        queryParams
                    );

                    if (personalized.length >= 2) {
                        recommendedTours = personalized;
                        matchReason = `✨ Phù hợp với sở thích (${categories[0] || regions[0]}) của bạn`;
                    }
                }
            }
        }

        // Nếu chưa đủ tour cá nhân hóa, lấy top tour rating cao nhất
        if (recommendedTours.length < 3) {
            const [popular] = await pool.query(
                'SELECT * FROM tours ORDER BY rating DESC, reviews_count DESC LIMIT 6'
            );
            recommendedTours = popular;
        }

        res.json({
            tours: recommendedTours,
            matchReason
        });
    } catch (error) {
        console.error('❌ Lỗi lấy tour gợi ý:', error.message);
        res.status(500).json({ message: 'Lỗi máy chủ khi tải tour gợi ý.' });
    }
};

// Lấy danh sách tour phổ biến (Popular recommendations)
exports.getPopularRecommendations = async (req, res) => {
    try {
        const [popular] = await pool.query(
            'SELECT * FROM tours ORDER BY rating DESC, reviews_count DESC LIMIT 6'
        );
        res.json({
            tours: popular,
            matchReason: '🔥 Top tour bán chạy & đánh giá cao nhất'
        });
    } catch (error) {
        console.error('❌ Lỗi lấy tour phổ biến:', error.message);
        res.status(500).json({ message: 'Lỗi máy chủ khi tải tour phổ biến.' });
    }
};

// Lấy danh sách tour liên quan cùng khu vực hoặc thể loại
exports.getRelatedTours = async (req, res) => {
    try {
        const { tourId } = req.params;
        const [current] = await pool.query('SELECT category, region FROM tours WHERE id = ?', [tourId]);

        if (current.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tour.' });
        }

        const { category, region } = current[0];
        const [related] = await pool.query(
            'SELECT * FROM tours WHERE id != ? AND (category = ? OR region = ?) ORDER BY rating DESC LIMIT 4',
            [tourId, category || '', region || '']
        );

        res.json(related);
    } catch (error) {
        console.error('❌ Lỗi lấy tour liên quan:', error.message);
        res.status(500).json({ message: 'Lỗi máy chủ khi tải tour liên quan.' });
    }
};
