const { pool } = require('./config/db');
async function check() {
    try {
        const [rows] = await pool.query("SHOW TABLES LIKE 'chat_sessions'");
        console.log(rows.length > 0 ? 'Table created' : 'Table missing');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
