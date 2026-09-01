const { pool } = require('./config/db');

async function seedData() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        console.log('1. Đang khởi tạo danh sách Tags (tourtype)...');
        // 1. Insert Tags
        const tags = [
            'Khám phá', 'Mạo hiểm', 'Nghỉ dưỡng', 'Biển đảo', 'Leo núi', 'Văn hóa - Lịch sử', 
            'Ẩm thực', 'Tâm linh', 'Gia đình', 'Phượt', 'Chụp ảnh', 'Thiên nhiên'
        ];

        for (const tag of tags) {
            await connection.query('INSERT IGNORE INTO tourtype (name) VALUES (?)', [tag]);
        }
        const [tagRows] = await connection.query('SELECT * FROM tourtype');
        const tagMap = {};
        tagRows.forEach(t => tagMap[t.name] = t.id);

        console.log('2. Định tuyến các Điểm đến (destination)...');
        // Map dest by ID
        const dests = {
            'Phú Quốc': 1, 'Đà Nẵng': 2, 'Sapa': 3, 'Hạ Long': 4, 'Bali': 5,
            'Huế': 6, 'Đà Lạt': 7, 'Quảng Bình': 8, 'Nha Trang': 9, 'Ninh Bình': 10,
            'Mộc Châu': 11, 'Côn Đảo': 12, 'Hà Giang': 13, 'Quy Nhơn': 14, 'Bangkok': 15
        };

        const tours = [
            // Cùng Đà Lạt, khác tag
            {
                name: 'Nghỉ dưỡng cao cấp tại Đà Lạt mộng mơ', dest_id: 7, 
                price: 5500000, duration: '3 Ngày 2 Đêm', rating: 4.8, 
                image: 'https://images.unsplash.com/photo-1598215668388-751296ea4d23', 
                tags: ['Nghỉ dưỡng', 'Gia đình', 'Chụp ảnh']
            },
            {
                name: 'Phượt xe máy chinh phục đèo Prenn Đà Lạt', dest_id: 7, 
                price: 1500000, duration: '2 Ngày 1 Đêm', rating: 4.2, 
                image: 'https://images.unsplash.com/photo-1571597813576-9280d96d7fb1', 
                tags: ['Phượt', 'Mạo hiểm', 'Thiên nhiên']
            },
            
            // Cùng Phú Quốc, khác tag
            {
                name: 'Khám phá thiên đường đảo ngọc Phú Quốc', dest_id: 1, 
                price: 6500000, duration: '4 Ngày 3 Đêm', rating: 5.0, 
                image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5', 
                tags: ['Biển đảo', 'Khám phá', 'Chụp ảnh']
            },
            {
                name: 'Resort 5 sao Phú Quốc - Chuyến đi của thanh xuân', dest_id: 1, 
                price: 9500000, duration: '3 Ngày 2 Đêm', rating: 4.9, 
                image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2', 
                tags: ['Nghỉ dưỡng', 'Gia đình', 'Biển đảo']
            },

            // Cùng tag Biển đảo, khác province (Phú Quốc, Nha Trang, Hạ Long, Côn Đảo, Quy Nhơn)
            {
                name: 'Lặn ngắm san hô tại vịnh Nha Trang', dest_id: 9, 
                price: 2500000, duration: '2 Ngày 1 Đêm', rating: 4.5, 
                image: 'https://images.unsplash.com/photo-1592394533824-9440e5d68530', 
                tags: ['Biển đảo', 'Khám phá', 'Gia đình']
            },
            {
                name: 'Trải nghiệm du thuyền 5 sao Vịnh Hạ Long', dest_id: 4, 
                price: 8500000, duration: '3 Ngày 2 Đêm', rating: 4.7, 
                image: 'https://images.unsplash.com/photo-1557335200-a65f7f032602', 
                tags: ['Biển đảo', 'Nghỉ dưỡng', 'Chụp ảnh']
            },
            {
                name: 'Kỳ nghỉ hoang sơ tại Côn Đảo', dest_id: 12, 
                price: 5200000, duration: '3 Ngày 2 Đêm', rating: 4.6, 
                image: 'https://images.unsplash.com/photo-1621217734138-085731737756', 
                tags: ['Biển đảo', 'Thiên nhiên', 'Tâm linh']
            },
            {
                name: 'Khám phá Kỳ Co - Eo Gió Quy Nhơn', dest_id: 14, 
                price: 3200000, duration: '3 Ngày 2 Đêm', rating: 4.4, 
                image: 'https://images.unsplash.com/photo-1585255474661-825501174910', 
                tags: ['Biển đảo', 'Khám phá', 'Chụp ảnh']
            },

            // Quốc tế - Châu Á
            {
                name: 'Bali - Hòn đảo của những vị thần', dest_id: 5, 
                price: 12500000, duration: '4 Ngày 3 Đêm', rating: 4.9, 
                image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', 
                tags: ['Biển đảo', 'Văn hóa - Lịch sử', 'Tâm linh']
            },
            {
                name: 'Bangkok - Pattaya sôi động', dest_id: 15, 
                price: 7500000, duration: '5 Ngày 4 Đêm', rating: 4.5, 
                image: 'https://images.unsplash.com/photo-1583491470869-d9d150247d4e', 
                tags: ['Ẩm thực', 'Khám phá', 'Gia đình']
            },

            // Mộc Châu, Hà Giang, Sapa (Miền Bắc)
            {
                name: 'Chinh phục đỉnh Fansipan Sapa', dest_id: 3, 
                price: 3800000, duration: '3 Ngày 2 Đêm', rating: 4.8, 
                image: 'https://images.unsplash.com/photo-1583344605995-15a004eb7c95', 
                tags: ['Leo núi', 'Khám phá', 'Mạo hiểm']
            },
            {
                name: 'Mùa hoa cải trắng Mộc Châu', dest_id: 11, 
                price: 1800000, duration: '2 Ngày 1 Đêm', rating: 4.3, 
                image: 'https://images.unsplash.com/photo-1549429402-92ab8d2035bd', 
                tags: ['Thiên nhiên', 'Chụp ảnh', 'Phượt']
            },
            {
                name: 'Cung đường phượt mạo hiểm Hà Giang', dest_id: 13, 
                price: 2900000, duration: '3 Ngày 2 Đêm', rating: 4.7, 
                image: 'https://images.unsplash.com/photo-1628174523992-cf11dd3b2b9f', 
                tags: ['Phượt', 'Mạo hiểm', 'Khám phá']
            },
            {
                name: 'Nghỉ dưỡng sinh thái Sapa Retreat', dest_id: 3, 
                price: 6800000, duration: '4 Ngày 3 Đêm', rating: 4.6, 
                image: 'https://images.unsplash.com/photo-1632822452097-4089a80e461b', 
                tags: ['Nghỉ dưỡng', 'Thiên nhiên', 'Tâm linh']
            },

            // Ninh Bình, Quảng Bình, Huế (Miền Trung & Bắc)
            {
                name: 'Du ngoạn Tràng An - Bái Đính', dest_id: 10, 
                price: 1200000, duration: '1 Ngày', rating: 4.1, 
                image: 'https://images.unsplash.com/photo-1598585448666-88775432d0c2', 
                tags: ['Tâm linh', 'Thiên nhiên', 'Gia đình']
            },
            {
                name: 'Khám phá hang động Phong Nha Kẻ Bàng', dest_id: 8, 
                price: 4500000, duration: '3 Ngày 2 Đêm', rating: 4.8, 
                image: 'https://images.unsplash.com/photo-1579222471900-50d40fa2c4d6', 
                tags: ['Mạo hiểm', 'Khám phá', 'Thiên nhiên']
            },
            {
                name: 'Về miền di sản Cố đô Huế', dest_id: 6, 
                price: 2500000, duration: '2 Ngày 1 Đêm', rating: 4.4, 
                image: 'https://images.unsplash.com/photo-1563604322472-e1c53724896d', 
                tags: ['Văn hóa - Lịch sử', 'Ẩm thực', 'Chụp ảnh']
            },
            {
                name: 'Thưởng thức ẩm thực Huế & Hội An', dest_id: 6, 
                price: 3500000, duration: '3 Ngày 2 Đêm', rating: 4.7, 
                image: 'https://images.unsplash.com/photo-1601625895744-8d91c5364ce0', 
                tags: ['Ẩm thực', 'Gia đình', 'Văn hóa - Lịch sử']
            },
            {
                name: 'Sơn Đoòng Expedition 2026', dest_id: 8, 
                price: 68000000, duration: '6 Ngày 5 Đêm', rating: 5.0, 
                image: 'https://images.unsplash.com/photo-1550503613-2fa643d969bc', 
                tags: ['Mạo hiểm', 'Leo núi', 'Khám phá']
            },

            // Đà Nẵng
            {
                name: 'Nghỉ dưỡng gia đình tại Bà Nà Hills', dest_id: 2, 
                price: 4500000, duration: '3 Ngày 2 Đêm', rating: 4.6, 
                image: 'https://images.unsplash.com/photo-1600762193237-67c4d57c7932', 
                tags: ['Gia đình', 'Nghỉ dưỡng', 'Chụp ảnh']
            },
            {
                name: 'Phượt xuyên rừng quốc gia Bạch Mã', dest_id: 2, 
                price: 2100000, duration: '2 Ngày 1 Đêm', rating: 4.3, 
                image: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6', 
                tags: ['Phượt', 'Thiên nhiên', 'Leo núi']
            },

            // Các tour ghép thêm để đủ số lượng 29
            {
                name: 'Check-in các tọa độ cực hot tại Bangkok', dest_id: 15, 
                price: 6500000, duration: '4 Ngày 3 Đêm', rating: 4.5, 
                image: 'https://images.unsplash.com/photo-1582468546235-9bf31e5bc4a1', 
                tags: ['Chụp ảnh', 'Ẩm thực', 'Gia đình']
            },
            {
                name: 'Tour du lịch mạo hiểm vượt thác Bali', dest_id: 5, 
                price: 15000000, duration: '5 Ngày 4 Đêm', rating: 4.9, 
                image: 'https://images.unsplash.com/photo-1553531580-6520e78a6358', 
                tags: ['Mạo hiểm', 'Khám phá', 'Thiên nhiên']
            },
            {
                name: 'Khám phá bí ẩn đảo Phú Quốc bằng xe Jeep', dest_id: 1, 
                price: 5200000, duration: '3 Ngày 2 Đêm', rating: 4.7, 
                image: 'https://images.unsplash.com/photo-1616194269152-32a3922c00ed', 
                tags: ['Phượt', 'Biển đảo', 'Khám phá']
            },
            {
                name: 'Kỳ nghỉ lãng mạn tại Sapa', dest_id: 3, 
                price: 5800000, duration: '3 Ngày 2 Đêm', rating: 4.8, 
                image: 'https://images.unsplash.com/photo-1588691572111-eec7c6b447cb', 
                tags: ['Nghỉ dưỡng', 'Chụp ảnh', 'Thiên nhiên']
            },
            {
                name: 'Hành trình di sản Đà Nẵng - Hội An - Huế', dest_id: 2, 
                price: 4900000, duration: '4 Ngày 3 Đêm', rating: 4.5, 
                image: 'https://images.unsplash.com/photo-1534346761005-728b7fa4db60', 
                tags: ['Văn hóa - Lịch sử', 'Gia đình', 'Ẩm thực']
            },
            {
                name: 'Check-in Vịnh Hạ Long từ Thủy Phi Cơ', dest_id: 4, 
                price: 15500000, duration: '2 Ngày 1 Đêm', rating: 5.0, 
                image: 'https://images.unsplash.com/photo-1506461883276-594a12b11cb3', 
                tags: ['Mạo hiểm', 'Nghỉ dưỡng', 'Biển đảo']
            },
            {
                name: 'Trekking Tà Năng - Phan Dũng', dest_id: 7, 
                price: 2800000, duration: '3 Ngày 2 Đêm', rating: 4.6, 
                image: 'https://images.unsplash.com/photo-1551632811-561732d1e306', 
                tags: ['Leo núi', 'Khám phá', 'Thiên nhiên']
            },
            {
                name: 'Tour tham quan đền đài Ayutthaya', dest_id: 15, 
                price: 8200000, duration: '5 Ngày 4 Đêm', rating: 4.4, 
                image: 'https://images.unsplash.com/photo-1528644498305-64303d8d641d', 
                tags: ['Văn hóa - Lịch sử', 'Tâm linh', 'Chụp ảnh']
            }
        ];

        console.log(`3. Bắt đầu Insert ${tours.length} Tours vào DB...`);
        let count = 0;
        for (const t of tours) {
            const original_price = Math.round(t.price * 1.2);
            const child_price = Math.round(t.price * 0.7);
            
            // Insert into tours
            const [insertRes] = await connection.query(`
                INSERT INTO tours 
                (name, price, original_price, child_price, available_spots, departure_date, duration, image, rating, reviews_count, badge, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                t.name, t.price, original_price, child_price, 30, '2026-09-15', t.duration, t.image, t.rating, Math.floor(Math.random() * 200 + 50), 'Mới', t.name
            ]);
            
            const tourId = insertRes.insertId;

            // Link destination (primary)
            await connection.query('INSERT IGNORE INTO tour_destination (tour_id, destination_id, is_primary) VALUES (?, ?, ?)', [tourId, t.dest_id, true]);

            // Link tags
            for (const tagName of t.tags) {
                if (tagMap[tagName]) {
                    await connection.query('INSERT IGNORE INTO tour_tourtype (tour_id, type_id) VALUES (?, ?)', [tourId, tagMap[tagName]]);
                }
            }
            count++;
        }

        await connection.commit();
        console.log(`✅ Đã seed thành công ${count} tours mới cùng đầy đủ Tags và Liên kết địa danh!`);

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('❌ Lỗi khi seed dữ liệu:', err);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

seedData();
