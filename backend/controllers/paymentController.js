const { pool } = require('../config/db');

// Tạo mã thanh toán QR MoMo mô phỏng
exports.createMoMoPayment = async (req, res) => {
    try {
        const { bookingId, amount, orderInfo } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ message: 'Thiếu thông tin đơn hàng để tạo QR MoMo!' });
        }

        const transactionId = 'MOMO_' + Math.floor(100000 + Math.random() * 900000);
        
        // Mô phỏng thông tin trả về từ cổng MoMo
        res.json({
            status: 'Success',
            message: 'Tạo mã thanh toán MoMo thành công',
            momoPayload: {
                bookingId,
                transactionId,
                amount,
                orderInfo: orderInfo || `Thanh toán đơn đặt tour #TB-${bookingId}`,
                qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=d82d8b&data=' + encodeURIComponent(`MOMO_PAYMENT_TB_${bookingId}_AMOUNT_${amount}`),
                expiresInSeconds: 300,
                provider: 'MoMo E-Wallet'
            }
        });
    } catch (error) {
        console.error('❌ Lỗi tạo QR MoMo:', error.message);
        res.status(500).json({ message: 'Lỗi máy chủ cổng thanh toán MoMo.' });
    }
};

// Xác nhận thanh toán thành công (Cho cả MoMo và PayPal)
exports.confirmOnlinePayment = async (req, res) => {
    try {
        const { bookingId, paymentMethod, transactionId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ message: 'Thiếu mã đơn đặt tour!' });
        }

        const statusLabel = paymentMethod === 'PayPal USD' ? 'Đã thanh toán Online (PayPal)' : 'Đã thanh toán Online (MoMo QR)';

        // Cập nhật trạng thái đơn hàng và phương thức thanh toán
        await pool.query(
            'UPDATE bookings SET status = ?, payment_method = ? WHERE id = ?',
            [statusLabel, paymentMethod || 'Thanh toán Online', bookingId]
        );

        // Giảm số chỗ trống của tour
        const [bookingRows] = await pool.query('SELECT tour_id, (adults + children) as totalPeople FROM bookings WHERE id = ?', [bookingId]);
        if (bookingRows.length > 0) {
            const { tour_id, totalPeople } = bookingRows[0];
            await pool.query(
                'UPDATE tours SET available_spots = GREATEST(0, available_spots - ?) WHERE id = ?',
                [totalPeople || 1, tour_id]
            );
        }

        res.json({
            status: 'Success',
            message: `🎉 Đã thanh toán thành công đơn hàng #TB-${bookingId} qua ${paymentMethod}!`,
            updatedStatus: statusLabel,
            transactionId: transactionId || 'TRANS_' + Date.now()
        });
    } catch (error) {
        console.error('❌ Lỗi xác nhận thanh toán:', error.message);
        res.status(500).json({ message: 'Lỗi máy chủ khi xác nhận thanh toán.' });
    }
};
