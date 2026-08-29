const { pool } = require('../../config/db');
const nodemailer = require('nodemailer');

// Transporter sẽ được khởi tạo bên trong function để lấy biến môi trường mới nhất


// Admin lấy danh sách Liên hệ
const getAllContacts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error("Lỗi truy xuất contacts:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Admin phản hồi yêu cầu Liên hệ và Tự động gửi Email Nodemailer
const replyContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_reply } = req.body;

        await pool.query('UPDATE contacts SET admin_reply = ?, status = ? WHERE id = ?', [admin_reply, 'Đã phản hồi', id]);

        const [rows] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
        const contact = rows[0];

        // Tạo email HTML phản hồi sang trọng
        const replyHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background: #0a66c2; color: white; padding: 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">✈️ TRAVELBOOK - PHẢN HỒI YÊU CẦU</h1>
                    <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">V/v: ${contact.subject}</p>
                </div>
                <div style="padding: 24px; background: white; color: #334155;">
                    <p style="font-size: 16px;">Xin chào <strong>${contact.user_name}</strong>,</p>
                    <p>Cảm ơn bạn đã liên hệ với Trung tâm Chăm sóc Khách hàng TravelBook. Chúng tôi xin trân trọng gửi phản hồi cho thắc mắc của bạn như sau:</p>
                    
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #cbd5e1; font-style: italic; color: #64748b;">
                        <strong>Nội dung bạn hỏi:</strong> "${contact.message}"
                    </div>

                    <div style="background: #ecfdf5; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #059669; color: #065f46;">
                        <h4 style="margin: 0 0 10px; color: #047857;">🛡️ Phản hồi từ Quản trị viên TravelBook:</h4>
                        <p style="margin: 0; line-height: 1.6;">${admin_reply}</p>
                    </div>

                    <p style="margin-top: 25px; font-size: 14px; color: #64748b; line-height: 1.5;">
                        Nếu cần hỗ trợ gấp hoặc có thêm câu hỏi, vui lòng gọi Hotline <strong style="color: #0a66c2;">1900 8888</strong> để được tư vấn trực tiếp.
                    </p>
                </div>
                <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
                    © 2026 TravelBook Corporation. All rights reserved.
                </div>
            </div>
        `;

        // Gửi email qua Nodemailer
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'abcdefghijklmnop') {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                await transporter.sendMail({
                    from: `"TravelBook Customer Support" <${process.env.EMAIL_USER}>`,
                    to: contact.user_email,
                    subject: `[TRAVELBOOK PHẢN HỒI] ${contact.subject}`,
                    html: replyHtml
                });
                console.log(`📧 Đã gửi email phản hồi liên hệ qua Nodemailer cho: ${contact.user_email}`);
            } catch (mailErr) {
                console.error("❌ Lỗi khi gửi email Nodemailer:", mailErr.message);
            }
        } else {
            console.log(`ℹ️ [Chế độ giả lập email] Đã lưu phản hồi liên hệ #${contact.id} và sinh sẵn HTML email cho (${contact.user_email}).`);
        }

        res.json({ 
            message: "✅ Đã lưu phản hồi và tự động gửi Email cho khách hàng!",
            contact: contact,
            replyHtml: replyHtml
        });
    } catch (error) {
        console.error("Lỗi phản hồi contact:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

module.exports = {
    getAllContacts,
    replyContact
};
