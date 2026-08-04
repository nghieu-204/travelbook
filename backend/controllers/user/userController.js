const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');

// Admin / User: Cập nhật thông tin cá nhân (Profile & Password)
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, address, phone, avatar, new_password } = req.body;

        if (new_password && new_password.trim() !== '') {
            const hashedPass = await bcrypt.hash(new_password, 10);
            await pool.query(
                'UPDATE users SET name = ?, email = ?, address = ?, phone = ?, avatar = ?, password = ? WHERE id = ?',
                [name, email, address || null, phone || null, avatar || null, hashedPass, userId]
            );
        } else {
            await pool.query(
                'UPDATE users SET name = ?, email = ?, address = ?, phone = ?, avatar = ? WHERE id = ?',
                [name, email, address || null, phone || null, avatar || null, userId]
            );
        }

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
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật thông tin" });
    }
};

// Lấy thông tin profile hiện tại của user đăng nhập
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT id, name, email, role, avatar, address, phone, status, is_active, created_at FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi lấy profile:", error.message);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy thông tin" });
    }
};

module.exports = {
    updateProfile,
    getProfile
};
