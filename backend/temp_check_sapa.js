const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTours() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'travel_booking',
        port: process.env.DB_PORT || 3307
    });

    try {
        const [rows] = await connection.execute("SELECT t.id, t.name, d.name as dest FROM tours t JOIN Tour_Destination td ON t.id = td.tour_id JOIN destination d ON td.destination_id = d.id WHERE d.name LIKE '%Sa Pa%' OR d.name LIKE '%Sapa%'");
        console.log("Tours in Sapa:", rows);
        const [allDests] = await connection.execute("SELECT name FROM destination");
        console.log("All destinations:", allDests.map(d => d.name).join(', '));
    } catch (e) {
        console.error(e);
    }
    await connection.end();
}

checkTours();
