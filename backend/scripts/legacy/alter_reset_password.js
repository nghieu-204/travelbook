require('dotenv').config();
const { pool } = require('./config/db');

async function alterUsersTable() {
    try {
        console.log('Adding reset_password columns to users table...');
        
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN reset_password_token VARCHAR(255) NULL,
            ADD COLUMN reset_password_expires DATETIME NULL;
        `);
        
        console.log('Successfully added reset_password columns.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
        } else {
            console.error('Error altering table:', error.message);
        }
    } finally {
        process.exit();
    }
}

alterUsersTable();
