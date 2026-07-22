const { pool, dbConfig } = require('../config/db');
const mysql = require('mysql2/promise');

async function initSchema() {
    try {
        console.log('🔄 Đang kiểm tra và khởi tạo Database...');
        // Tạo Database nếu chưa có (cần kết nối không có database trước)
        const tempPool = mysql.createPool({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });
        await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await tempPool.end();

        // 1. Bảng users
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                avatar VARCHAR(500) NULL,
                address TEXT NULL,
                phone VARCHAR(50) NULL,
                status VARCHAR(50) DEFAULT 'Hoạt động',
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 2. Bảng tours
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tours(
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(100),
                region VARCHAR(50) DEFAULT 'Miền Nam',
                price INT NOT NULL,
                original_price INT,
                child_price INT,
                available_spots INT DEFAULT 30,
                departure_date VARCHAR(50) DEFAULT '2026-08-15',
                duration VARCHAR(100),
                category VARCHAR(100),
                image VARCHAR(500),
                gallery JSON,
                rating DECIMAL(3, 1) DEFAULT 4.8,
                reviews_count INT DEFAULT 120,
                badge VARCHAR(100),
                description TEXT,
                itinerary JSON,
                included JSON,
                excluded JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 3. Bảng bookings
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings(
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                tour_id INT NOT NULL,
                tour_name VARCHAR(255) NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                user_email VARCHAR(255) NOT NULL,
                user_phone VARCHAR(50) NOT NULL,
                departure_date DATE NOT NULL,
                adults INT DEFAULT 1,
                children INT DEFAULT 0,
                total_price INT NOT NULL,
                payment_method VARCHAR(100) DEFAULT 'Chuyển khoản ngân hàng / QR Code',
                status VARCHAR(50) DEFAULT 'Đang chờ xác nhận',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(tour_id) REFERENCES tours(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 4. Bảng contacts
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts(
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_name VARCHAR(255) NOT NULL,
                user_email VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'Chưa phản hồi',
                admin_reply TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 5. Bảng reviews
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tour_id INT NOT NULL,
                user_id INT NULL,
                user_name VARCHAR(255) NOT NULL,
                user_avatar VARCHAR(500) NULL,
                rating INT DEFAULT 5,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('✅ Khởi tạo Database và Bảng thành công!');
    } catch (error) {
        console.error('❌ Lỗi khởi tạo schema:', error);
    }
}

module.exports = { initSchema };
