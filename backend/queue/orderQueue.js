const { pool } = require('../config/db');
const { BOOKING_STATUS } = require('../config/constants');

// In-memory Scheduler thay thế cho Redis Key-Space Notification
const schedulePaymentTimeout = (bookingId, totalPeople, tourId, timeoutMs = 1 * 60 * 1000) => {
    console.log(`⏳ [QUEUE] Đã lên lịch Timeout ${timeoutMs / 60000} phút cho đơn hàng TB-${bookingId}`);

    setTimeout(async () => {
        try {
            // Kiểm tra trạng thái đơn hàng hiện tại
            const [rows] = await pool.query('SELECT status FROM bookings WHERE id = ?', [bookingId]);
            if (rows.length === 0) return;

            const currentStatus = rows[0].status;

            // Nếu vẫn đang chờ thanh toán thì Hủy
            if (currentStatus === BOOKING_STATUS.PENDING_PAYMENT) {
                console.log(`⏰ [QUEUE] Đơn hàng TB-${bookingId} đã HẾT HẠN thanh toán. Đang hủy...`);

                // 1. Cập nhật trạng thái
                await pool.query(`
                    UPDATE bookings 
                    SET status = '${BOOKING_STATUS.CANCELLED}', payment_status = 'Thanh toán thất bại' 
                    WHERE id = ?
                `, [bookingId]);

                // 2. Nhả chỗ
                await pool.query(`
                    UPDATE tours 
                    SET available_spots = available_spots + ? 
                    WHERE id = ?
                `, [totalPeople, tourId]);

                // 3. Lưu vết Audit Trail
                await pool.query(`
                    INSERT INTO order_logs (booking_id, action, description) 
                    VALUES (?, 'CANCELLED_BY_TIMEOUT', 'Hệ thống tự động hủy đơn do quá hạn thanh toán 1 phút (Test Mode).')
                `, [bookingId]);

                console.log(`✅ [QUEUE] Đã hủy đơn TB-${bookingId} và hoàn lại ${totalPeople} chỗ.`);
            }
        } catch (error) {
            console.error(`❌ [QUEUE] Lỗi khi xử lý Timeout cho đơn TB-${bookingId}:`, error);
        }
    }, timeoutMs);
};

// Khôi phục các đơn hàng đang chờ khi Server khởi động lại (Persistence)
const recoverPendingOrders = async () => {
    try {
        const [pendingBookings] = await pool.query(`
            SELECT id, tour_id, (adults + children) as totalPeople, created_at 
            FROM bookings 
            WHERE status = '${BOOKING_STATUS.PENDING_PAYMENT}'
        `);

        for (const booking of pendingBookings) {
            const timePassed = Date.now() - new Date(booking.created_at).getTime();
            const timeoutMs = 1 * 60 * 1000;
            const remainingTime = timeoutMs - timePassed;

            if (remainingTime <= 0) {
                // Đã quá hạn trong lúc server tắt -> Kích hoạt Hủy ngay lập tức
                schedulePaymentTimeout(booking.id, booking.totalPeople, booking.tour_id, 0);
            } else {
                // Vẫn còn thời gian -> Lên lịch lại
                schedulePaymentTimeout(booking.id, booking.totalPeople, booking.tour_id, remainingTime);
            }
        }
    } catch (error) {
        console.error("❌ Lỗi khi khôi phục Timeout Queue:", error);
    }
};

module.exports = { schedulePaymentTimeout, recoverPendingOrders };
