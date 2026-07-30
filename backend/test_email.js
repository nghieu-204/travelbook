require('dotenv').config();
const nodemailer = require('nodemailer');

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ Lỗi kết nối Gmail:", error);
    } else {
        console.log("✅ Kết nối Gmail thành công!");
    }
});
