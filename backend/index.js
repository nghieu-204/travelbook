require('dotenv').config({ override: true });
require('dotenv').config({ path: '../.env', override: true }); // Đọc thêm cấu hình từ thư mục gốc nếu chạy chay (không Docker)
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./database/schema');
const { runSeeders } = require('./database/seeder');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

(async () => {
    await initSchema();
    await runSeeders();
})();

// User Routes
const authRoutes = require('./modules/auth/auth.routes');
const tourRoutes = require('./modules/tours/tour.user.routes');
const bookingRoutes = require('./modules/bookings/booking.user.routes');
const contactRoutes = require('./modules/contacts/contact.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const recommendRoutes = require('./modules/recommend/recommend.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const userRoutes = require('./modules/users/user.routes');
const chatRoutes = require('./modules/chat/chat.routes');

app.use('/api', authRoutes);
app.use('/api', tourRoutes);
app.use('/api', bookingRoutes);
app.use('/api', contactRoutes);
app.use('/api', paymentRoutes);
app.use('/api', recommendRoutes);
app.use('/api', reviewRoutes);
app.use('/api', userRoutes);
app.use('/api', chatRoutes);

// Admin Routes (for those not combined into modules)
const adminTourRoutes = require('./modules/tours/tour.admin.routes');
const adminBookingRoutes = require('./modules/bookings/booking.admin.routes');
const statRoutes = require('./modules/stats/stat.routes');

const { verifyToken } = require('./middlewares/userAuth');

app.use('/api/admin', verifyToken, adminTourRoutes);
app.use('/api/admin', verifyToken, adminBookingRoutes);
app.use('/api/admin', verifyToken, statRoutes);

const { recoverPendingOrders } = require('./queue/orderQueue');

const PORT = process.env.PORT || process.env.API_PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    
    // Khôi phục các Timeout Queue (Thay cho Redis TTL)
    recoverPendingOrders();
});
