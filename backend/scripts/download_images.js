const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const https = require('https');

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const writeStream = fs.createWriteStream(filepath);
                res.pipe(writeStream);
                writeStream.on('finish', () => {
                    writeStream.close();
                    resolve();
                });
            } else if (res.statusCode === 301 || res.statusCode === 302) {
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            } else {
                reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => reject(err));
        });
    });
};

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'travel_booking',
    });

    const uploadDir = path.join(__dirname, '../uploads');
    const toursDir = path.join(uploadDir, 'tours');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    if (!fs.existsSync(toursDir)) fs.mkdirSync(toursDir);

    const [tours] = await pool.query('SELECT id, name FROM tours');
    console.log(`Bắt đầu tải ảnh cho ${tours.length} tours...`);
    
    for (const tour of tours) {
        let cleanName = removeAccents(tour.name);
        if (cleanName.length > 50) cleanName = cleanName.substring(0, 50);
        const prompt = encodeURIComponent(cleanName + ' travel tourism beautiful landscape');
        const imgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true`;
        
        const filePath = path.join(toursDir, `${tour.id}.jpg`);
        try {
            console.log(`Đang tải ảnh tour ${tour.id}...`);
            await downloadImage(imgUrl, filePath);
            
            const localUrl = `http://localhost:8902/uploads/tours/${tour.id}.jpg`;
            await pool.query('UPDATE tours SET image = ? WHERE id = ?', [localUrl, tour.id]);
            console.log(`✅ Đã tải và cập nhật tour ${tour.id}`);
        } catch (err) {
            console.error(`❌ Lỗi tải ảnh tour ${tour.id}:`, err.message);
        }
    }
    
    console.log('Hoàn tất tải ảnh!');
    process.exit(0);
}

run();
