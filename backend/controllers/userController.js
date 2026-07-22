const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

// Admin: Lấy danh sách toàn bộ người dùng
const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, avatar, address, phone, status, is_active, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách người dùng:", error.message);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách người dùng" });
    }
};

// Admin: Khóa / Chặn hoặc Mở khóa tài khoản người dùng
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Hoạt động' | 'Đã khóa'
        await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `✅ Đã cập nhật trạng thái tài khoản #${id} thành: ${status}` });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái user:", error.message);
        res.status(500).json({ message: "Lỗi xử lý tài khoản" });
    }
};

// Admin: Kích hoạt tài khoản thủ công (khi người dùng chưa kích hoạt qua email)
const activateUser = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE users SET is_active = 1, status = 'Hoạt động' WHERE id = ?", [id]);
        res.json({ message: `⚡ Đã kích hoạt tài khoản #${id} thành công!` });
    } catch (error) {
        console.error("Lỗi kích hoạt user:", error.message);
        res.status(500).json({ message: "Lỗi xử lý kích hoạt" });
    }
};

// Admin: Xóa tài khoản người dùng
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: `🗑️ Đã xóa tài khoản #${id} khỏi hệ thống!` });
    } catch (error) {
        console.error("Lỗi xóa user:", error.message);
        res.status(500).json({ message: "Lỗi xử lý xóa" });
    }
};

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

module.exports = {
    getAllUsers,
    updateUserStatus,
    activateUser,
    deleteUser,
    updateProfile
};
