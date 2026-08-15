const { pool } = require('../../config/db');

// GET /api/locations/hierarchy
const getHierarchy = async (req, res) => {
    try {
        // Lấy tất cả Category
        const [categories] = await pool.query('SELECT * FROM TourCategory');
        // Lấy tất cả Region
        const [regions] = await pool.query('SELECT * FROM Region');
        // Lấy tất cả Destination
        const [destinations] = await pool.query('SELECT * FROM Destination');

        // Xây dựng cây phân cấp (Tree)
        const hierarchy = categories.map(cat => {
            return {
                id: cat.id,
                name: cat.name,
                regions: regions
                    .filter(reg => reg.category_id === cat.id)
                    .map(reg => {
                        return {
                            id: reg.id,
                            name: reg.name,
                            destinations: destinations
                                .filter(dest => dest.region_id === reg.id)
                                .map(dest => ({
                                    id: dest.id,
                                    name: dest.name,
                                    image_url: dest.image_url || null
                                }))
                        };
                    })
            };
        });

        res.json({
            success: true,
            data: hierarchy
        });
    } catch (error) {
        console.error('Lỗi khi lấy location hierarchy:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy dữ liệu địa lý' });
    }
};

module.exports = {
    getHierarchy
};
