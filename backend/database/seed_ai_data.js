const { pool } = require('../config/db');

async function runSeed() {
    console.log("🚀 Bắt đầu tạo dữ liệu test cho AI...");

    try {
        // Tạo 10 User Ảo
        const users = [];
        for (let i = 1; i <= 10; i++) {
            users.push([
                `Demo AI User ${i}`,
                `ai_user${i}@demo.com`,
                'user',
                1
            ]);
        }

        const [userResult] = await pool.query(
            'INSERT IGNORE INTO users (name, email, role, is_active) VALUES ?',
            [users]
        );
        console.log(`✅ Đã tạo ${userResult.affectedRows} users mới.`);

        // Lấy ID của 10 users vừa tạo
        const [demoUsers] = await pool.query('SELECT id FROM users WHERE email LIKE "ai_user%@demo.com"');
        
        if (demoUsers.length === 0) {
            console.log("❌ Không tìm thấy user để seed interaction.");
            process.exit(1);
        }

        const [tours] = await pool.query('SELECT id, name FROM tours LIMIT 20');
        if (tours.length < 12) {
            console.log("⚠️ Không đủ số lượng tour trong DB để giả lập. Đang dùng tạm tất cả tour hiện có.");
        }

        const group1Tours = tours.slice(0, 4).map(t => t.id).filter(id => id);
        const group2Tours = tours.slice(4, 8).map(t => t.id).filter(id => id);
        const group3Tours = tours.slice(8, 12).map(t => t.id).filter(id => id);

        const interactions = [];

        demoUsers.forEach((u, index) => {
            let myTours = [];
            if (index < 4) myTours = group1Tours;
            else if (index < 7) myTours = group2Tours;
            else myTours = group3Tours;

            if (myTours.length > 0) {
                // View
                if (myTours[0]) interactions.push([u.id, myTours[0], 'view', 1]);
                if (myTours[1]) interactions.push([u.id, myTours[1], 'view', 1]);
                if (myTours[2]) interactions.push([u.id, myTours[2], 'view', 1]);
                
                // Book
                if (myTours[3]) interactions.push([u.id, myTours[3], 'book', 5]);
                
                // Noise
                let noiseTour = index < 4 ? group2Tours[0] : group1Tours[0];
                if (noiseTour) interactions.push([u.id, noiseTour, 'view', 1]);
            }
        });

        if (interactions.length > 0) {
            await pool.query('DELETE FROM user_interactions WHERE user_id IN (?)', [demoUsers.map(u => u.id)]);

            const [interactionResult] = await pool.query(
                'INSERT INTO user_interactions (user_id, tour_id, interaction_type, weight) VALUES ?',
                [interactions]
            );
            console.log(`✅ Đã tạo ${interactionResult.affectedRows} interactions cho AI Collaborative Filtering.`);
        } else {
            console.log("⚠️ Không có tương tác nào được tạo (thiếu tour).");
        }

    } catch (e) {
        console.error("❌ Lỗi:", e);
    } finally {
        process.exit(0);
    }
}

runSeed();
