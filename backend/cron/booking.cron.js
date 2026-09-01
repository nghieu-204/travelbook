const cron = require('node-cron');
const { pool } = require('../config/db');
const { BOOKING_STATUS } = require('../config/constants');

const updateCompletedBookings = async () => {
    try {
        console.log('[CRON] Đang kiểm tra và cập nhật trạng thái đơn đặt tour...');
        
        // Lấy tất cả bookings đang ở trạng thái CONFIRMED hoặc ONGOING, kèm theo thời lượng (duration) của tour
        const [bookings] = await pool.query(`
            SELECT b.id, b.departure_date, b.status, t.duration
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            WHERE b.status IN (?, ?)
        `, [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ONGOING]);

        if (bookings.length === 0) {
            console.log('[CRON] Không có đơn đặt tour nào cần xử lý.');
            return;
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Chỉ quan tâm đến ngày hiện tại

        let updatedToOngoing = 0;
        let updatedToCompleted = 0;

        for (const booking of bookings) {
            const departureDate = new Date(booking.departure_date);
            departureDate.setHours(0, 0, 0, 0);

            // Bóc tách số ngày từ duration, ví dụ "3 Ngày 2 Đêm" -> 3
            // Nếu không lấy được, mặc định là 1 ngày
            let durationDays = 1;
            const match = booking.duration && booking.duration.match(/(\d+)\s*ng[aà]y/i);
            if (match && match[1]) {
                durationDays = parseInt(match[1]);
            } else {
                console.warn(`[CRON] Không parse được duration "${booking.duration}" cho booking #${booking.id}, mặc định 1 ngày`);
            }

            // Tính ngày kết thúc (endDate = departureDate + durationDays)
            // Ví dụ: đi ngày 1/1, tour 3 ngày -> ngày 4/1 là ngày kết thúc (lúc đó tour đã hoàn thành)
            const endDate = new Date(departureDate);
            endDate.setDate(endDate.getDate() + durationDays);

            if (now >= endDate && booking.status !== BOOKING_STATUS.COMPLETED) {
                // Tour đã kết thúc -> Cập nhật thành COMPLETED
                await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [BOOKING_STATUS.COMPLETED, booking.id]);
                updatedToCompleted++;
            } 
            else if (now >= departureDate && now < endDate && booking.status === BOOKING_STATUS.CONFIRMED) {
                // Đã đến ngày khởi hành nhưng chưa kết thúc -> Cập nhật thành ONGOING
                await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [BOOKING_STATUS.ONGOING, booking.id]);
                updatedToOngoing++;
            }
        }

        console.log(`[CRON] Hoàn tất. Đã chuyển ${updatedToOngoing} đơn sang Đang diễn ra, ${updatedToCompleted} đơn sang Đã hoàn thành.`);

    } catch (error) {
        console.error('[CRON] Lỗi cập nhật trạng thái đơn đặt tour:', error);
    }
};

// Thiết lập chạy Cron mỗi 15 phút
const startCronJobs = () => {
    cron.schedule('*/15 * * * *', updateCompletedBookings);
    console.log('✅ Background Cron Jobs initialized (Booking Status update every 15 minutes).');
};

module.exports = {
    startCronJobs,
    updateCompletedBookings // Export để có thể gọi thủ công nếu cần
};
