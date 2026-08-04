const { pool } = require('../config/db');

async function migrate() {
    try {
        console.log('🔄 Bắt đầu cập nhật cấu trúc Database...');
        
        // 1. Thêm cột is_primary vào Tour_Destination
        try {
            await pool.query('ALTER TABLE Tour_Destination ADD COLUMN is_primary BOOLEAN DEFAULT FALSE');
            console.log('✅ Đã thêm cột is_primary vào Tour_Destination');
        } catch (e) {
            console.log('⚠️ Cột is_primary có thể đã tồn tại:', e.message);
        }

        // 2. Cập nhật điểm đến đầu tiên làm primary cho các tour hiện tại
        const [tours] = await pool.query('SELECT DISTINCT tour_id FROM Tour_Destination');
        for (const tour of tours) {
            // Lấy 1 điểm đến bất kỳ của tour đó để làm primary
            const [dests] = await pool.query('SELECT destination_id FROM Tour_Destination WHERE tour_id = ? LIMIT 1', [tour.tour_id]);
            if (dests.length > 0) {
                await pool.query('UPDATE Tour_Destination SET is_primary = TRUE WHERE tour_id = ? AND destination_id = ?', [tour.tour_id, dests[0].destination_id]);
            }
        }
        console.log('✅ Đã set is_primary cho các dữ liệu hiện có');

        // 3. Drop khóa ngoại và cột destination_id trong tours
        try {
            // Lấy tên foreign key nếu có (thường là fk_tours_destination hoặc tương tự)
            const [fks] = await pool.query(`
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'tours' 
                  AND COLUMN_NAME = 'destination_id' 
                  AND REFERENCED_TABLE_NAME = 'destination'
            `);
            if (fks.length > 0) {
                for (const fk of fks) {
                    await pool.query(`ALTER TABLE tours DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
                    console.log(`✅ Đã drop foreign key: ${fk.CONSTRAINT_NAME}`);
                }
            }
        } catch (e) {
            console.log('⚠️ Không thể drop foreign key:', e.message);
        }

        try {
            await pool.query('ALTER TABLE tours DROP COLUMN destination_id');
            console.log('✅ Đã xóa bỏ cột destination_id khỏi bảng tours');
        } catch (e) {
            console.log('⚠️ Không thể drop cột destination_id:', e.message);
        }

        console.log('🎉 Hoàn tất migrate!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

migrate();
