const { pool } = require('../config/db');

async function run() {
  const provinces = [
    { name: 'Lào Cai', region_id: 1, dests: ['Sapa', 'Lào Cai'] },
    { name: 'Quảng Ninh', region_id: 1, dests: ['Hạ Long'] },
    { name: 'Ninh Bình', region_id: 1, dests: ['Ninh Bình'] },
    { name: 'Sơn La', region_id: 1, dests: ['Mộc Châu'] },
    { name: 'Hà Giang', region_id: 1, dests: ['Hà Giang'] },
    { name: 'Cao Bằng', region_id: 1, dests: ['Cao bằng'] },
    { name: 'Hà Nội', region_id: 1, dests: ['Hà Nội'] },
    { name: 'Hà Nam', region_id: 1, dests: ['Hà Nam'] },
    
    { name: 'Đà Nẵng', region_id: 2, dests: ['Đà Nẵng'] },
    { name: 'Thừa Thiên Huế', region_id: 2, dests: ['Huế'] },
    { name: 'Lâm Đồng', region_id: 2, dests: ['Đà Lạt'] },
    { name: 'Quảng Bình', region_id: 2, dests: ['Quảng Bình'] },
    { name: 'Bình Định', region_id: 2, dests: ['Quy Nhơn'] },
    { name: 'Quảng Nam', region_id: 2, dests: ['Quảng Nam'] },
    { name: 'Quảng Trị', region_id: 2, dests: ['Quảng Trị'] },
    
    { name: 'Kiên Giang', region_id: 3, dests: ['Phú Quốc'] },
    { name: 'Khánh Hòa', region_id: 3, dests: ['Nha Trang'] },
    { name: 'Bà Rịa - Vũng Tàu', region_id: 3, dests: ['Côn Đảo'] }
  ];

  try {
    for (const p of provinces) {
      // insert or get country
      let [existing] = await pool.query('SELECT id FROM country WHERE name = ? AND region_id = ?', [p.name, p.region_id]);
      let countryId;
      if (existing.length > 0) {
        countryId = existing[0].id;
      } else {
        const [result] = await pool.query('INSERT INTO country (name, region_id) VALUES (?, ?)', [p.name, p.region_id]);
        countryId = result.insertId;
      }

      // update destinations
      for (const d of p.dests) {
        await pool.query('UPDATE destination SET country_id = ? WHERE name = ?', [countryId, d]);
        console.log(`Updated ${d} -> ${p.name}`);
      }
    }
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

run();
