const mysql = require('mysql2/promise');

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'travel_booking',
    });

    const [tours] = await pool.query('SELECT id, name FROM tours');
    
    for (const tour of tours) {
        let cleanName = removeAccents(tour.name);
        if (cleanName.length > 50) cleanName = cleanName.substring(0, 50);
        const prompt = encodeURIComponent(cleanName + ' travel tourism beautiful landscape');
        const imgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true`;
        
        await pool.query('UPDATE tours SET image = ? WHERE id = ?', [imgUrl, tour.id]);
        console.log('Updated tour ' + tour.id + ' - ' + tour.name);
    }
    
    console.log('Done updating images!');
    process.exit(0);
}

run();
