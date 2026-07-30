const { pool } = require('./config/db');

async function updateDB() {
    try {
        console.log('Adding payment_status column...');
        await pool.query(`ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Chưa thanh toán'`);
        console.log('Update payment status based on current booking status...');
        await pool.query(`UPDATE bookings SET payment_status = 'Đã thanh toán' WHERE status IN ('Đã xác nhận', 'Đã hoàn thành')`);
        console.log('Done!');
        process.exit(0);
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists!');
            process.exit(0);
        } else {
            console.error(e);
            process.exit(1);
        }
    }
}
updateDB();
