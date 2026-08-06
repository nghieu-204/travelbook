const { pool } = require('./config/db');
async function fix() {
    try {
        await pool.query('DROP TABLE IF EXISTS chat_messages');
        await pool.query('DROP TABLE IF EXISTS chat_sessions');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id VARCHAR(36) PRIMARY KEY,
                user_id INT NULL,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(36) NOT NULL,
                sender_type VARCHAR(10) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Fixed DB schema!');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
