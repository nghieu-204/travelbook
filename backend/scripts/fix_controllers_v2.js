const fs = require('fs');
const path = require('path');

function fixController(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. getTours SELECT
    content = content.replace(
        `SELECT t.*, \n                   d.name AS location, \n                   r.name AS region, \n                   c.name AS category \n            FROM tours t\n            LEFT JOIN destination d ON t.destination_id = d.id\n            LEFT JOIN region r ON d.region_id = r.id\n            LEFT JOIN tourcategory c ON r.category_id = c.id`,
        `SELECT t.*, \n                   (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', d.id, 'name', d.name, 'is_primary', td.is_primary)), ']') FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id) AS destinations,\n                   (SELECT r.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS region, \n                   (SELECT c.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id JOIN tourcategory c ON r.category_id = c.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS category \n            FROM tours t`
    );

    // 2. getTours Parse JSON
    content = content.replace(
        `const [rows] = await pool.query(query, params);\n        res.json(rows);`,
        `let [rows] = await pool.query(query, params);\n        rows = rows.map(r => {\n            if (typeof r.destinations === 'string') {\n                try { r.destinations = JSON.parse(r.destinations); } catch(e) { r.destinations = []; }\n            }\n            return r;\n        });\n        res.json(rows);`
    );

    // 3. getTours Filters
    content = content.replace(
        `query += ' AND d.name = ?';`,
        `query += ' AND t.id IN (SELECT td.tour_id FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id WHERE d.name = ?)';`
    );
    content = content.replace(
        `query += ' AND r.name = ?';`,
        `query += ' AND t.id IN (SELECT td.tour_id FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id WHERE r.name = ?)';`
    );
    content = content.replace(
        `query += ' AND c.name = ?';`,
        `query += ' AND t.id IN (SELECT td.tour_id FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id JOIN tourcategory c ON r.category_id = c.id WHERE c.name = ?)';`
    );

    // 4. getTourById SELECT (Same as above)
    content = content.replace(
        `SELECT t.*, \n                   d.name AS location, \n                   r.name AS region, \n                   c.name AS category \n            FROM tours t\n            LEFT JOIN destination d ON t.destination_id = d.id\n            LEFT JOIN region r ON d.region_id = r.id\n            LEFT JOIN tourcategory c ON r.category_id = c.id`,
        `SELECT t.*, \n                   (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', d.id, 'name', d.name, 'is_primary', td.is_primary)), ']') FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id) AS destinations,\n                   (SELECT r.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS region, \n                   (SELECT c.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id JOIN tourcategory c ON r.category_id = c.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS category \n            FROM tours t`
    );

    // 5. getTourById Parse JSON
    content = content.replace(
        `const tour = rows[0];`,
        `const tour = rows[0];\n        if (typeof tour.destinations === 'string') { try { tour.destinations = JSON.parse(tour.destinations); } catch(e){ tour.destinations = []; } }`
    );

    // 6. createTour
    const createBody = `const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, tourTypes, occasions, tour_code, notes, departure_location } = req.body;`;
    const newCreateBody = `let connection;\n        const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destinations, primary_destination_id, tourTypes, occasions, tour_code, notes, departure_location } = req.body;\n        connection = await pool.getConnection();\n        await connection.beginTransaction();`;
    content = content.replace(createBody, newCreateBody);

    const createInsert = `const [result] = await pool.query(
            \`INSERT INTO tours (name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, tour_code, notes, departure_location)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
            [name, price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, image, galleryJson, badge || 'Mới', description, itineraryJson, includedJson, excludedJson, destination_id || null, tour_code || null, notesJson, departure_location || 'TP HCM']
        );`;
    const newCreateInsert = `const [result] = await connection.query(
            \`INSERT INTO tours (name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, tour_code, notes, departure_location)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
            [name, price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, image, galleryJson, badge || 'Mới', description, itineraryJson, includedJson, excludedJson, tour_code || null, notesJson, departure_location || 'TP HCM']
        );`;
    content = content.replace(createInsert, newCreateInsert);

    // Fix pool.query in Tags for createTour
    content = content.replace(
        `let typesArr = typeof tourTypes === 'string' ? JSON.parse(tourTypes) : tourTypes;\n            for (let typeId of typesArr) {\n                await pool.query('INSERT IGNORE INTO Tour_TourType (tour_id, type_id) VALUES (?, ?)', [tourId, typeId]);\n            }`,
        `let typesArr = typeof tourTypes === 'string' ? JSON.parse(tourTypes) : tourTypes;\n            for (let typeId of typesArr) {\n                await connection.query('INSERT IGNORE INTO Tour_TourType (tour_id, type_id) VALUES (?, ?)', [tourId, typeId]);\n            }`
    );
    content = content.replace(
        `let occArr = typeof occasions === 'string' ? JSON.parse(occasions) : occasions;\n            for (let occId of occArr) {\n                await pool.query('INSERT IGNORE INTO Tour_Occasion (tour_id, occasion_id) VALUES (?, ?)', [tourId, occId]);\n            }`,
        `let occArr = typeof occasions === 'string' ? JSON.parse(occasions) : occasions;\n            for (let occId of occArr) {\n                await connection.query('INSERT IGNORE INTO Tour_Occasion (tour_id, occasion_id) VALUES (?, ?)', [tourId, occId]);\n            }`
    );

    // Inject destination handling for create
    const createSuccess = `res.status(201).json({ message: "🎉 Thêm tour mới thành công!", tourId });`;
    const newCreateSuccess = `if (destinations) {\n            let destArr = typeof destinations === 'string' ? JSON.parse(destinations) : destinations;\n            for (let destId of destArr) {\n                const isPrimary = (destId == primary_destination_id);\n                await connection.query('INSERT IGNORE INTO Tour_Destination (tour_id, destination_id, is_primary) VALUES (?, ?, ?)', [tourId, destId, isPrimary]);\n            }\n        }\n\n        await connection.commit();\n        res.status(201).json({ message: "🎉 Thêm tour mới thành công!", tourId });`;
    content = content.replace(createSuccess, newCreateSuccess);

    // Fix catch for create
    const createCatch = `} catch (error) {\n        console.error("Lỗi thêm tour:", error.message);\n        res.status(500).json({ message: "Lỗi máy chủ khi thêm tour" });\n    }`;
    const newCreateCatch = `} catch (error) {\n        if (typeof connection !== 'undefined' && connection) await connection.rollback();\n        console.error("Lỗi thêm tour:", error.message);\n        res.status(500).json({ message: "Lỗi máy chủ khi thêm tour" });\n    } finally {\n        if (typeof connection !== 'undefined' && connection) connection.release();\n    }`;
    content = content.replace(createCatch, newCreateCatch);


    // 7. updateTour
    const updateBody = `const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destination_id, tourTypes, occasions, tour_code, notes, departure_location } = req.body;`;
    const newUpdateBody = `let connection;\n        const { name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, badge, description, itinerary, included, excluded, destinations, primary_destination_id, tourTypes, occasions, tour_code, notes, departure_location } = req.body;\n        connection = await pool.getConnection();\n        await connection.beginTransaction();`;
    content = content.replace(updateBody, newUpdateBody);

    const updateQuery = `await pool.query(
            \`UPDATE tours SET name=?, price=?, original_price=?, child_price=?, available_spots=?, departure_date=?, duration=?, image=?, gallery=?, badge=?, description=?, itinerary=?, included=?, excluded=?, destination_id=?, tour_code=?, notes=?, departure_location=?
             WHERE id=?\`,
            [name, price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, image, galleryJson, badge, description, itineraryJson, includedJson, excludedJson, destination_id || null, tour_code || null, notesJson, departure_location || 'TP HCM', id]
        );`;
    const newUpdateQuery = `await connection.query(
            \`UPDATE tours SET name=?, price=?, original_price=?, child_price=?, available_spots=?, departure_date=?, duration=?, image=?, gallery=?, badge=?, description=?, itinerary=?, included=?, excluded=?, tour_code=?, notes=?, departure_location=?
             WHERE id=?\`,
            [name, price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, image, galleryJson, badge, description, itineraryJson, includedJson, excludedJson, tour_code || null, notesJson, departure_location || 'TP HCM', id]
        );`;
    content = content.replace(updateQuery, newUpdateQuery);

    // Fix pool.query in Tags for updateTour
    content = content.replace(
        `await pool.query('DELETE FROM Tour_TourType WHERE tour_id = ?', [id]);\n            let typesArr = typeof tourTypes === 'string' ? JSON.parse(tourTypes) : tourTypes;\n            for (let typeId of typesArr) {\n                await pool.query('INSERT IGNORE INTO Tour_TourType (tour_id, type_id) VALUES (?, ?)', [id, typeId]);\n            }`,
        `await connection.query('DELETE FROM Tour_TourType WHERE tour_id = ?', [id]);\n            let typesArr = typeof tourTypes === 'string' ? JSON.parse(tourTypes) : tourTypes;\n            for (let typeId of typesArr) {\n                await connection.query('INSERT IGNORE INTO Tour_TourType (tour_id, type_id) VALUES (?, ?)', [id, typeId]);\n            }`
    );
    content = content.replace(
        `await pool.query('DELETE FROM Tour_Occasion WHERE tour_id = ?', [id]);\n            let occArr = typeof occasions === 'string' ? JSON.parse(occasions) : occasions;\n            for (let occId of occArr) {\n                await pool.query('INSERT IGNORE INTO Tour_Occasion (tour_id, occasion_id) VALUES (?, ?)', [id, occId]);\n            }`,
        `await connection.query('DELETE FROM Tour_Occasion WHERE tour_id = ?', [id]);\n            let occArr = typeof occasions === 'string' ? JSON.parse(occasions) : occasions;\n            for (let occId of occArr) {\n                await connection.query('INSERT IGNORE INTO Tour_Occasion (tour_id, occasion_id) VALUES (?, ?)', [id, occId]);\n            }`
    );

    // Inject destination handling for update
    const updateSuccess = `res.json({ message: "🎉 Cập nhật thông tin tour thành công!" });`;
    const newUpdateSuccess = `if (destinations) {\n            await connection.query('DELETE FROM Tour_Destination WHERE tour_id = ?', [id]);\n            let destArr = typeof destinations === 'string' ? JSON.parse(destinations) : destinations;\n            for (let destId of destArr) {\n                const isPrimary = (destId == primary_destination_id);\n                await connection.query('INSERT IGNORE INTO Tour_Destination (tour_id, destination_id, is_primary) VALUES (?, ?, ?)', [id, destId, isPrimary]);\n            }\n        }\n\n        await connection.commit();\n        res.json({ message: "🎉 Cập nhật thông tin tour thành công!" });`;
    content = content.replace(updateSuccess, newUpdateSuccess);

    // Fix catch for update
    const updateCatch = `} catch (error) {\n        console.error("Lỗi cập nhật tour:", error.message);\n        res.status(500).json({ message: error.message });\n    }`;
    const newUpdateCatch = `} catch (error) {\n        if (typeof connection !== 'undefined' && connection) await connection.rollback();\n        console.error("Lỗi cập nhật tour:", error.message);\n        res.status(500).json({ message: error.message });\n    } finally {\n        if (typeof connection !== 'undefined' && connection) connection.release();\n    }`;
    content = content.replace(updateCatch, newUpdateCatch);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
}

fixController(path.join(__dirname, '../controllers/admin/tourController.js'));
fixController(path.join(__dirname, '../controllers/user/tourController.js'));
