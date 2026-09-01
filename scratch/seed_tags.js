const { pool } = require('../backend/config/db');

async function seed() {
    try {
        console.log('Seeding tourtypes...');
        const types = ['Nghỉ dưỡng', 'Sinh thái', 'Biển', 'Khám phá', 'Văn hóa', 'Gia đình', 'Lãng mạn', 'Núi rừng'];
        
        for (const type of types) {
            await pool.query('INSERT IGNORE INTO tourtype (name) VALUES (?)', [type]);
        }
        
        const [tourtypes] = await pool.query('SELECT * FROM tourtype');
        const typeMap = {};
        tourtypes.forEach(t => typeMap[t.name] = t.id);

        console.log('Mapping to tours...');
        const mappings = [
            { id: 1, tags: ['Biển', 'Nghỉ dưỡng', 'Khám phá'] }, // Phú Quốc
            { id: 2, tags: ['Biển', 'Gia đình'] }, // Đà Nẵng
            { id: 3, tags: ['Núi rừng', 'Khám phá'] }, // Sapa
            { id: 4, tags: ['Biển', 'Lãng mạn', 'Nghỉ dưỡng'] }, // Hạ Long
            { id: 5, tags: ['Biển', 'Văn hóa', 'Lãng mạn'] }, // Bali
            { id: 6, tags: ['Văn hóa', 'Khám phá'] }, // Huế, Hội An
            { id: 7, tags: ['Núi rừng', 'Lãng mạn'] }, // Đà Lạt
            { id: 8, tags: ['Khám phá', 'Sinh thái'] }, // Sơn Đoòng
            { id: 9, tags: ['Biển', 'Gia đình', 'Nghỉ dưỡng'] }, // Nha Trang
            { id: 10, tags: ['Văn hóa', 'Gia đình'] }, // Hà Nội, Ninh Bình
            { id: 11, tags: ['Núi rừng', 'Sinh thái'] }, // Tây Bắc
            { id: 12, tags: ['Biển', 'Sinh thái'] }, // Côn Đảo
            { id: 13, tags: ['Núi rừng', 'Khám phá'] }, // Hà Giang
            { id: 14, tags: ['Biển', 'Khám phá'] }, // Quy Nhơn
            { id: 15, tags: ['Khám phá', 'Văn hóa', 'Gia đình'] } // Thái Lan
        ];

        for (const m of mappings) {
            for (const tagName of m.tags) {
                const typeId = typeMap[tagName];
                if (typeId) {
                    await pool.query('INSERT IGNORE INTO tour_tourtype (tour_id, type_id) VALUES (?, ?)', [m.id, typeId]);
                }
            }
        }
        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
