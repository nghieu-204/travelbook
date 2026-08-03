const { pool } = require('../../config/db');

const getAdminStats = async (req, res) => {
    try {
        const [revRows] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM bookings WHERE status = 'Đã xác nhận'");
        const [bookRows] = await pool.query("SELECT COUNT(*) as total_bookings FROM bookings");
        const [tourRows] = await pool.query("SELECT COUNT(*) as active_tours FROM tours");
        const [pendRows] = await pool.query("SELECT COUNT(*) as pending_bookings FROM bookings WHERE status = 'Đang chờ xác nhận'");
        const [userRows] = await pool.query("SELECT COUNT(*) as total_users FROM users WHERE role != 'admin'");

        // Doanh thu theo tháng (những đơn đã xác nhận)
        const [monthRows] = await pool.query(`
            SELECT DATE_FORMAT(departure_date, '%m/%Y') as month, 
                   COALESCE(SUM(total_price), 0) as revenue,
                   COUNT(*) as bookings_count
            FROM bookings 
            WHERE status = 'Đã xác nhận'
            GROUP BY month 
            ORDER BY MIN(departure_date) ASC 
            LIMIT 12
        `);

        // Phân loại đơn đặt tour theo khu vực dựa trên cấu trúc chuẩn của DB
        const [regionRows] = await pool.query(`
            SELECT 
                COALESCE(c.name, 'Chưa phân loại') as calc_category,
                COALESCE(r.name, 'Chưa phân loại') as region_name,
                COUNT(b.id) as count
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            LEFT JOIN Tour_Destination td ON t.id = td.tour_id AND td.is_primary = TRUE
            LEFT JOIN destination d ON td.destination_id = d.id
            LEFT JOIN region r ON d.region_id = r.id
            LEFT JOIN tourcategory c ON r.category_id = c.id
            WHERE b.status != 'Hủy'
            GROUP BY calc_category, region_name
        `);

        // Phương thức thanh toán phổ biến (Paypal, Momo, Chuyển khoản QR...)
        const [payRows] = await pool.query(`
            SELECT COALESCE(payment_method, 'Chuyển khoản ngân hàng / QR Code') as method, COUNT(*) as count 
            FROM bookings 
            GROUP BY method
        `);

        // Sức chứa tour và số chỗ đã đặt (Top tours được đặt nhiều nhất)
        const [spotsRows] = await pool.query(`
            SELECT t.id, t.name, COALESCE(t.available_spots, 30) as available_spots, 
                   COALESCE(SUM(CASE WHEN b.status != 'Hủy' THEN (b.adults + b.children) ELSE 0 END), 0) as booked_spots,
                   (SELECT d.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS location,
                   (SELECT r.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS region
            FROM tours t
            LEFT JOIN bookings b ON t.id = b.tour_id
            GROUP BY t.id, t.name, t.available_spots
            ORDER BY booked_spots DESC, t.id ASC
            LIMIT 10
        `);

        // Danh sách đơn chờ xác nhận
        const [pendingList] = await pool.query(`
            SELECT b.id, b.user_name, b.tour_name, b.total_price, b.status 
            FROM bookings b 
            WHERE b.status = 'Đang chờ xác nhận' OR b.status = 'pending' OR b.status = 'Chờ xử lý' 
            ORDER BY b.created_at DESC 
            LIMIT 5
        `);

        res.json({
            kpi: {
                total_revenue: revRows[0].total_revenue,
                total_bookings: bookRows[0].total_bookings,
                active_tours: tourRows[0].active_tours,
                pending_bookings: pendRows[0].pending_bookings,
                total_users: userRows[0].total_users
            },
            monthly_analytics: monthRows,
            region_analytics: regionRows,
            payment_analytics: payRows,
            capacity_analytics: spotsRows,
            pending_bookings_list: pendingList
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu thống kê Admin:", error.message);
        res.status(500).json({ message: "Lỗi máy chủ khi truy xuất thống kê" });
    }
};

module.exports = {
    getAdminStats
};
