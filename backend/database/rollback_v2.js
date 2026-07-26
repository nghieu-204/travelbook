const { pool } = require('../config/db');

async function dropV2() {
  try {
    console.log('Dropping V2 tables and constraints...');
    
    try {
        await pool.query('ALTER TABLE tours DROP FOREIGN KEY fk_tours_destination');
    } catch(e) { console.log('No fk_tours_destination found or already dropped'); }
    
    try {
        await pool.query('ALTER TABLE tours DROP COLUMN destination_id');
    } catch(e) { console.log('No destination_id column found or already dropped'); }

    const tables = [
      'Tour_TourType', 'Tour_Occasion', 'TourImages', 'Tour_v2',
      'Destination', 'Region', 'TourCategory', 'TourType', 'Occasion'
    ];
    
    for (const table of tables) {
      await pool.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped ${table}`);
    }
    
    console.log('V2 rollback completed.');
  } catch (error) {
    console.error('Error during rollback:', error);
  } finally {
    process.exit(0);
  }
}
dropV2();
