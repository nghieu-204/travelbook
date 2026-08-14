const mysql = require('mysql2/promise');
async function run() {
    const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '', database: 'travel_booking', port: 3307 });
    const [rows] = await pool.query("SHOW TABLES LIKE 'user_interactions'");
    console.log("Table exists:", rows.length > 0);
    pool.end();
}
run();
