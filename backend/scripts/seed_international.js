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

    console.log('--- Bắt đầu thêm dữ liệu Tour Quốc Tế ---');

    // 1. Ensure categories exist
    let [cats] = await pool.query('SELECT id FROM tourcategory WHERE name = "Quốc tế" OR name = "Tour Quốc Tế" LIMIT 1');
    let intlCatId = cats.length > 0 ? cats[0].id : null;
    if (!intlCatId) {
        const [res] = await pool.query('INSERT INTO tourcategory (name) VALUES ("Quốc tế")');
        intlCatId = res.insertId;
    }

    // 2. Ensure region Châu Á exists (it's ID 4 from earlier query, but let's check)
    let [regs] = await pool.query('SELECT id FROM region WHERE name = "Châu Á" LIMIT 1');
    let asiaRegionId = regs.length > 0 ? regs[0].id : null;
    if (!asiaRegionId) {
        const [res] = await pool.query('INSERT INTO region (name, category_id) VALUES ("Châu Á", ?)', [intlCatId]);
        asiaRegionId = res.insertId;
    }

    let [regsAm] = await pool.query('SELECT id FROM region WHERE name = "Châu Mỹ" LIMIT 1');
    let americaRegionId = regsAm.length > 0 ? regsAm[0].id : null;
    if (!americaRegionId) {
        const [res] = await pool.query('INSERT INTO region (name, category_id) VALUES ("Châu Mỹ", ?)', [intlCatId]);
        americaRegionId = res.insertId;
    }

    let [regsEu] = await pool.query('SELECT id FROM region WHERE name = "Châu Âu" LIMIT 1');
    let europeRegionId = regsEu.length > 0 ? regsEu[0].id : null;
    if (!europeRegionId) {
        const [res] = await pool.query('INSERT INTO region (name, category_id) VALUES ("Châu Âu", ?)', [intlCatId]);
        europeRegionId = res.insertId;
    }

    // 3. Ensure Countries
    const countriesToAdd = [
        { name: 'Trung Quốc', region_id: asiaRegionId },
        { name: 'Thái Lan', region_id: asiaRegionId }, // Might exist, will check
        { name: 'Singapore', region_id: asiaRegionId },
        { name: 'Hàn Quốc', region_id: asiaRegionId },
        { name: 'Nhật Bản', region_id: asiaRegionId },
        { name: 'Đài Loan', region_id: asiaRegionId },
        { name: 'Mỹ', region_id: americaRegionId },
        { name: 'Pháp', region_id: europeRegionId }
    ];

    const countryIds = {};
    for (const c of countriesToAdd) {
        let [existing] = await pool.query('SELECT id FROM country WHERE name = ?', [c.name]);
        if (existing.length > 0) {
            countryIds[c.name] = existing[0].id;
        } else {
            const [res] = await pool.query('INSERT INTO country (name, region_id) VALUES (?, ?)', [c.name, c.region_id]);
            countryIds[c.name] = res.insertId;
        }
    }

    // 4. Ensure Destinations
    const destsToAdd = [
        { name: 'Bắc Kinh', country: 'Trung Quốc', region_id: asiaRegionId },
        { name: 'Thượng Hải', country: 'Trung Quốc', region_id: asiaRegionId },
        { name: 'Bangkok', country: 'Thái Lan', region_id: asiaRegionId },
        { name: 'Phuket', country: 'Thái Lan', region_id: asiaRegionId },
        { name: 'Vịnh Marina', country: 'Singapore', region_id: asiaRegionId },
        { name: 'Seoul', country: 'Hàn Quốc', region_id: asiaRegionId },
        { name: 'Jeju', country: 'Hàn Quốc', region_id: asiaRegionId },
        { name: 'Tokyo', country: 'Nhật Bản', region_id: asiaRegionId },
        { name: 'Kyoto', country: 'Nhật Bản', region_id: asiaRegionId },
        { name: 'Đài Bắc', country: 'Đài Loan', region_id: asiaRegionId },
        { name: 'New York', country: 'Mỹ', region_id: americaRegionId },
        { name: 'Los Angeles', country: 'Mỹ', region_id: americaRegionId },
        { name: 'Paris', country: 'Pháp', region_id: europeRegionId }
    ];

    const destIds = {};
    for (const d of destsToAdd) {
        let [existing] = await pool.query('SELECT id FROM destination WHERE name = ?', [d.name]);
        if (existing.length > 0) {
            destIds[d.name] = existing[0].id;
        } else {
            const countryId = countryIds[d.country];
            const [res] = await pool.query('INSERT INTO destination (name, region_id, country_id) VALUES (?, ?, ?)', [d.name, d.region_id, countryId]);
            destIds[d.name] = res.insertId;
        }
    }

    // 5. Add new Tours
    const newTours = [
        { name: 'Khám Phá Vạn Lý Trường Thành - Cố Cung', dest: 'Bắc Kinh', price: 12500000, duration: '5 Ngày 4 Đêm' },
        { name: 'Thượng Hải Hiện Đại & Hàng Châu Thơ Mộng', dest: 'Thượng Hải', price: 14000000, duration: '6 Ngày 5 Đêm' },
        { name: 'Thiên Đường Nghỉ Dưỡng Phuket', dest: 'Phuket', price: 8500000, duration: '4 Ngày 3 Đêm' },
        { name: 'Đảo Quốc Sư Tử Singapore - Vui chơi Universal', dest: 'Vịnh Marina', price: 11000000, duration: '4 Ngày 3 Đêm' },
        { name: 'Mùa Thu Lá Vàng Nami - Cảnh Phúc Cung Seoul', dest: 'Seoul', price: 15500000, duration: '5 Ngày 4 Đêm' },
        { name: 'Đảo Ngọc Jeju - Lãng Mạn Hàn Quốc', dest: 'Jeju', price: 13500000, duration: '4 Ngày 3 Đêm' },
        { name: 'Sắc Màu Tokyo - Chùa Cổ Asakusa', dest: 'Tokyo', price: 22000000, duration: '5 Ngày 4 Đêm' },
        { name: 'Hành Trình Di Sản Cố Đô Kyoto', dest: 'Kyoto', price: 23500000, duration: '6 Ngày 5 Đêm' },
        { name: 'Đài Loan Trọn Vẹn: Đài Bắc - Nhật Nguyệt Đàm', dest: 'Đài Bắc', price: 10500000, duration: '5 Ngày 4 Đêm' },
        { name: 'Khám Phá Bờ Đông Hoa Kỳ: New York - Washington DC', dest: 'New York', price: 65000000, duration: '8 Ngày 7 Đêm' },
        { name: 'Kinh Đô Điện Ảnh Hollywood - Bờ Tây Nước Mỹ', dest: 'Los Angeles', price: 62000000, duration: '7 Ngày 6 Đêm' },
        { name: 'Châu Âu Lãng Mạn: Paris - Tháp Eiffel - Sông Seine', dest: 'Paris', price: 58000000, duration: '7 Ngày 6 Đêm' }
    ];

    for (const t of newTours) {
        let [existing] = await pool.query('SELECT id FROM tours WHERE name = ?', [t.name]);
        if (existing.length === 0) {
            let cleanName = removeAccents(t.name);
            if (cleanName.length > 50) cleanName = cleanName.substring(0, 50);
            const prompt = encodeURIComponent(cleanName + ' travel tourism beautiful landscape landmark');
            const imgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true`;

            const [res] = await pool.query(
                `INSERT INTO tours (name, price, original_price, available_spots, departure_date, duration, image, description, departure_destination_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [t.name, t.price, t.price * 1.2, 20, '2026-10-10', t.duration, imgUrl, `Khám phá những điểm đến tuyệt vời tại ${t.dest} với giá cả ưu đãi.`, 1] // Assuming 1 is TP HCM or valid destination
            );
            const newTourId = res.insertId;

            const destId = destIds[t.dest];
            if (destId) {
                await pool.query('INSERT INTO tour_destination (tour_id, destination_id, is_primary) VALUES (?, ?, 1)', [newTourId, destId]);
            }
            console.log(`Added international tour: ${t.name}`);
        }
    }

    console.log('--- Hoàn tất ---');
    process.exit(0);
}

run();
