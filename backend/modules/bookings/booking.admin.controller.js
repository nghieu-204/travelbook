const { pool } = require('../../config/db');
const { sendInvoiceEmail } = require('./booking.service');

// Admin: Lấy toàn bộ danh sách Booking trên hệ thống
const getAllBookings = async (req, res) => {
    try {
        const query = `
            SELECT b.*, t.tour_code, t.duration
            FROM bookings b 
            LEFT JOIN tours t ON b.tour_id = t.id 
            WHERE b.status != 'Đang chờ thanh toán'
            ORDER BY b.created_at DESC
        `;
        const [rows] = await pool.query(query);

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
        console.error("Lỗi lấy toàn bộ bookings:", error.message);
        res.status(500).json({ message: "Lỗi truy xuất đơn hàng" });
    }
};

// Admin: Duyệt / Cập nhật trạng thái Booking & Tự động gửi Email Hóa đơn
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Đã xác nhận', 'Hủy', 'Đang chờ xác nhận'

        await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

        let actionCode = 'UPDATED_STATUS';
        if (status === 'Đã xác nhận') actionCode = 'CONFIRMED_BY_ADMIN';
        if (status === 'Hủy') actionCode = 'CANCELLED_BY_ADMIN';

        await pool.query(
            `INSERT INTO order_logs (booking_id, action, description) VALUES (?, ?, ?)`,
            [id, actionCode, `Admin đã đổi trạng thái đơn hàng thành: ${status}`]
        );

        const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        const booking = rows[0];

        let invoiceHtml = null;
        if (status === 'Đã xác nhận') {
            invoiceHtml = await sendInvoiceEmail(booking);
        }

        res.json({
            message: status === 'Đã xác nhận' ? `🎉 Đã xác nhận đơn đặt tour #TB-${id} và gửi hóa đơn Email!` : `✅ Cập nhật trạng thái đơn hàng #TB-${id} thành: ${status}`,
            booking: booking,
            invoiceHtml: invoiceHtml
        });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái booking:", error.message);
        res.status(500).json({ message: "Lỗi máy chủ khi xử lý đơn hàng" });
    }
};

const sendInvoiceManual = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        const booking = rows[0];
        const invoiceHtml = await sendInvoiceEmail(booking);

        res.json({
            message: `📧 Đã tự động gửi hóa đơn Email đến (${booking.user_email}) thành công!`,
            booking: booking,
            invoiceHtml: invoiceHtml
        });
    } catch (error) {
        console.error("Lỗi gửi hóa đơn thủ công:", error.message);
        res.status(500).json({ message: "Lỗi khi gửi hóa đơn email" });
    }
};

// Admin: Cập nhật trạng thái thanh toán
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        await pool.query('UPDATE bookings SET payment_status = ? WHERE id = ?', [payment_status, id]);
        res.json({ message: `✅ Cập nhật thanh toán đơn #TB-${id} thành: ${payment_status}` });
    } catch (error) {
        console.error("Lỗi cập nhật thanh toán:", error.message);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Admin: Cập nhật chi tiết Booking
const updateBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_name, user_email, user_phone, adults, children, total_price } = req.body;
        
        await pool.query(
            'UPDATE bookings SET user_name = ?, user_email = ?, user_phone = ?, adults = ?, children = ?, total_price = ? WHERE id = ?',
            [user_name, user_email, user_phone, adults, children, total_price, id]
        );
        
        res.json({ message: `✅ Cập nhật chi tiết đơn hàng #TB-${id} thành công!` });
    } catch (error) {
        console.error("Lỗi cập nhật chi tiết booking:", error.message);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    getAllBookings,
    updateBookingStatus,
    updatePaymentStatus,
    updateBookingDetails,
    sendInvoiceEmail,
    sendInvoiceManual
};
