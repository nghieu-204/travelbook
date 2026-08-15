const { pool } = require('./config/db');

async function alterTable() {
    try {
        console.log('Adding tour_code and notes to tours table...');
        
        try {
            await pool.query('ALTER TABLE tours ADD COLUMN tour_code VARCHAR(100)');
            console.log('Added tour_code column successfully.');
        } catch (e) {
            console.log('tour_code might already exist or error:', e.message);
        }

        try {
            await pool.query('ALTER TABLE tours ADD COLUMN notes JSON');
            console.log('Added notes column successfully.');
        } catch (e) {
            console.log('notes might already exist or error:', e.message);
        }

        console.log('Finished altering table.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

alterTable();
