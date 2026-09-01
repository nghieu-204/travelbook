const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const https = require('https');



const downloadImage = (url, filepath, retries = 5) => {
    return new Promise((resolve, reject) => {
        const httpModule = url.startsWith('https') ? require('https') : require('http');
        httpModule.get(url, (res) => {
            if (res.statusCode === 200) {
                const writeStream = fs.createWriteStream(filepath);
                res.pipe(writeStream);
                writeStream.on('finish', () => {
                    writeStream.close();
                    resolve();
                });
            } else if ([301, 302, 307, 308].includes(res.statusCode)) {
                let redirectUrl = res.headers.location;
                if (!redirectUrl.startsWith('http')) {
                    redirectUrl = new URL(redirectUrl, url).href;
                }
                downloadImage(redirectUrl, filepath, retries - 1).then(resolve).catch(reject);
            } else if (res.statusCode === 429 && retries > 0) {
                console.log(`Bị rate limit, thử lại sau 5s...`);
                setTimeout(() => {
                    downloadImage(url, filepath, retries - 1).then(resolve).catch(reject);
                }, 5000);
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
    const toursDir = path.join(__dirname, '../uploads/tours/images');
    if (!fs.existsSync(toursDir)) {
        fs.mkdirSync(toursDir, { recursive: true });
    }

    const [tours] = await pool.query(`
        SELECT t.id, t.name, d.name AS dest_name 
        FROM tours t 
        LEFT JOIN tour_destination td ON t.id = td.tour_id 
        LEFT JOIN destination d ON td.destination_id = d.id
    `);
    
    console.log(`Bắt đầu tải ảnh CHẤT LƯỢNG CAO cho ${tours.length} tours (tuần tự để tránh rate limit)...`);
    
    for (const tour of tours) {
        let keyword = 'travel';
        if (tour.dest_name) {
            keyword = tour.dest_name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]/g, '');
        } else {
            keyword = tour.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]/g, '');
        }
        if (!keyword) keyword = 'vietnam';
        
        const imgUrl = `https://loremflickr.com/800/600/${keyword},landscape/all?lock=${tour.id}`;
        
        const filePath = path.join(toursDir, `${tour.id}.jpg`);
        try {
            await downloadImage(imgUrl, filePath);
            const localUrl = `http://localhost:8902/uploads/tours/images/${tour.id}.jpg`;
            await pool.query('UPDATE tours SET image = ? WHERE id = ?', [localUrl, tour.id]);
            console.log(`✅ [${tour.id}] Đã tải: ${tour.dest_name || 'Khác'} -> Từ khóa: ${keyword}`);
        } catch (err) {
            console.error(`❌ [${tour.id}] Lỗi:`, err.message);
        }
        
        // Nghỉ 4 giây để tránh bị 429 Too Many Requests
        await new Promise(res => setTimeout(res, 4000));
    }
    
    console.log('Hoàn tất tải ảnh!');
    process.exit(0);
}

run();
