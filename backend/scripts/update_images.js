const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'travel_booking',
    });

    const [tours] = await pool.query('SELECT id, name FROM tours');
    
    for (const tour of tours) {
        const prompt = encodeURIComponent('travel photography, ' + tour.name + ' beautiful scenery, 8k high quality, no text');
        const imgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true`;
        
        await pool.query('UPDATE tours SET image = ? WHERE id = ?', [imgUrl, tour.id]);
        console.log('Updated tour ' + tour.id + ' - ' + tour.name);
    }
    
    console.log('Done!');
    process.exit(0);
}

run();
