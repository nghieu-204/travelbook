require('dotenv').config();
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
const userAuthRoutes = require('./routes/user/authRoutes');
const userTourRoutes = require('./routes/user/tourRoutes');
const userBookingRoutes = require('./routes/user/bookingRoutes');
const userContactRoutes = require('./routes/user/contactRoutes');
const userPaymentRoutes = require('./routes/user/paymentRoutes');
const userRecommendRoutes = require('./routes/user/recommendRoutes');
const userReviewRoutes = require('./routes/user/reviewRoutes');
const userRoutes = require('./routes/user/userRoutes');
const userChatRoutes = require('./routes/user/chatRoutes');

app.use('/api', userAuthRoutes);
app.use('/api', userTourRoutes);
app.use('/api', userBookingRoutes);
app.use('/api', userContactRoutes);
app.use('/api', userPaymentRoutes);
app.use('/api', userRecommendRoutes);
app.use('/api', userReviewRoutes);
app.use('/api', userRoutes);
app.use('/api', userChatRoutes);

// Admin Routes
const adminAuthRoutes = require('./routes/admin/authRoutes');
const adminTourRoutes = require('./routes/admin/tourRoutes');
const adminBookingRoutes = require('./routes/admin/bookingRoutes');
const adminContactRoutes = require('./routes/admin/contactRoutes');
const adminStatRoutes = require('./routes/admin/statRoutes');
const adminUserRoutes = require('./routes/admin/userRoutes');

const { verifyToken } = require('./middlewares/userAuth');

app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', verifyToken, adminTourRoutes);
app.use('/api/admin', verifyToken, adminBookingRoutes);
app.use('/api/admin', verifyToken, adminContactRoutes);
app.use('/api/admin', verifyToken, adminStatRoutes);
app.use('/api/admin', verifyToken, adminUserRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
