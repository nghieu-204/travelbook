const { buildPaymentUrl, verifySignature, processPaymentUpdate } = require('./payment.service');

exports.createVNPayPayment = async (req, res) => {
    try {
        const { bookingId, amount, orderInfo } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ message: 'Thiếu thông tin đơn hàng để tạo thanh toán VNPay!' });
        }

        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.connection?.socket?.remoteAddress || '127.0.0.1';
            
        // VNPay chỉ chấp nhận IPv4, nếu là IPv6 (::1) hoặc có nhiều IP thì lấy IP đầu tiên và chuyển thành 127.0.0.1
        if (ipAddr.includes(',')) ipAddr = ipAddr.split(',')[0].trim();
        if (ipAddr === '::1' || ipAddr.includes(':')) ipAddr = '127.0.0.1';

        const vnpUrl = buildPaymentUrl(bookingId, amount, orderInfo, ipAddr);

        res.json({
            status: 'Success',
            message: 'Tạo URL thanh toán VNPay thành công',
            payUrl: vnpUrl
        });

    } catch (error) {
        console.error('❌ Lỗi tạo URL VNPay:', error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

exports.vnpayIpn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        if(Object.keys(vnp_Params).length === 0) {
            vnp_Params = req.body;
        }

        const { isValid } = verifySignature(vnp_Params);

        if(isValid){
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];
            
            // Xử lý Database
            const result = await processPaymentUpdate(orderId, rspCode, true);
            
            if (result) {
                if (result.alreadyProcessed) {
                    console.log(`⚠️ [IPN] Bỏ qua đơn TB-${result.bookingId} do trạng thái hiện tại là: ${result.status}`);
                    return res.status(200).json({RspCode: '02', Message: 'Order already confirmed'});
                } else {
                    console.log(`✅ [IPN] Đã duyệt thanh toán thành công cho đơn TB-${result.bookingId}`);
                }
            }

            res.status(200).json({RspCode: '00', Message: 'Confirm Success'});
        } else {
            console.error('VNPay IPN Signature Mismatch');
            res.status(200).json({RspCode: '97', Message: 'Fail checksum'});
        }
    } catch (error) {
        console.error('❌ Lỗi xử lý VNPay IPN:', error);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

exports.vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = { ...req.query };
        
        const { isValid, signed, secureHash } = verifySignature(vnp_Params);

        const frontendUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/bookings` : 'http://localhost:8900/bookings';
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const orderId = vnp_Params['vnp_TxnRef'];
        
        if (!orderId) {
            console.log("❌ Lỗi: orderId (vnp_TxnRef) bị rỗng!");
            return res.redirect(`${frontendUrl}?vnp_ResponseCode=99`);
        }

        if(isValid){
            console.log(`✅ Chữ ký HỢP LỆ cho đơn hàng ${orderId}. Mã Code: ${rspCode}`);
            // Xử lý Database phòng trường hợp IPN chưa kịp chạy
            const result = await processPaymentUpdate(orderId, rspCode, false);
            
            if (result) {
                if (result.alreadyProcessed) {
                    console.log(`ℹ️ Đơn TB-${result.bookingId} đã được xử lý trước đó hoặc đã đổi trạng thái (hiện tại: ${result.status}).`);
                } else {
                    console.log(`✅ Đã cập nhật thành công CSDL từ vnpayReturn cho đơn TB-${result.bookingId}`);
                }
            }

            return res.redirect(`${frontendUrl}?vnp_ResponseCode=${rspCode}`);
        } else {
            console.log("❌ Chữ ký KHÔNG HỢP LỆ!");
            return res.redirect(`${frontendUrl}?vnp_ResponseCode=97`);
        }
    } catch (error) {
        console.error('❌ Lỗi xử lý VNPay Return:', error);
        const fallbackUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/bookings` : 'http://localhost:8900/bookings';
        return res.redirect(`${fallbackUrl}?vnp_ResponseCode=99`);
    }
};
