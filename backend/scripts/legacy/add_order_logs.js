const { pool } = require('../config/db');

async function run() {
    try {
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
        console.log("Table order_logs created successfully!");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();
