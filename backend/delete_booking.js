const { pool } = require('./config/db');

async function deleteBooking() {
    try {
        const result = await pool.query('DELETE FROM bookings WHERE id = ?', [6]);
        console.log(`Deleted booking SKY-6. Result:`, result[0].affectedRows, 'rows affected');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
deleteBooking();
