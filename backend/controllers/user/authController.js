const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../../utils/sendEmail');

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập email!" });
        }

        // 1. Kiểm tra xem email đã tồn tại chưa
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email này đã được sử dụng!" });
        }

        // 2. Sinh mã OTP ngẫu nhiên 6 chữ số
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

        // 3. Lưu OTP vào CSDL
        await pool.query(
            'INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)',
            [email, otpCode, expiresAt]
        );

        // 4. Gửi email
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                <div style="background: #0a66c2; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">Mã Xác Nhận TravelBook</h2>
                </div>
                <div style="padding: 20px;">
                    <p>Chào bạn,</p>
                    <p>Mã xác nhận (OTP) để đăng ký tài khoản của bạn là:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0a66c2; background: #f1f5f9; padding: 10px 20px; border-radius: 8px;">${otpCode}</span>
                    </div>
                    <p>Mã này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                </div>
            </div>
        `;
        
        await sendEmail(email, "Mã xác nhận đăng ký tài khoản TravelBook", html);

        res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn!" });
    } catch (error) {
        console.error("Lỗi gửi OTP:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi gửi OTP" });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ message: "Vui lòng nhập mã OTP!" });
        }

        // 1. Kiểm tra xem email đã tồn tại trong DB chưa
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email này đã được sử dụng!" });
        }

        // 2. Xác thực OTP
        const [otps] = await pool.query(
            'SELECT * FROM otps WHERE email = ? ORDER BY created_at DESC LIMIT 1',
            [email]
        );

        if (otps.length === 0) {
            return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc chưa được gửi!" });
        }

        const latestOtp = otps[0];
        
        if (latestOtp.otp_code !== otp) {
            return res.status(400).json({ message: "Mã OTP không chính xác!" });
        }

        if (new Date(latestOtp.expires_at) < new Date()) {
            return res.status(400).json({ message: "Mã OTP đã hết hạn!" });
        }

        // 3. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Lưu user mới vào Database
        await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: "Đăng ký tài khoản thành công!" });
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra xem email có tồn tại trong database không
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        const user = users[0];

        // 2. So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong database
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: "Tài khoản quản trị phải đăng nhập ở trang quản trị!" });
        }

        // 3. Tạo Token
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
            'MY_SECRET_KEY',
            { expiresIn: '24h' }
        );

        res.json({ 
            message: "Đăng nhập thành công!", 
            token: token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                avatar: user.avatar,
                phone: user.phone
            } 
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const confirmResetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
        }

        // 1. Tìm user có token này và token chưa hết hạn
        const [users] = await pool.query(
            'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!" });
        }

        const userId = users[0].id;

        // 2. Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 3. Cập nhật mật khẩu và xóa token
        await pool.query(
            'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({ message: "Đặt lại mật khẩu thành công!" });
    } catch (error) {
        console.error("Lỗi xác nhận reset mật khẩu:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi đặt lại mật khẩu" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập email!" });
        }

        // 1. Kiểm tra user có tồn tại
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Vẫn trả về thành công để tránh dò rỉ email (security best practice)
            return res.status(200).json({ message: "Nếu email tồn tại, link khôi phục đã được gửi!" });
        }

        const user = users[0];

        // 2. Tạo token ngẫu nhiên
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

        // 3. Lưu token vào CSDL
        await pool.query(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [resetToken, resetPasswordExpires, user.id]
        );

        // 4. Gửi email
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                <div style="background: #0046c1; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">Khôi phục mật khẩu TravelBook</h2>
                </div>
                <div style="padding: 20px;">
                    <p>Chào ${user.name},</p>
                    <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>
                    <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu mới:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #0046c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đặt Lại Mật Khẩu</a>
                    </div>
                    <p>Hoặc copy đường dẫn này dán vào trình duyệt:</p>
                    <p style="word-break: break-all; color: #64748b; font-size: 14px;">${resetUrl}</p>
                    <p>Link này có hiệu lực trong vòng <strong>15 phút</strong>. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
                </div>
            </div>
        `;
        
        await sendEmail(email, "Khôi phục mật khẩu tài khoản TravelBook", html);

        res.status(200).json({ message: "Nếu email tồn tại, link khôi phục đã được gửi!" });
    } catch (error) {
        console.error("Lỗi quên mật khẩu:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi yêu cầu quên mật khẩu" });
    }
};

module.exports = {
    sendOtp,
    register,
    login,
    confirmResetPassword,
    forgotPassword
};
