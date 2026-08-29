const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');

// Admin / User: Cập nhật thông tin cá nhân (Profile & Password)
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        let { name, email, address, phone, avatar, new_password } = req.body;

        const [currentUserRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        const currentUser = currentUserRows[0];
        
        name = name || currentUser.name;
        email = email || currentUser.email;
        address = address || currentUser.address;
        phone = phone || currentUser.phone;
        avatar = avatar || currentUser.avatar;

        await pool.query(
            'UPDATE users SET name = ?, email = ?, address = ?, phone = ?, avatar = ? WHERE id = ?',
            [name, email, address, phone, avatar, userId]
        );

        // Cập nhật tên và avatar trong bảng reviews để mọi đánh giá cũ đều hiển thị ảnh/tên mới
        await pool.query(
            'UPDATE reviews SET user_name = ?, user_avatar = ? WHERE user_id = ?',
            [name, avatar || null, userId]
        );

        const [rows] = await pool.query('SELECT id, name, email, role, avatar, address, phone, status, is_active FROM users WHERE id = ?', [userId]);
        res.json({
            message: "🎉 Cập nhật thông tin cá nhân thành công!",
            user: rows[0]
        });
    } catch (error) {
        console.error("Lỗi cập nhật profile:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Lấy thông tin profile hiện tại của user đăng nhập
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT id, name, email, role, avatar, address, phone, status, is_active, created_at, google_id, facebook_id FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi lấy profile:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới." });
        }

        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const user = users[0];
        
        // So sánh mật khẩu cũ
        const validPassword = await bcrypt.compare(current_password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác!" });
        }

        // Hash và lưu mật khẩu mới
        const hashedPass = await bcrypt.hash(new_password, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPass, userId]);

        res.json({ message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Upload Avatar
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (!req.file) {
            return res.status(400).json({ message: "Không tìm thấy file ảnh tải lên." });
        }

        // Tạo đường dẫn URL cho frontend
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Lưu vào DB
        await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, userId]);

        // Cập nhật reviews tương ứng
        const [currentUserRows] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
        const userName = currentUserRows[0].name;

        await pool.query(
            'UPDATE reviews SET user_name = ?, user_avatar = ? WHERE user_id = ?',
            [userName, avatarUrl, userId]
        );

        res.json({
            message: "Tải ảnh đại diện thành công!",
            avatar: avatarUrl
        });

    } catch (error) {
        console.error("Lỗi upload avatar:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

module.exports = {
    updateProfile,
    getProfile,
    changePassword,
    uploadAvatar
};
