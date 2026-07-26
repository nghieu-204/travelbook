const { pool } = require('../config/db');

async function seedMetadata() {
    try {
        console.log('🌱 Đang nạp dữ liệu Metadata...');

        // 1. TourCategory
        await pool.query('INSERT IGNORE INTO TourCategory (id, name) VALUES (1, "Trong nước"), (2, "Ngoài nước")');

        // 2. Region
        await pool.query(`INSERT IGNORE INTO Region (id, category_id, name) VALUES 
            (1, 1, "Miền Bắc"), 
            (2, 1, "Miền Trung"), 
            (3, 1, "Miền Nam"),
            (4, 2, "Châu Á"),
            (5, 2, "Châu Âu")
        `);

        // 3. Destination
        await pool.query(`INSERT IGNORE INTO Destination (id, region_id, name) VALUES 
            (1, 1, "Hà Nội"), (2, 1, "Sapa"), (3, 1, "Hạ Long"),
            (4, 2, "Đà Nẵng"), (5, 2, "Huế"), (6, 2, "Hội An"),
            (7, 3, "Phú Quốc"), (8, 3, "TP Hồ Chí Minh"), (9, 3, "Cần Thơ"),
            (10, 4, "Thái Lan"), (11, 4, "Nhật Bản"), (12, 4, "Hàn Quốc"),
            (13, 5, "Pháp"), (14, 5, "Ý")
        `);

        // 4. TourType
        await pool.query(`INSERT IGNORE INTO TourType (id, name) VALUES 
            (1, "Khám phá"), (2, "Nghỉ dưỡng"), (3, "Mạo hiểm"), 
            (4, "Văn hóa"), (5, "Trăng mật"), (6, "Gia đình")
        `);

        // 5. Occasion
        await pool.query(`INSERT IGNORE INTO Occasion (id, name) VALUES 
            (1, "Lễ 30/4"), (2, "Tết Nguyên Đán"), (3, "Hè 2026"), (4, "Cuối tuần")
        `);

        console.log('✅ Đã nạp dữ liệu Metadata thành công!');
    } catch (error) {
        console.error('❌ Lỗi nạp metadata:', error);
    }
}

if (require.main === module) {
    seedMetadata().then(() => process.exit(0));
}
