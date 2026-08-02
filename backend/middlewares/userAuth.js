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

module.exports = {
    verifyToken
};
