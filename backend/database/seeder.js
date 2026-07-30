const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const sampleTours = require('../data/sampleTours');

async function seedUsers() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
        if (rows[0].count > 0) {
            console.log(`ℹ️ Bảng users đã có sẵn ${rows[0].count} tài khoản. Bỏ qua nạp dữ liệu mẫu.`);
            return;
        }

        console.log('👥 Đang tạo các tài khoản người dùng mẫu...');
        const hashedPass = await bcrypt.hash('admin123', 10);
        await pool.query(
            `INSERT INTO users (name, email, password, role, avatar, address, phone, status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Quản Trị Viên VIP', 'admin@travelbook.vn', hashedPass, 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Tòa nhà TravelBook Tower, Quận 1, TP. Hồ Chí Minh', '0988888888', 'Hoạt động', 1]
        );
        const hashedPassUser = await bcrypt.hash('user123', 10);
        await pool.query(
            `INSERT INTO users (name, email, password, role, avatar, address, phone, status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Nguyễn Văn Khách', 'khachhang@gmail.com', hashedPassUser, 'user', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', '123 Đường Cầu Giấy, Hà Nội', '0912345678', 'Hoạt động', 1]
        );
        await pool.query(
            `INSERT INTO users (name, email, password, role, avatar, address, phone, status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Trần Thị Mai', 'maitran@gmail.com', hashedPassUser, 'user', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', '456 Đường Lê Lợi, Đà Nẵng', '0934567890', 'Hoạt động', 1]
        );
        await pool.query(
            `INSERT INTO users (name, email, password, role, avatar, address, phone, status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Lê Hoàng Nam (Chưa kích hoạt)', 'namle@gmail.com', hashedPassUser, 'user', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', '789 Đường Nguyễn Huệ, TP. HCM', '0977777777', 'Chờ kích hoạt', 0]
        );
        console.log('✅ Đã nạp thành công các tài khoản người dùng mẫu!');
    } catch (error) {
        console.error('❌ Lỗi nạp users mẫu:', error);
    }
}


async function seedTours() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM tours');
        if (rows[0].count > 0) {
            console.log('ℹ️ Bảng tours đã có sẵn dữ liệu. Bỏ qua nạp.');
            return;
        }

        console.log('🌍 Đang nạp dữ liệu Địa lý (Categories, Regions, Destinations)...');
        await pool.query("INSERT IGNORE INTO tourcategory (id, name) VALUES (1, 'Trong nước'), (2, 'Ngoài nước')");
        await pool.query("INSERT IGNORE INTO region (id, category_id, name) VALUES (1, 1, 'Miền Bắc'), (2, 1, 'Miền Trung'), (3, 1, 'Miền Nam'), (4, 2, 'Châu Á')");
        await pool.query(`INSERT IGNORE INTO destination (id, region_id, name) VALUES 
            (1, 3, 'Phú Quốc'), (2, 2, 'Đà Nẵng'), (3, 1, 'Sapa'), (4, 1, 'Hạ Long'), (5, 4, 'Bali'),
            (6, 2, 'Huế'), (7, 2, 'Đà Lạt'), (8, 2, 'Quảng Bình'), (9, 3, 'Nha Trang'), (10, 1, 'Ninh Bình'),
            (11, 1, 'Mộc Châu'), (12, 3, 'Côn Đảo'), (13, 1, 'Hà Giang'), (14, 2, 'Quy Nhơn'), (15, 4, 'Bangkok')`);

        console.log('🌱 Đang nạp dữ liệu mẫu cho 10 tour du lịch...');
        for (const tour of sampleTours) {
            const childPrice = tour.child_price || Math.round(tour.price * 0.7);
            const spots = tour.available_spots || 30;
            const galleryJson = tour.gallery || JSON.stringify([
                tour.image,
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
                'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80'
            ]);

            await pool.query(
                `INSERT INTO tours (name, price, original_price, child_price, available_spots, departure_date, duration, image, gallery, rating, reviews_count, badge, description, itinerary, included, excluded, destination_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    tour.name, tour.price, tour.original_price, childPrice, spots,
                    tour.departure_date || '2026-08-15', tour.duration, tour.image, galleryJson,
                    tour.rating, tour.reviews_count, tour.badge, tour.description, tour.itinerary, tour.included, tour.excluded, tour.destination_id
                ]
            );
        }
        console.log('✅ Đã nạp thành công 10 tour mẫu vào database!');
    } catch (error) {
        console.error('❌ Lỗi nạp tours mẫu:', error);
    }
}

async function seedReviews() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM reviews');
        if (rows[0].count > 0) {
            console.log(`ℹ️ Bảng reviews đã có sẵn ${rows[0].count} đánh giá. Bỏ qua nạp dữ liệu mẫu.`);
            return;
        }

        console.log('💬 Đang nạp nhận xét & đánh giá mẫu...');
        const [tours] = await pool.query('SELECT id, name FROM tours LIMIT 5');
        if (tours.length > 0) {
            const reviewData = [
                { tour_id: tours[0].id, user_name: 'Nguyễn Văn Khách', user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', rating: 5, comment: 'Chuyến đi tuyệt vời! Lịch trình chuẩn 5 sao.' },
                { tour_id: tours[0].id, user_name: 'Trần Thị Mai', user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', rating: 5, comment: 'Khách sạn view đẹp, ẩm thực phong phú.' },
                { tour_id: tours[1] ? tours[1].id : tours[0].id, user_name: 'Lê Hoàng Nam', user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', rating: 5, comment: 'Thanh toán tiện lợi. Sẽ tiếp tục ủng hộ TravelBook!' }
            ];

            for (const rev of reviewData) {
                await pool.query(
                    `INSERT INTO reviews (tour_id, user_name, user_avatar, rating, comment) VALUES (?, ?, ?, ?, ?)`,
                    [rev.tour_id, rev.user_name, rev.user_avatar, rev.rating, rev.comment]
                );
            }
            console.log('✅ Đã nạp thành công các nhận xét mẫu!');
        }
    } catch (error) {
        console.error('❌ Lỗi nạp reviews mẫu:', error);
    }
}

async function runSeeders() {
    try {
        console.log('🔄 Đang chạy Seeders...');
        await seedUsers();
        await seedTours();
        await seedReviews();
        console.log('🎉 Hoàn tất Seeders!');
    } catch (error) {
        console.error('❌ Lỗi chạy Seeders:', error);
    }
}

// Hỗ trợ chạy lệnh nạp dữ liệu độc lập từ terminal (CLI): node backend/database/seeder.js
if (require.main === module) {
    runSeeders().then(() => {
        console.log("Tiến trình đã xong.");
        process.exit(0);
    }).catch((err) => {
        console.error("Lỗi tiến trình:", err);
        process.exit(1);
    });
}

module.exports = { seedUsers, seedTours, seedReviews, runSeeders };
