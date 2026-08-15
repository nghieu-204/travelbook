const authService = require('./auth.service');

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập email!" });
        }
        await authService.sendOtp(email);
        res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn!" });
    } catch (error) {
        console.error("Lỗi gửi OTP:", error);
        res.status(400).json({ message: error.message || "Lỗi hệ thống khi gửi OTP" });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;
        if (!otp) {
            return res.status(400).json({ message: "Vui lòng nhập mã OTP!" });
        }
        await authService.registerUser(name, email, password, otp);
        res.status(201).json({ message: "Đăng ký tài khoản thành công!" });
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(400).json({ message: error.message || "Lỗi server" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await authService.loginUser(email, password, null);
        res.json({ 
            message: "Đăng nhập thành công!", 
            token, 
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
        res.status(400).json({ message: error.message || "Lỗi server" });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await authService.loginUser(email, password, 'admin');
        res.json({ 
            message: "Đăng nhập quản trị thành công!", 
            token, 
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
        console.error("Lỗi đăng nhập admin:", error);
        // Note: original admin login returns 400 for wrong credentials, 403 for unauthorized role
        const status = error.message.includes("quyền truy cập") ? 403 : 400;
        res.status(status).json({ message: error.message || "Lỗi server" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập email!" });
        }
        await authService.forgotPassword(email);
        res.status(200).json({ message: "Nếu email tồn tại, link khôi phục đã được gửi!" });
    } catch (error) {
        console.error("Lỗi quên mật khẩu:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi yêu cầu quên mật khẩu" });
    }
};

exports.confirmResetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
        }
        await authService.resetPassword(token, newPassword);
        res.json({ message: "Đặt lại mật khẩu thành công!" });
    } catch (error) {
        console.error("Lỗi xác nhận reset mật khẩu:", error);
        res.status(400).json({ message: error.message || "Lỗi hệ thống khi đặt lại mật khẩu" });
    }
};
