const { pool } = require('../../config/db');
const { sendInvoiceEmail, createBookingProcess } = require('./booking.service');


// Đặt tour (Create Booking)
const createBooking = async (req, res) => {
    try {
        const result = await createBookingProcess(req.body);
        res.status(201).json({
            message: "🎉 Đặt tour thành công! Chúng tôi sẽ liên hệ sớm nhất để xác nhận.",
            ...result
        });
    } catch (error) {
        console.error("Lỗi đặt tour:", error);
        if (error.message.startsWith('NOT_FOUND')) {
            return res.status(404).json({ message: error.message.split(':')[1] });
        }
        if (error.message.startsWith('BAD_REQUEST')) {
            return res.status(400).json({ message: error.message.split(':')[1] });
        }
        res.status(500).json({ message: "Lỗi kết nối khi đặt tour. Vui lòng thử lại!" });
    }
};

// Lấy lịch sử đặt tour theo ID người dùng
const getBookingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // ------------- TỰ ĐỘNG SỬA DỮ LIỆU CŨ (SELF-HEALING) -------------
        try {
            const [reviews] = await pool.query('SELECT tour_id, COUNT(*) as count FROM reviews WHERE user_id = ? GROUP BY tour_id', [userId]);
            for (const rev of reviews) {
                const [reviewed] = await pool.query(`
                    SELECT COUNT(*) as reviewed_count FROM bookings 
                    WHERE user_id = ? AND tour_id = ? AND status = 'Đã hoàn thành' AND is_reviewed = TRUE
                `, [userId, rev.tour_id]);
                
                const needed = rev.count - (reviewed[0].reviewed_count || 0);
                if (needed > 0) {
                    const [unreviewed] = await pool.query(`
                        SELECT id FROM bookings 
                        WHERE user_id = ? AND tour_id = ? AND status = 'Đã hoàn thành' AND is_reviewed = FALSE
                        LIMIT ?
                    `, [userId, rev.tour_id, needed]);
                    
                    if (unreviewed.length > 0) {
                        const ids = unreviewed.map(b => b.id);
                        await pool.query(`UPDATE bookings SET is_reviewed = TRUE WHERE id IN (?)`, [ids]);
                    }
                }
            }
        } catch (fixErr) {
            console.error("Lỗi fix data:", fixErr.message);
        }
        // ---------------------------------------------------

        const [rows] = await pool.query(`
            SELECT b.*, t.image as tour_image, t.duration
            FROM bookings b 
            LEFT JOIN tours t ON b.tour_id = t.id 
            WHERE b.user_id = ? 
            ORDER BY b.created_at DESC
        `, [userId]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const processedRows = rows.map(booking => {
            if (booking.status === 'Hủy' || booking.status === 'Đang chờ xác nhận' || booking.status === 'Đang chờ thanh toán') {
                return booking;
            }

            if (booking.departure_date) {
                const startDate = new Date(booking.departure_date);
                startDate.setHours(0, 0, 0, 0);

                let endDate = new Date(startDate);
                if (booking.duration) {
                    const daysMatch = booking.duration.match(/(\d+)\s*ngày/i);
                    if (daysMatch && daysMatch[1]) {
                        const days = parseInt(daysMatch[1]);
                        endDate.setDate(endDate.getDate() + days - 1);
                    }
                }

                if (today < startDate) {
                    booking.status = 'Đã xác nhận';
                } else if (today >= startDate && today <= endDate) {
                    booking.status = 'Đang diễn ra';
                } else if (today > endDate) {
                    booking.status = 'Đã hoàn thành';
                }
            }
            return booking;
        });

        res.json(processedRows);
    } catch (error) {
        console.error("Lỗi lấy lịch sử đặt tour:", error.message);
        res.json([]);
    }
};

// Hủy đặt tour (Cancel Booking)
const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { user_id, cancel_reason } = req.body;

        // 1. Fetch booking
        const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn đặt tour.' });
        }

        const booking = bookings[0];

        // 2. Validate user (security)
        if (booking.user_id !== parseInt(user_id)) {
            return res.status(403).json({ message: 'Không có quyền hủy đơn này.' });
        }

        // 3. Time-based rule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const departureDate = new Date(booking.departure_date);
        departureDate.setHours(0, 0, 0, 0);

        const diffTime = departureDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 3) {
            return res.status(400).json({ message: 'Sắp đến giờ khởi hành (dưới 3 ngày). Vui lòng liên hệ Hotline 1900 8888 để được hỗ trợ.' });
        }

        const totalPeople = (booking.adults || 1) + (booking.children || 0);

        // 4. Payment status rule
        // Sometimes payment_status might be null/empty, we should also check if status is 'Đang chờ thanh toán'
        const isPending = booking.payment_status === 'Chưa thanh toán' || booking.status === 'Đang chờ xác nhận' || booking.status === 'Đang chờ thanh toán';

        if (isPending) {
            // Pending: Cancel immediately
            await pool.query('UPDATE bookings SET status = ?, cancel_reason = ? WHERE id = ?', ['Hủy', cancel_reason, bookingId]);
            // Restore spots
            await pool.query('UPDATE tours SET available_spots = available_spots + ? WHERE id = ?', [totalPeople, booking.tour_id]);
            // Log
            await pool.query(
                `INSERT INTO order_logs (booking_id, action, description) VALUES (?, ?, ?)`,
                [bookingId, 'CANCELED_PENDING', `Khách hàng tự hủy đơn chưa thanh toán. Lý do: ${cancel_reason}`]
            );
            return res.json({ message: 'Hủy đơn thành công.' });
        } else {
            // Paid: Change status to 'Yêu cầu hủy'
            await pool.query('UPDATE bookings SET status = ?, cancel_reason = ? WHERE id = ?', ['Yêu cầu hủy', cancel_reason, bookingId]);
            // Do not restore spots yet
            // Log
            await pool.query(
                `INSERT INTO order_logs (booking_id, action, description) VALUES (?, ?, ?)`,
                [bookingId, 'CANCELLATION_REQUESTED', `Khách hàng yêu cầu hủy đơn đã thanh toán. Lý do: ${cancel_reason}`]
            );
            return res.json({ message: 'Đã gửi yêu cầu hủy. Hệ thống sẽ xử lý hoàn tiền theo chính sách.' });
        }

    } catch (error) {
        console.error("Lỗi hủy tour:", error);
        res.status(500).json({ message: "Lỗi kết nối khi hủy tour. Vui lòng thử lại!" });
    }
};

module.exports = {
    createBooking,
    getBookingsByUser,
    cancelBooking,
    sendInvoiceEmail
};
