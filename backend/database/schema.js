
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
                password VARCHAR(255) NULL,
                google_id VARCHAR(255) UNIQUE NULL,
                facebook_id VARCHAR(255) UNIQUE NULL,
                role VARCHAR(50) DEFAULT 'user',
                avatar LONGTEXT NULL,
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
                destination_id INT NULL,
                region VARCHAR(50) DEFAULT 'Miền Nam',
                price INT NOT NULL,
                original_price INT,
                child_price INT,
                available_spots INT DEFAULT 30,
                departure_date VARCHAR(50) DEFAULT '2026-08-15',
                duration VARCHAR(100),
                category VARCHAR(100),
                image LONGTEXT,
                gallery JSON,
                rating DECIMAL(3, 1) DEFAULT 4.8,
                reviews_count INT DEFAULT 120,
                badge VARCHAR(100),
                description TEXT,
                itinerary JSON,
                included JSON,
                excluded JSON,
                notes JSON,
                landmark_id INT NULL,
                landmarks JSON NULL,
                departure_destination_id INT NULL,
                tour_code VARCHAR(100) UNIQUE,
                status VARCHAR(50) DEFAULT 'Active',
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
                payment_status VARCHAR(50) DEFAULT 'Chưa thanh toán',
                status VARCHAR(50) DEFAULT 'Đang chờ xác nhận',
                is_reviewed BOOLEAN DEFAULT FALSE,
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

        // 5. Bảng order_logs (Audit Trail)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_logs(
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                action VARCHAR(100) NOT NULL,
                description TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 5. Bảng reviews
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tour_id INT NOT NULL,
                user_id INT NULL,
                user_name VARCHAR(255) NOT NULL,
                user_avatar LONGTEXT NULL,
                rating INT DEFAULT 5,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 6. Bảng chat_sessions
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id VARCHAR(36) PRIMARY KEY,
                user_id INT NULL,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 7. Bảng chat_messages
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(36) NOT NULL,
                sender_type VARCHAR(10) NOT NULL, -- 'USER' or 'BOT'
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 8. Bảng user_interactions (Tracking cho Recommendation System)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_interactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                tour_id INT NOT NULL,
                interaction_type VARCHAR(50) NOT NULL, -- 'view', 'wishlist', 'book'
                weight INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);


        // ================= SCHEMA V2 (HIERARCHICAL & TAGGING) =================
        // 1. Bảng tourcategory (Cấp 1 - Trong nước / Ngoài nước)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tourcategory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 2. Bảng region (Cấp 2 - Vùng miền / Châu lục)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS region (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES tourcategory(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 2.5 Bảng country (Cấp trung gian cho Quốc tế)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS country (
                id INT AUTO_INCREMENT PRIMARY KEY,
                region_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (region_id) REFERENCES region(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 3. Bảng destination (Cấp 3 - Điểm đến)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS destination (
                id INT AUTO_INCREMENT PRIMARY KEY,
                region_id INT NULL,
                country_id INT NULL,
                name VARCHAR(255) NOT NULL,
                image_url VARCHAR(500) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (region_id) REFERENCES region(id) ON DELETE CASCADE,
                FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 3.5 Bảng landmarks
        await pool.query(`
            CREATE TABLE IF NOT EXISTS landmarks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                destination_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (destination_id) REFERENCES destination(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 4. Bảng tourtype (Loại hình Tour: Khám phá, Nghỉ dưỡng...)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tourtype (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 5. Bảng occasion (Sự kiện/Dịp lễ: Lễ 30/4, Tết...)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS occasion (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 6. Bảng trung gian tour_destination (Nhiều-Nhiều)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tour_destination (
                tour_id INT NOT NULL,
                destination_id INT NOT NULL,
                is_primary BOOLEAN DEFAULT FALSE,
                PRIMARY KEY (tour_id, destination_id),
                FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
                FOREIGN KEY (destination_id) REFERENCES destination(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 7. Bảng trung gian tour_tourtype (Nhiều-Nhiều)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tour_tourtype (
                tour_id INT NOT NULL,
                type_id INT NOT NULL,
                PRIMARY KEY (tour_id, type_id),
                FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
                FOREIGN KEY (type_id) REFERENCES tourtype(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 8. Bảng trung gian tour_occasion (Nhiều-Nhiều)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tour_occasion (
                tour_id INT NOT NULL,
                occasion_id INT NOT NULL,
                PRIMARY KEY (tour_id, occasion_id),
                FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
                FOREIGN KEY (occasion_id) REFERENCES occasion(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        
        try {
            await pool.query('ALTER TABLE tours ADD CONSTRAINT fk_tours_destination FOREIGN KEY (destination_id) REFERENCES destination(id) ON DELETE SET NULL');
        } catch (e) {
            if (!e.message.includes('Duplicate key name')) {
                console.log('Constraint may already exist or error:', e.message);
            }
        }
    console.log("✅ Khởi tạo các bảng thành công!");
    } catch (error) {
        console.error('❌ Lỗi khởi tạo schema:', error);
    }
}

module.exports = { initSchema };
