const jwt = require('jsonwebtoken');
const { USER_ROLE } = require('../config/constants');
const { pool } = require('../config/db');

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "❌ Bạn chưa đăng nhập hoặc thiếu Token xác thực!" });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'MY_SECRET_KEY', async (err, user) => {
        if (err) {
            return res.status(403).json({ message: "❌ Token không hợp lệ hoặc đã hết hạn!" });
        }
        if (user.role !== USER_ROLE.ADMIN) {
            return res.status(403).json({ message: "❌ Quyền truy cập bị từ chối! Chỉ Quản Trị Viên mới có thể thực hiện thao tác này." });
        }
        
        try {
            // Kiểm tra trạng thái thực tế trong database
            const [users] = await pool.query('SELECT status, is_active FROM users WHERE id = ?', [user.id]);
            if (users.length === 0) {
                return res.status(404).json({ message: "❌ Tài khoản không tồn tại!" });
            }
            
            const dbUser = users[0];
            if (dbUser.status === 'Bị khóa' || dbUser.is_active === 0) {
                return res.status(403).json({ message: "❌ Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!" });
            }
            
            req.user = user;
            next();
        } catch (error) {
            console.error("Lỗi xác thực admin:", error);
            return res.status(500).json({ message: "❌ Lỗi hệ thống khi xác thực tài khoản!" });
        }
    });
};

module.exports = {
    verifyAdmin
};
