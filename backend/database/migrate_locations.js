const { pool } = require('../config/db');

async function migrateLocations() {
    console.log('🔄 Bắt đầu tiến trình Migration Location...');
    
    try {
        // 1. Thêm cột destination_id vào bảng tours nếu chưa có
        try {
            await pool.query('ALTER TABLE tours ADD COLUMN destination_id INT NULL');
            console.log('✅ Đã thêm cột destination_id vào bảng tours');
            
            // Add foreign key constraint as well
            await pool.query('ALTER TABLE tours ADD CONSTRAINT fk_tours_destination FOREIGN KEY (destination_id) REFERENCES Destination(id) ON DELETE SET NULL');
            console.log('✅ Đã thêm khóa ngoại (Foreign Key) cho destination_id');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Cột destination_id đã tồn tại trong bảng tours');
            } else {
                console.log('⚠️ Không thể thêm cột/khóa ngoại tự động, có thể đã tồn tại:', e.message);
            }
        }

        // 2. Lấy toàn bộ các giá trị category, region, location duy nhất từ tours
        const [locations] = await pool.query('SELECT DISTINCT category, region, location FROM tours WHERE location IS NOT NULL AND location != ""');
        console.log(`🔍 Tìm thấy ${locations.length} tổ hợp location duy nhất từ bảng tours.`);

        for (const loc of locations) {
            const catName = loc.category || 'Chưa phân loại';
            const regName = loc.region || 'Chưa phân vùng';
            const destName = loc.location || 'Chưa rõ điểm đến';

            // 3. Xử lý Category
            let [catRows] = await pool.query('SELECT id FROM TourCategory WHERE name = ?', [catName]);
            let catId;
            if (catRows.length === 0) {
                const [result] = await pool.query('INSERT INTO TourCategory (name) VALUES (?)', [catName]);
                catId = result.insertId;
                console.log(`➕ Tạo mới Category: ${catName} (ID: ${catId})`);
            } else {
                catId = catRows[0].id;
            }

            // 4. Xử lý Region
            let [regRows] = await pool.query('SELECT id FROM Region WHERE name = ? AND category_id = ?', [regName, catId]);
            let regId;
            if (regRows.length === 0) {
                const [result] = await pool.query('INSERT INTO Region (category_id, name) VALUES (?, ?)', [catId, regName]);
                regId = result.insertId;
                console.log(`➕ Tạo mới Region: ${regName} (ID: ${regId}, CatID: ${catId})`);
            } else {
                regId = regRows[0].id;
            }

            // 5. Xử lý Destination
            let [destRows] = await pool.query('SELECT id FROM Destination WHERE name = ? AND region_id = ?', [destName, regId]);
            let destId;
            if (destRows.length === 0) {
                const [result] = await pool.query('INSERT INTO Destination (region_id, name) VALUES (?, ?)', [regId, destName]);
                destId = result.insertId;
                console.log(`➕ Tạo mới Destination: ${destName} (ID: ${destId}, RegID: ${regId})`);
            } else {
                destId = destRows[0].id;
            }

            // 6. Cập nhật lại các tour cũ
            let updateQuery = 'UPDATE tours SET destination_id = ? WHERE location = ?';
            let updateParams = [destId, loc.location];
            
            // Xử lý cẩn thận null/empty values của category/region trong query cũ
            if (loc.category) {
                updateQuery += ' AND category = ?';
                updateParams.push(loc.category);
            }
            if (loc.region) {
                updateQuery += ' AND region = ?';
                updateParams.push(loc.region);
            }

            const [updateResult] = await pool.query(updateQuery, updateParams);
            console.log(`✅ Đã cập nhật ${updateResult.affectedRows} tour sang destination_id=${destId} (${destName})`);
        }

        console.log('🎉 Hoàn tất Migration thành công!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi Migration:', error);
        process.exit(1);
    }
}

migrateLocations();
