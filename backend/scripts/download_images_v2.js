const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DESTINATION_PROMPTS = {
    'Phú Quốc': 'Phu Quoc Island Vietnam white sand beach turquoise water tropical resort',
    'Đà Nẵng': 'Da Nang Vietnam Golden Bridge Ba Na Hills Hands bridge beautiful sunset',
    'Sapa': 'Sapa Vietnam terraced rice fields mountains ethnic villages foggy morning',
    'Hạ Long': 'Ha Long Bay Vietnam limestone islands karst emerald water cruise ship',
    'Bali': 'Bali Indonesia Pura Lempuyang Gate of Heaven tropical jungle sunset',
    'Huế': 'Hue Vietnam Imperial City Citadel traditional architecture ancient capital',
    'Đà Lạt': 'Da Lat Vietnam pine forest romantic lake French architecture mountains',
    'Quảng Bình': 'Phong Nha Ke Bang Son Doong Cave Vietnam giant cavern stalactites underground river',
    'Nha Trang': 'Nha Trang Vietnam beautiful beach coastal city Vinpearl island sea',
    'Ninh Bình': 'Ninh Binh Trang An Vietnam karst landscape river boats like Ha Long on land',
    'Mộc Châu': 'Moc Chau Vietnam tea hills plateau white plum blossoms ethnic',
    'Côn Đảo': 'Con Dao Vietnam pristine beach turquoise sea island paradise',
    'Hà Giang': 'Ha Giang Loop Vietnam Ma Pi Leng pass rocky plateau stunning mountains',
    'Quy Nhơn': 'Quy Nhon Ky Co beach Eo Gio Vietnam beautiful coastal landscape',
    'Bangkok': 'Bangkok Thailand Wat Arun temple Grand Palace tuktuk city street',
    'Bắc Kinh': 'Beijing China Great Wall of China Forbidden City ancient architecture',
    'Thượng Hải': 'Shanghai China The Bund skyline Oriental Pearl Tower night city',
    'Phuket': 'Phuket Thailand Maya Bay tropical beach longtail boat limestone cliffs',
    'Vịnh Marina': 'Marina Bay Sands Singapore Gardens by the Bay Supertree Grove city',
    'Seoul': 'Seoul South Korea Gyeongbokgung Palace Namsan Tower cherry blossoms',
    'Jeju': 'Jeju Island South Korea Hallasan mountain volcanic coast beautiful nature',
    'Tokyo': 'Tokyo Japan Mount Fuji in background Shibuya crossing cherry blossoms',
    'Kyoto': 'Kyoto Japan Fushimi Inari shrine red gates Arashiyama bamboo forest',
    'Đài Bắc': 'Taipei Taiwan Taipei 101 building Jiufen old street night market',
    'New York': 'New York City Statue of Liberty Manhattan skyline Times Square',
    'Los Angeles': 'Los Angeles Hollywood sign Santa Monica beach palm trees',
    'Paris': 'Paris France Eiffel Tower Seine river romantic sunset'
};

const downloadImage = (url, filepath, retries = 2) => {
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
                downloadImage(res.headers.location, filepath, retries).then(resolve).catch(reject);
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
    const toursDir = path.join(uploadDir, 'tours');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    if (!fs.existsSync(toursDir)) fs.mkdirSync(toursDir);

    const [tours] = await pool.query(`
        SELECT t.id, t.name, d.name AS dest_name 
        FROM tours t 
        LEFT JOIN tour_destination td ON t.id = td.tour_id 
        LEFT JOIN destination d ON td.destination_id = d.id
    `);
    
    console.log(`Bắt đầu tải ảnh CHẤT LƯỢNG CAO cho ${tours.length} tours (tuần tự để tránh rate limit)...`);
    
    for (const tour of tours) {
        let promptText = 'travel tourism beautiful landscape';
        if (tour.dest_name && DESTINATION_PROMPTS[tour.dest_name]) {
            promptText = DESTINATION_PROMPTS[tour.dest_name];
        } else {
            const cleanName = tour.name.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
            promptText = cleanName.substring(0, 50) + ' travel beautiful landscape';
        }
        
        promptText += ` cinematic lighting 8k resolution photo ${Math.floor(Math.random() * 1000)}`;

        const prompt = encodeURIComponent(promptText);
        const imgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true`;
        
        const filePath = path.join(toursDir, `${tour.id}.jpg`);
        try {
            await downloadImage(imgUrl, filePath);
            const localUrl = `http://localhost:8902/uploads/tours/${tour.id}.jpg`;
            await pool.query('UPDATE tours SET image = ? WHERE id = ?', [localUrl, tour.id]);
            console.log(`✅ [${tour.id}] Đã tải: ${tour.dest_name || 'Khác'} -> ${promptText.substring(0, 30)}...`);
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
