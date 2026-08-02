const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        const user = users[0];

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Tài khoản không có quyền truy cập!" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
            'MY_SECRET_KEY',
            { expiresIn: '24h' }
        );

        res.json({ 
            message: "Đăng nhập quản trị thành công!", 
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
        console.error("Lỗi đăng nhập admin:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    adminLogin
};
