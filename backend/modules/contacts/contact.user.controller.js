const { pool } = require('../../config/db');
const nodemailer = require('nodemailer');

// Transporter sẽ được khởi tạo bên trong function để lấy biến môi trường mới nhất

// Gửi liên hệ từ Khách hàng (Public)
const createContact = async (req, res) => {
    try {
        const { user_name, user_email, user_phone, contact_date, subject, message } = req.body;
        await pool.query(
            `INSERT INTO contacts (user_name, user_email, user_phone, contact_date, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, 'Chưa phản hồi')`,
            [user_name, user_email, user_phone || null, contact_date || null, subject, message]
        );
        res.status(201).json({ message: "🎉 Đã gửi yêu cầu liên hệ thành công! Đội ngũ TravelBook sẽ sớm phản hồi cho bạn." });
    } catch (error) {
        console.error("Lỗi gửi contact:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

module.exports = {
    createContact
};
