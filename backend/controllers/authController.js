const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Kiểm tra xem email đã tồn tại trong DB chưa
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email này đã được sử dụng!" });
        }

        // 2. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Lưu user mới vào Database
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

        // 3. Tạo Token
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
            'MY_SECRET_KEY',
            { expiresIn: '24h' }
        );

        res.json({ message: "Đăng nhập thành công!", token: token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    register,
    login
};
