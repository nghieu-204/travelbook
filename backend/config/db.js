require('dotenv').config();
// Thư viện MySQL
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3307,
    database: process.env.DB_NAME || 'travel_booking',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// DB Connection pool
const pool = mysql.createPool(dbConfig);

// Tự động tăng max_allowed_packet để cho phép lưu ảnh dung lượng lớn
pool.query('SET GLOBAL max_allowed_packet=52428800').catch(err => {
    console.error("Lỗi khi thiết lập max_allowed_packet:", err.message);
});

module.exports = { pool, dbConfig };