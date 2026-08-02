const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "❌ Bạn chưa đăng nhập hoặc thiếu Token xác thực!" });
    }
    jwt.verify(token, 'MY_SECRET_KEY', (err, user) => {
        if (err) {
            return res.status(403).json({ message: "❌ Token không hợp lệ hoặc đã hết hạn!" });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ message: "❌ Quyền truy cập bị từ chối! Chỉ Quản Trị Viên mới có thể thực hiện thao tác này." });
        }
        req.user = user;
        next();
    });
};

module.exports = {
    verifyAdmin
};
