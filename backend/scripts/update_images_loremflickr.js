const mysql = require('mysql2/promise');

const DESTINATION_PROMPTS = {
    'Phú Quốc': 'phuquoc,vietnam,beach,resort',
    'Đà Nẵng': 'danang,vietnam,goldenbridge,banahills',
    'Sapa': 'sapa,vietnam,terraced,rice,fields,mountains',
    'Hạ Long': 'halong,bay,vietnam,limestone,islands,cruise',
    'Bali': 'bali,indonesia,lempuyang,temple,tropical',
    'Huế': 'hue,vietnam,imperial,city,citadel',
    'Đà Lạt': 'dalat,vietnam,pine,forest,lake,mountains',
    'Quảng Bình': 'phongnha,cave,vietnam,stalactites,river',
    'Nha Trang': 'nhatrang,vietnam,beach,coastal,sea',
    'Ninh Bình': 'ninhbinh,trangan,vietnam,karst,landscape',
    'Mộc Châu': 'mocchau,vietnam,tea,hills,plateau',
    'Côn Đảo': 'condao,vietnam,pristine,beach,island',
    'Hà Giang': 'hagiang,vietnam,mapileng,pass,rocky,mountains',
    'Quy Nhơn': 'quynhon,vietnam,kyco,beach,coastal',
    'Bangkok': 'bangkok,thailand,watarun,temple,grandpalace',
    'Bắc Kinh': 'beijing,china,greatwall,forbidden,city',
    'Thượng Hải': 'shanghai,china,thebund,skyline,night',
    'Phuket': 'phuket,thailand,mayabay,tropical,beach',
    'Vịnh Marina': 'marinabaysands,singapore,gardensbythebay',
    'Seoul': 'seoul,southkorea,gyeongbokgung,palace,namsan',
    'Jeju': 'jeju,island,southkorea,hallasan,mountain',
    'Tokyo': 'tokyo,japan,mountfuji,shibuya,cherryblossoms',
    'Kyoto': 'kyoto,japan,fushimiinari,shrine,arashiyama',
    'Đài Bắc': 'taipei,taiwan,taipei101,jiufen,nightmarket',
    'New York': 'newyork,city,statueofliberty,manhattan,timessquare',
    'Los Angeles': 'losangeles,hollywood,santamonica,beach',
    'Paris': 'paris,france,eiffeltower,seine,river,sunset'
};

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

    const [tours] = await pool.query(`
        SELECT t.id, t.name, d.name AS dest_name 
        FROM tours t 
        LEFT JOIN tour_destination td ON t.id = td.tour_id 
        LEFT JOIN destination d ON td.destination_id = d.id
    `);
    
    console.log(`Đang cập nhật ảnh LoremFlickr (rất nhanh, không cần tải xuống) cho ${tours.length} tours...`);
    
    for (const tour of tours) {
        let keywords = 'travel,tourism,landscape';
        if (tour.dest_name && DESTINATION_PROMPTS[tour.dest_name]) {
            keywords = DESTINATION_PROMPTS[tour.dest_name];
        } else {
            const cleanName = removeAccents(tour.name).toLowerCase().replace(/[^a-z0-9]+/g, ',');
            keywords = cleanName.substring(0, 50) + ',travel,landscape';
        }
        
        // Use lock so that the same tour ID always gets the same image
        const imgUrl = `https://loremflickr.com/800/600/${keywords}/all?lock=${tour.id}`;
        
        await pool.query('UPDATE tours SET image = ? WHERE id = ?', [imgUrl, tour.id]);
        console.log(`✅ Đã cập nhật ảnh tour ${tour.id}: ${tour.dest_name || 'Khác'} -> ${keywords}`);
    }
    
    console.log('Hoàn tất cập nhật 100% database!');
    process.exit(0);
}

run();
