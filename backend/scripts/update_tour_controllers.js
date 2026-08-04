const fs = require('fs');
const path = require('path');

function updateController(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. getTours: SELECT and JSON parsing
    content = content.replace(
        /SELECT t\.\*,\s+\(SELECT GROUP_CONCAT[^\)]+\) AS location,\s+\(SELECT r\.name[^\)]+\) AS region,\s+\(SELECT c\.name[^\)]+\) AS category/g,
        `SELECT t.*, 
                   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', d.id, 'name', d.name, 'is_primary', td.is_primary)) FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id) AS destinations,
                   (SELECT r.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS region, 
                   (SELECT c.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id JOIN tourcategory c ON r.category_id = c.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS category`
    );

    // Parsing JSON in getTours
    if (!content.includes('rows = rows.map(r =>')) {
        content = content.replace(
            /const \[rows\] = await pool\.query\(query, params\);\n\s+res\.json\(rows\);/g,
            `let [rows] = await pool.query(query, params);
        rows = rows.map(r => {
            if (typeof r.destinations === 'string') {
                try { r.destinations = JSON.parse(r.destinations); } catch(e) { r.destinations = []; }
            }
            return r;
        });
        res.json(rows);`
        );
    }

    // 2. getTours: Filters
    content = content.replace(
        /EXISTS \(SELECT 1 FROM Tour_Destination td JOIN destination d ON td\.destination_id = d\.id WHERE td\.tour_id = t\.id AND d\.name = \?\)/g,
        `t.id IN (SELECT td.tour_id FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id WHERE d.name = ?)`
    );
    content = content.replace(
        /EXISTS \(SELECT 1 FROM Tour_Destination td JOIN destination d ON td\.destination_id = d\.id JOIN region r ON d\.region_id = r\.id WHERE td\.tour_id = t\.id AND r\.name = \?\)/g,
        `t.id IN (SELECT td.tour_id FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id WHERE r.name = ?)`
    );
    content = content.replace(
        /EXISTS \(SELECT 1 FROM Tour_Destination td JOIN destination d ON td\.destination_id = d\.id JOIN region r ON d\.region_id = r\.id JOIN tourcategory c ON r\.category_id = c\.id WHERE td\.tour_id = t\.id AND c\.name = \?\)/g,
        `t.id IN (SELECT td.tour_id FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id JOIN tourcategory c ON r.category_id = c.id WHERE c.name = ?)`
    );

    // 3. getTourById: Parse JSON
    if (!content.includes('typeof tour.destinations === \'string\'')) {
        content = content.replace(
            /const tour = rows\[0\];/g,
            `const tour = rows[0];\n        if (typeof tour.destinations === 'string') { try { tour.destinations = JSON.parse(tour.destinations); } catch(e){ tour.destinations = []; } }`
        );
    }
    content = content.replace(
        /const \[dests\] = await pool\.query\('SELECT destination_id FROM Tour_Destination WHERE tour_id = \?', \[id\]\);\n\s+tour\.destinations = dests\.map\(d => d\.destination_id\);/g,
        ``
    );

    // 4. createTour Transaction
    if (!content.includes('const connection = await pool.getConnection();')) {
        // Find the signature
        const isUserCtrl = filePath.includes('user');
        const reqBodyPattern = isUserCtrl 
            ? /const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, destinations, tourTypes, occasions, tour_code, notes, departure_location } = req\.body;/g 
            : /const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, destinations, tourTypes, occasions, tour_code, notes } = req\.body;/g;
        
        let destructReplacement = isUserCtrl 
            ? `const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destinations, primary_destination_id, tourTypes, occasions, tour_code, notes, departure_location } = req.body;
        const connection = await pool.getConnection();
        await connection.beginTransaction();`
            : `const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destinations, primary_destination_id, tourTypes, occasions, tour_code, notes } = req.body;
        const connection = await pool.getConnection();
        await connection.beginTransaction();`;

        content = content.replace(reqBodyPattern, destructReplacement);

        // Replace pool.query with connection.query in createTour
        let createTourMatch = content.match(/const \[result\] = await pool\.query\(([\s\S]*?)const tourId = result\.insertId;([\s\S]*?)res\.status\(201\)\.json/);
        if (createTourMatch) {
            let modified = createTourMatch[0].replace(/pool\.query/g, 'connection.query');
            // Remove destination_id from insert
            modified = modified.replace(/destination_id, tour_code/g, 'tour_code');
            modified = modified.replace(/destination_id \|\| null, tour_code/g, 'tour_code');
            modified = modified.replace(/, \?, \?, \?/, ', ?, ?'); // one less ?
            
            // Destinations insert
            modified = modified.replace(/if \(destinations\) \{[\s\S]*?\} else if \(destination_id\) \{[\s\S]*?\}/, 
            `if (destinations) {
            let destArr = typeof destinations === 'string' ? JSON.parse(destinations) : destinations;
            for (let destId of destArr) {
                const isPrimary = (destId == primary_destination_id);
                await connection.query('INSERT IGNORE INTO Tour_Destination (tour_id, destination_id, is_primary) VALUES (?, ?, ?)', [tourId, destId, isPrimary]);
            }
        }`);

            modified = modified.replace(/res\.status\(201\)\.json/, `await connection.commit();\n        res.status(201).json`);
            
            // Replace the whole block
            content = content.replace(createTourMatch[0], modified);
            
            // Fix the catch block
            content = content.replace(
                /} catch \(error\) {([\s\S]*?)console\.error\("Lỗi thêm tour:"/g,
                `} catch (error) {\n        if (connection) await connection.rollback();\n        console.error("Lỗi thêm tour:"`
            );
            // Finally
            content = content.replace(
                /res\.status\(500\)\.json\(\{ message: "Lỗi máy chủ khi thêm tour" \}\);\n\s+\}/g,
                `res.status(500).json({ message: "Lỗi máy chủ khi thêm tour" });\n    } finally {\n        if (connection) connection.release();\n    }`
            );
        }
    }

    // 5. updateTour Transaction
    if (!content.includes('const conn = await pool.getConnection();')) {
        const isUserCtrl = filePath.includes('user');
        const reqBodyPattern = isUserCtrl 
            ? /const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, destinations, tourTypes, occasions, tour_code, notes, departure_location } = req\.body;/g 
            : /const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, destinations, tourTypes, occasions, tour_code, notes } = req\.body;/g;
        
        let destructReplacement = isUserCtrl 
            ? `const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destinations, primary_destination_id, tourTypes, occasions, tour_code, notes, departure_location } = req.body;
        const conn = await pool.getConnection();
        await conn.beginTransaction();`
            : `const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destinations, primary_destination_id, tourTypes, occasions, tour_code, notes } = req.body;
        const conn = await pool.getConnection();
        await conn.beginTransaction();`;

        content = content.replace(reqBodyPattern, destructReplacement);

        // Replace pool.query with conn.query in updateTour
        let updateTourMatch = content.match(/await pool\.query\(\s+`UPDATE tours SET ([\s\S]*?)res\.json\(\{ message: "🎉 Cập nhật thông tin tour thành công!" \}\);/);
        if (updateTourMatch) {
            let modified = updateTourMatch[0].replace(/pool\.query/g, 'conn.query');
            // Remove destination_id from insert
            modified = modified.replace(/destination_id=\?, tour_code/g, 'tour_code');
            modified = modified.replace(/destination_id \|\| null, tour_code/g, 'tour_code');
            
            // Destinations insert
            modified = modified.replace(/if \(destinations\) \{[\s\S]*?\} else if \(destination_id\) \{[\s\S]*?\}/, 
            `if (destinations) {
            await conn.query('DELETE FROM Tour_Destination WHERE tour_id = ?', [id]);
            let destArr = typeof destinations === 'string' ? JSON.parse(destinations) : destinations;
            for (let destId of destArr) {
                const isPrimary = (destId == primary_destination_id);
                await conn.query('INSERT IGNORE INTO Tour_Destination (tour_id, destination_id, is_primary) VALUES (?, ?, ?)', [id, destId, isPrimary]);
            }
        }`);

            modified = modified.replace(/res\.json\(\{/, `await conn.commit();\n        res.json({`);
            
            content = content.replace(updateTourMatch[0], modified);
            
            // Fix the catch block
            content = content.replace(
                /} catch \(error\) {([\s\S]*?)console\.error\("Lỗi cập nhật tour:"/g,
                `} catch (error) {\n        if (conn) await conn.rollback();\n        console.error("Lỗi cập nhật tour:"`
            );
            // Finally
            content = content.replace(
                /res\.status\(500\)\.json\(\{ message: error\.message \}\);\n\s+\}/g,
                `res.status(500).json({ message: error.message });\n    } finally {\n        if (conn) conn.release();\n    }`
            );
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

updateController(path.join(__dirname, '../controllers/admin/tourController.js'));
updateController(path.join(__dirname, '../controllers/user/tourController.js'));
