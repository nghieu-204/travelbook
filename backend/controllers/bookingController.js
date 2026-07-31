const { pool } = require('../config/db');
const nodemailer = require('nodemailer');

// Cấu hình Nodemailer gửi hóa đơn email (sử dụng Gmail App Password 16 ký tự)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'admin@travelbook.vn',
        pass: process.env.EMAIL_PASS || 'abcdefghijklmnop'
    }
});

async function sendInvoiceEmail(booking) {
    const invoiceHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background: #0a66c2; color: white; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">✈️ TRAVELBOOK - HÓA ĐƠN XÁC NHẬN</h1>
                <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Mã đặt chỗ: #TB-${booking.id}</p>
            </div>
            <div style="padding: 24px; background: white; color: #334155;">
                <p style="font-size: 16px;">Xin chào <strong>${booking.user_name}</strong>,</p>
                <p>Chúc mừng! Đơn đặt tour của bạn đã được Quản trị viên TravelBook kiểm tra và <strong>XÁC NHẬN THÀNH CÔNG</strong>. Dưới đây là thông tin chi tiết hóa đơn chuyến đi của bạn:</p>
                
                <div style="background: #f8fafc; padding: 18px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00d4bd;">
                    <h3 style="margin: 0 0 10px; color: #0a66c2;">🌴 ${booking.tour_name}</h3>
                    <p style="margin: 6px 0;"><strong>📅 Ngày khởi hành:</strong> ${new Date(booking.departure_date).toLocaleDateString('vi-VN')}</p>
                    <p style="margin: 6px 0;"><strong>👥 Số lượng đoàn:</strong> ${booking.adults} Người lớn ${booking.children > 0 ? `, ${booking.children} Trẻ em` : ''}</p>
                    <p style="margin: 6px 0;"><strong>📞 Số điện thoại:</strong> ${booking.user_phone}</p>
                    <p style="margin: 6px 0;"><strong>📧 Email:</strong> ${booking.user_email}</p>
                    <p style="margin: 6px 0;"><strong>💳 Phương thức thanh toán:</strong> ${booking.payment_method || 'Chuyển khoản ngân hàng / QR Code'}</p>
                </div>

                <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #cbd5e1;">
                    <span style="font-size: 16px; color: #64748b;">TỔNG THANH TOÁN:</span>
                    <div style="font-size: 24px; font-weight: bold; color: #e11d48; margin-top: 4px;">
                        ${Number(booking.total_price).toLocaleString('vi-VN')} VNĐ
                    </div>
                </div>

                <p style="margin-top: 25px; font-size: 14px; color: #64748b; line-height: 1.5;">
                    Vui lòng chuẩn bị giấy tờ tùy thân và có mặt trước giờ khởi hành ít nhất 2 tiếng. Mọi thắc mắc xin liên hệ Hotline <strong style="color: #0a66c2;">1900 8888</strong>.
                </p>
            </div>
            <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
                © 2026 TravelBook Corporation. All rights reserved.
            </div>
        </div>
    `;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'abcdefghijklmnop') {
        try {
            await transporter.sendMail({
                from: `"TravelBook VIP Booking" <${process.env.EMAIL_USER}>`,
                to: booking.user_email,
                subject: `[XÁC NHẬN ĐẶT TOUR #TB-${booking.id}] ${booking.tour_name} - TravelBook`,
                html: invoiceHtml
            });
            console.log(`📧 Đã gửi hóa đơn email qua Nodemailer thành công cho: ${booking.user_email}`);
        } catch (mailErr) {
            console.error("❌ Lỗi khi gửi email Nodemailer:", mailErr.message);
        }
    } else {
        console.log(`ℹ️ [Chế độ giả lập email] Hóa đơn #TB-${booking.id} cho (${booking.user_email}) đã được sinh sẵn HTML trong hệ thống.`);
    }
    return invoiceHtml;
}

// Đặt tour (Create Booking)
const createBooking = async (req, res) => {
    try {
        const { user_id, tour_id, tour_name, user_name, user_email, user_phone, departure_date, adults, children, total_price, payment_method } = req.body;

        const [result] = await pool.query(
            `INSERT INTO bookings (user_id, tour_id, tour_name, user_name, user_email, user_phone, departure_date, adults, children, total_price, payment_method, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Đang chờ xác nhận')`,
            [user_id || null, tour_id, tour_name, user_name, user_email, user_phone, departure_date, adults || 1, children || 0, total_price, payment_method || 'Chuyển khoản ngân hàng / QR Code']
        );

        res.status(201).json({
            message: "🎉 Đặt tour thành công! Chúng tôi sẽ liên hệ sớm nhất để xác nhận.",
            bookingId: result.insertId,
            booking: {
                id: result.insertId,
                user_id, tour_id, tour_name, user_name, user_email, user_phone, departure_date, adults, children, total_price, payment_method, status: 'Đang chờ xác nhận'
            }
        });
    } catch (error) {
        console.error("Lỗi đặt tour:", error);
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
            SELECT b.*, t.image as tour_image 
            FROM bookings b 
            LEFT JOIN tours t ON b.tour_id = t.id 
            WHERE b.user_id = ? 
            ORDER BY b.created_at DESC
        `, [userId]);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy lịch sử đặt tour:", error.message);
        res.json([]);
    }
};

// Admin: Lấy toàn bộ danh sách Booking trên hệ thống
const getAllBookings = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
        res.json(rows);
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
    createBooking,
    getBookingsByUser,
    getAllBookings,
    updateBookingStatus,
    updatePaymentStatus,
    updateBookingDetails,
    sendInvoiceEmail,
    sendInvoiceManual
};
