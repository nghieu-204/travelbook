const { pool } = require('../../config/db');
const nodemailer = require('nodemailer');
const { schedulePaymentTimeout } = require('../../queue/orderQueue');

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

async function createBookingProcess(data) {
    const { user_id, tour_id, tour_name, user_name, user_email, user_phone, departure_date, adults, children, total_price, payment_method } = data;

    let initialStatus = 'Đang chờ xác nhận';
    if (payment_method === 'VNPay' || payment_method === 'Thanh toán qua VNPay') {
        initialStatus = 'Đang chờ thanh toán';
    }

    const totalPeople = parseInt(adults || 1) + parseInt(children || 0);

    // Kiểm tra chỗ trống
    const [tourRows] = await pool.query('SELECT available_spots FROM tours WHERE id = ?', [tour_id]);
    if (tourRows.length === 0) {
        throw new Error('NOT_FOUND:Không tìm thấy tour này.');
    }
    if (tourRows[0].available_spots < totalPeople) {
        throw new Error('BAD_REQUEST:Xin lỗi, tour không còn đủ chỗ trống!');
    }

    // Tạm giữ chỗ
    await pool.query('UPDATE tours SET available_spots = available_spots - ? WHERE id = ?', [totalPeople, tour_id]);

    const [result] = await pool.query(
        `INSERT INTO bookings (user_id, tour_id, tour_name, user_name, user_email, user_phone, departure_date, adults, children, total_price, payment_method, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id || null, tour_id, tour_name, user_name, user_email, user_phone, departure_date, adults || 1, children || 0, total_price, payment_method || 'Chuyển khoản ngân hàng / QR Code', initialStatus]
    );

    const bookingId = result.insertId;

    // Lưu Audit Trail
    await pool.query(
        `INSERT INTO order_logs (booking_id, action, description) VALUES (?, ?, ?)`,
        [bookingId, 'CREATED', `Khách hàng tạo đơn hàng qua phương thức ${payment_method || 'Chuyển khoản / Tiền mặt'}. Trạng thái: ${initialStatus}`]
    );

    // Nếu VNPay, đẩy vào Queue chờ 15 phút
    if (payment_method === 'VNPay') {
        schedulePaymentTimeout(bookingId, totalPeople, tour_id);
    }

    return {
        bookingId: result.insertId,
        booking: {
            id: result.insertId,
            user_id, tour_id, tour_name, user_name, user_email, user_phone, departure_date, adults, children, total_price, payment_method, status: initialStatus
        }
    };
}

module.exports = {
    sendInvoiceEmail,
    createBookingProcess
};
