const { pool } = require('../../config/db');

// Lấy danh sách tour gợi ý cá nhân hóa dựa trên lịch sử hoạt động / đặt tour của người dùng
exports.getRecommendations = async (req, res) => {
    try {
        const { userId, email } = req.query;

        let recommendedTours = [];
        let matchReason = '';

        // Gọi AI Microservice (Python) - Hybrid Recommendation
        try {
            const fetchUserId = userId || 0;
            const aiResponse = await fetch(`http://ai-service:8000/recommend/home/${fetchUserId}`);
            if (aiResponse.ok) {
                    const aiData = await aiResponse.json();
                    const recommendedIds = aiData.tours || [];

                    if (recommendedIds.length > 0) {
                        const placeholders = recommendedIds.map(() => '?').join(',');
                        const [aiTours] = await pool.query(
                            `SELECT * FROM tours WHERE id IN (${placeholders})`,
                            recommendedIds
                        );
                        
                        // Sắp xếp lại theo đúng thứ tự AI trả về
                        recommendedTours = aiTours.sort((a, b) => recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id));
                        matchReason = aiData.method === 'popular-cold-start' ? '🔥 Top tour phổ biến' : '✨ Gợi ý riêng cho bạn';
                    }
                }
            } catch (aiError) {
                console.error('❌ Lỗi kết nối AI cho getRecommendations:', aiError.message);
                // Fallback nếu AI lỗi sẽ xử lý ở bên dưới
            }

        // Nếu chưa đủ tour cá nhân hóa, lấy top tour rating cao nhất
        if (recommendedTours.length < 3) {
            const [popular] = await pool.query(
                'SELECT * FROM tours ORDER BY rating DESC, reviews_count DESC LIMIT 4'
            );
            recommendedTours = popular;
            matchReason = '🔥 Top tour phổ biến';
        }

        res.json({
            tours: recommendedTours,
            matchReason
        });
    } catch (error) {
        console.error('❌ Lỗi lấy tour gợi ý:', error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Lấy danh sách tour phổ biến (Popular recommendations)
exports.getPopularRecommendations = async (req, res) => {
    try {
        const [popular] = await pool.query(
            'SELECT * FROM tours ORDER BY rating DESC, reviews_count DESC LIMIT 4'
        );
        res.json({
            tours: popular,
            matchReason: '🔥 Top tour bán chạy & đánh giá cao nhất'
        });
    } catch (error) {
        console.error('❌ Lỗi lấy tour phổ biến:', error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Lấy danh sách tour liên quan cùng khu vực hoặc thể loại (Fallback & Proxy to AI Service)
exports.getRelatedTours = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { userId } = req.query; // Có thể có hoặc không

        // Thử gọi AI Microservice (Python) - Chỉ dùng Content-Based cho section này
        try {
            const aiUrl = `http://ai-service:8000/recommend/tour/${tourId}`;
            const response = await fetch(aiUrl);
            if (response.ok) {
                const aiData = await response.json();
                const recommendedIds = aiData.tours || [];

                if (recommendedIds.length > 0) {
                    // Lấy đầy đủ thông tin của các tour từ database
                    const placeholders = recommendedIds.map(() => '?').join(',');
                    // Đảm bảo thứ tự gợi ý bằng FIELD()
                    const query = `SELECT * FROM tours WHERE id IN (${placeholders}) ORDER BY FIELD(id, ${placeholders})`;
                    const [tours] = await pool.query(query, [...recommendedIds, ...recommendedIds]);
                    
                    if (tours.length > 0) {
                        return res.json({
                            tours,
                            method: aiData.method || 'AI Recommendation'
                        });
                    }
                }
            }
        } catch (aiError) {
            console.error('⚠️ AI Service không phản hồi (Fallback sang SQL tĩnh):', aiError.message);
        }

        // Fallback: Tìm bằng SQL thuần nếu AI chết hoặc không tìm ra
        const [current] = await pool.query(`
            SELECT c.name as category, r.name as region
            FROM tours t
            LEFT JOIN tour_destination td ON t.id = td.tour_id AND td.is_primary = TRUE
            LEFT JOIN destination d ON td.destination_id = d.id
            LEFT JOIN country co ON d.country_id = co.id
            LEFT JOIN region r ON r.id = COALESCE(d.region_id, co.region_id)
            LEFT JOIN tourcategory c ON r.category_id = c.id
            WHERE t.id = ?
        `, [tourId]);

        if (current.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tour.' });
        }

        const { category, region } = current[0];
        
        // Tìm tour liên quan dựa trên category hoặc region mới
        const [related] = await pool.query(`
            SELECT t.* 
            FROM tours t
            LEFT JOIN tour_destination td ON t.id = td.tour_id AND td.is_primary = TRUE
            LEFT JOIN destination d ON td.destination_id = d.id
            LEFT JOIN country co ON d.country_id = co.id
            LEFT JOIN region r ON r.id = COALESCE(d.region_id, co.region_id)
            LEFT JOIN tourcategory c ON r.category_id = c.id
            WHERE t.id != ? AND (c.name = ? OR r.name = ?)
            ORDER BY t.rating DESC LIMIT 4
        `, [tourId, category || '', region || '']);

        res.json({ tours: related, method: 'SQL Fallback' });
    } catch (error) {
        console.error('❌ Lỗi lấy tour liên quan:', error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Ghi nhận hành vi người dùng (Tracking)
exports.trackInteraction = async (req, res) => {
    try {
        const { userId, tourId, interactionType } = req.body;
        
        if (!tourId || !interactionType) {
            return res.status(400).json({ message: 'Thiếu thông tin tourId hoặc interactionType' });
        }

        // Nếu không có userId (khách vãng lai), tạm thời có thể lưu session_id hoặc bỏ qua
        // Ở đây ta ưu tiên lưu khi có user đăng nhập để học hành vi
        if (!userId) {
            return res.status(200).json({ message: 'Bỏ qua tracking khách vãng lai' });
        }

        let weight = 1;
        if (interactionType === 'view') weight = 1;
        else if (interactionType === 'book') weight = 5;
        
        await pool.query(
            `INSERT INTO user_interactions (user_id, tour_id, interaction_type, weight) 
             VALUES (?, ?, ?, ?)`,
            [userId, tourId, interactionType, weight]
        );

        res.status(200).json({ message: 'Đã ghi nhận hành vi.' });
    } catch (error) {
        console.error('❌ Lỗi tracking hành vi:', error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};
