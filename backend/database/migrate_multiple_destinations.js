const { pool } = require('../config/db');

async function migrate() {
    try {
        console.log('🔄 Bắt đầu tạo bảng Tour_Destination...');
        
        // 1. Tạo bảng trung gian
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Tour_Destination (
                tour_id INT NOT NULL,
                destination_id INT NOT NULL,
                PRIMARY KEY (tour_id, destination_id),
                FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
                FOREIGN KEY (destination_id) REFERENCES destination(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tạo bảng Tour_Destination thành công');

        // 2. Chuyển dữ liệu từ cột destination_id của tours sang bảng Tour_Destination
        console.log('🔄 Đang chuyển dữ liệu điểm đến cũ sang bảng mới...');
        
        // Lấy danh sách tour có destination_id
        const [tours] = await pool.query('SELECT id, destination_id FROM tours WHERE destination_id IS NOT NULL');
        
        let count = 0;
        for (const tour of tours) {
            try {
                await pool.query('INSERT IGNORE INTO Tour_Destination (tour_id, destination_id) VALUES (?, ?)', [tour.id, tour.destination_id]);
                count++;
            } catch (err) {
                console.error(`Lỗi khi insert tour_id=${tour.id}, destination_id=${tour.destination_id}:`, err.message);
            }
        }
        
        console.log(`✅ Đã chuyển đổi thành công ${count} tours`);
        
        console.log('🎉 Migration hoàn tất!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi migration:', error);
        process.exit(1);
    }
}

migrate();
