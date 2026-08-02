const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'admin@travelbook.vn',
        pass: process.env.EMAIL_PASS || 'abcdefghijklmnop'
    }
});

const sendEmail = async (to, subject, html) => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'abcdefghijklmnop') {
        try {
            await transporter.sendMail({
                from: `"TravelBook Auth" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            });
            console.log(`📧 Email sent successfully to: ${to}`);
            return true;
        } catch (error) {
            console.error("❌ Error sending email:", error.message);
            return false;
        }
    } else {
        console.log(`ℹ️ [Email Simulation Mode] Email to (${to}) with subject: ${subject}`);
        console.log(html);
        return true;
    }
};

module.exports = sendEmail;
