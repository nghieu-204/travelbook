
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
                destination_id INT NULL,
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

        
        // ================= SCHEMA V2 (HIERARCHICAL & TAGGING) =================
        // 1. Bảng TourCategory (Cấp 1 - Trong nước / Ngoài nước)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS TourCategory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 2. Bảng Region (Cấp 2 - Vùng miền)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Region (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES TourCategory(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 3. Bảng Destination (Cấp 3 - Điểm đến)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Destination (
                id INT AUTO_INCREMENT PRIMARY KEY,
                region_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                image_url VARCHAR(500) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (region_id) REFERENCES Region(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 4. Bảng TourType (Loại hình Tour: Khám phá, Nghỉ dưỡng...)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS TourType (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 5. Bảng Occasion (Sự kiện/Dịp lễ: Lễ 30/4, Tết...)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Occasion (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 6. Bảng Tour_v2 (Bảng chính chứa thông tin Tour)
        // Lưu ý: Đặt tên là Tour_v2 để không đụng chạm bảng tours cũ
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Tour_v2 (
                id INT AUTO_INCREMENT PRIMARY KEY,
                destination_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                price_adult DECIMAL(10, 2) NOT NULL,
                price_child DECIMAL(10, 2) NOT NULL,
                start_date DATE NOT NULL,
                max_seats INT DEFAULT 30,
                status VARCHAR(50) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (destination_id) REFERENCES Destination(id) ON DELETE RESTRICT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 7. Bảng trung gian Tour_TourType (Nhiều-Nhiều)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Tour_TourType (
                tour_id INT NOT NULL,
                type_id INT NOT NULL,
                PRIMARY KEY (tour_id, type_id),
                FOREIGN KEY (tour_id) REFERENCES Tour_v2(id) ON DELETE CASCADE,
                FOREIGN KEY (type_id) REFERENCES TourType(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 8. Bảng trung gian Tour_Occasion (Nhiều-Nhiều)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Tour_Occasion (
                tour_id INT NOT NULL,
                occasion_id INT NOT NULL,
                PRIMARY KEY (tour_id, occasion_id),
                FOREIGN KEY (tour_id) REFERENCES Tour_v2(id) ON DELETE CASCADE,
                FOREIGN KEY (occasion_id) REFERENCES Occasion(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 9. Bảng TourImages (Thư viện ảnh của tour)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS TourImages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tour_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                is_main BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tour_id) REFERENCES Tour_v2(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        
        try {
            await pool.query('ALTER TABLE tours ADD CONSTRAINT fk_tours_destination FOREIGN KEY (destination_id) REFERENCES Destination(id) ON DELETE SET NULL');
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
