const { pool } = require('../config/db');

async function migrateOAuth() {
    try {
        console.log('🔄 Đang thêm cột google_id và facebook_id vào bảng users...');

        // Thêm google_id
        try {
            await pool.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE NULL;');
            console.log('✅ Đã thêm cột google_id');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Cột google_id đã tồn tại');
            } else {
                throw e;
            }
        }

        // Thêm facebook_id
        try {
            await pool.query('ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255) UNIQUE NULL;');
            console.log('✅ Đã thêm cột facebook_id');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Cột facebook_id đã tồn tại');
            } else {
                throw e;
            }
        }

        // Đổi password thành NULL
        try {
            await pool.query('ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;');
            console.log('✅ Đã đổi password thành cho phép NULL');
        } catch (e) {
            throw e;
        }

        console.log('🎉 Hoàn tất cập nhật bảng users!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

migrateOAuth();
