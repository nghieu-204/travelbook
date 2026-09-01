const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'travel_booking',
});

const downloadImage = (url, filepath) => {
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
                downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
            } else {
                reject(new Error(`Status Code: ${res.statusCode}`));
            }
        }).on('error', err => reject(err));
    });
};

const run = async () => {
    try {
        // Fix names using proper Node string encodings
        await pool.query("UPDATE destination SET name = 'Hà Nội' WHERE id = 28");
        await pool.query("UPDATE destination SET name = 'TP. Hồ Chí Minh' WHERE id = 29");
        await pool.query("UPDATE destination SET name = 'Cần Thơ' WHERE id = 30");
        console.log('Fixed destination names.');

        // Re-download images for 58 (HCM) and 59 (Can Tho) and 57 (Ha Noi) just in case
        const toursDir = path.join(__dirname, '../uploads/tours/images');
        
        const downloads = [
            { id: 57, keyword: 'hanoi,vietnam' },
            { id: 58, keyword: 'saigon,city' },
            { id: 59, keyword: 'mekong,river' }
        ];

        for (const item of downloads) {
            const url = `https://loremflickr.com/800/600/${item.keyword}/all?lock=${Math.floor(Math.random() * 1000)}`;
            const filepath = path.join(toursDir, `${item.id}.jpg`);
            await downloadImage(url, filepath);
            console.log(`Downloaded new image for tour ${item.id}`);
        }
        
        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
