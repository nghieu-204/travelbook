require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./database/schema');
const { runSeeders } = require('./database/seeder');

// Import routes (MVC Architecture)
const authRoutes = require('./routes/authRoutes');
const tourRoutes = require('./routes/tourRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const statRoutes = require('./routes/statRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Khởi tạo Database và Bảng khi khởi chạy
(async () => {
    await initSchema();
    await runSeeders();
})();

// Đăng ký các Routes
app.use('/api', authRoutes);
app.use('/api', tourRoutes);
app.use('/api', bookingRoutes);
app.use('/api', statRoutes);
app.use('/api', contactRoutes);
app.use('/api', userRoutes);
app.use('/api', reviewRoutes);
app.use('/api', recommendRoutes);
app.use('/api', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});