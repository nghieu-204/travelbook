const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "❌ Bạn chưa đăng nhập hoặc thiếu Token xác thực!" });
    }
    jwt.verify(token, 'MY_SECRET_KEY', (err, user) => {
        if (err) {
            return res.status(403).json({ message: "❌ Token không hợp lệ hoặc đã hết hạn!" });
        }
        req.user = user;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "❌ Quyền truy cập bị từ chối! Chỉ Quản Trị Viên mới có thể thực hiện thao tác này." });
    }
    next();
};

module.exports = {
    verifyToken,
    verifyAdmin
};
