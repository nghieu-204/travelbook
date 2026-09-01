const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const https = require('https');
const http = require('http');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'travel_booking',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const downloadImage = (url, filepath, retries = 5) => {
    return new Promise((resolve, reject) => {
        const httpModule = url.startsWith('https') ? https : http;
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
                setTimeout(() => downloadImage(url, filepath, retries - 1).then(resolve).catch(reject), 5000);
            } else {
                reject(new Error(`Status Code: ${res.statusCode}`));
            }
        }).on('error', err => reject(err));
    });
};

const run = async () => {
    const destinations = [
        { id: 28, name: 'Hà Nội' },
        { id: 29, name: 'TP. Hồ Chí Minh' },
        { id: 30, name: 'Cần Thơ' }
    ];
    const toursDir = path.join(__dirname, '../uploads/tours/images');
    if (!fs.existsSync(toursDir)) {
        fs.mkdirSync(toursDir, { recursive: true });
    }

    for (const dest of destinations) {
        const destName = dest.name;
        const destId = dest.id;

        // Insert tour
        const [tourResult] = await pool.query(
            `INSERT INTO tours (name, price, original_price, child_price, available_spots, departure_date, duration, badge, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [`Khám phá ${destName} trọn gói`, 2500000, 3000000, 1500000, 30, '2026-08-15', '3 ngày 2 đêm', 'Mới', 'Active']
        );
        const tourId = tourResult.insertId;

        // Link destination
        await pool.query('INSERT INTO tour_destination (tour_id, destination_id, is_primary) VALUES (?, ?, ?)', [tourId, destId, true]);

        // Add a tag
        await pool.query('INSERT INTO tour_tourtype (tour_id, type_id) VALUES (?, ?)', [tourId, 4]); // 4 = Khám phá

        console.log(`Đã tạo tour ${tourId} cho ${destName}`);

        // Download image
        const keyword = destName.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]/g, '');
        const imgUrl = `https://loremflickr.com/800/600/${keyword},landscape/all?lock=${tourId}`;
        const filePath = path.join(toursDir, `${tourId}.jpg`);
        
        try {
            await downloadImage(imgUrl, filePath);
            const localUrl = `http://localhost:8902/uploads/tours/images/${tourId}.jpg`;
            await pool.query('UPDATE tours SET image = ? WHERE id = ?', [localUrl, tourId]);
            console.log(`✅ Tải ảnh thành công cho ${destName}`);
        } catch (err) {
            console.error(`❌ Lỗi tải ảnh cho ${destName}:`, err.message);
        }
    }
    
    console.log('Hoàn tất thêm các tour thiếu!');
    process.exit(0);
};

run();
