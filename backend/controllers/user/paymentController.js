const { pool } = require('../../config/db');
const crypto = require('crypto');
const querystring = require('qs');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

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

        const tmnCode = process.env.VNP_TMNCODE;
        const secretKey = process.env.VNP_HASHSECRET;
        let vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const returnUrl = process.env.VNP_RETURNURL || 'http://localhost:8901/bookings';

        // Lấy ngày hiện tại
        const date = new Date();
        const createDate = date.getFullYear().toString() + 
                           (date.getMonth() + 1).toString().padStart(2, '0') + 
                           date.getDate().toString().padStart(2, '0') + 
                           date.getHours().toString().padStart(2, '0') + 
                           date.getMinutes().toString().padStart(2, '0') + 
                           date.getSeconds().toString().padStart(2, '0');

        // Create random orderId
        const orderId = `TB_${bookingId}_${date.getTime()}`;
        const amountVNPay = amount * 100; // VNPay requires amount to be multiplied by 100

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo || `Thanh toan cho don dat tour TB-${bookingId}`;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amountVNPay;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        vnp_Params = sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        res.json({
            status: 'Success',
            message: 'Tạo URL thanh toán VNPay thành công',
            payUrl: vnpUrl
        });

    } catch (error) {
        console.error('❌ Lỗi tạo URL VNPay:', error);
        res.status(500).json({ message: 'Lỗi máy chủ cổng thanh toán VNPay.' });
    }
};

exports.vnpayIpn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        if(Object.keys(vnp_Params).length === 0) {
            vnp_Params = req.body;
        }

        const secureHash = vnp_Params['vnp_SecureHash'];
        
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        const secretKey = process.env.VNP_HASHSECRET;
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");     

        if(secureHash === signed){
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];
            
            // Xử lý Database
            if (rspCode === '00') {
                const bookingId = orderId.split('_')[1];
                if (bookingId) {
                    const [bookingRows] = await pool.query('SELECT id, tour_id, status, payment_status, (adults + children) as totalPeople FROM bookings WHERE id = ?', [bookingId]);
                    if (bookingRows.length > 0) {
                        const booking = bookingRows[0];
                        
                        // Idempotency Check
                        if (booking.status !== 'Đang chờ thanh toán') {
                            console.log(`⚠️ [IPN] Bỏ qua đơn TB-${bookingId} do trạng thái hiện tại là: ${booking.status}`);
                            return res.status(200).json({RspCode: '02', Message: 'Order already confirmed'});
                        }

                        await pool.query(
                            'UPDATE bookings SET status = ?, payment_method = ?, payment_status = ? WHERE id = ?',
                            ['Đã xác nhận', 'Thanh toán qua VNPay', 'Đã thanh toán', booking.id]
                        );
                        
                        // Lưu vết (Audit Trail)
                        await pool.query(
                            `INSERT INTO order_logs (booking_id, action, description) VALUES (?, ?, ?)`,
                            [booking.id, 'CONFIRMED_BY_IPN', 'VNPay Webhook xác nhận thanh toán thành công.']
                        );

                        console.log(`✅ [IPN] Đã duyệt thanh toán thành công cho đơn TB-${bookingId}`);
                    }
                }
            }
            res.status(200).json({RspCode: '00', Message: 'Confirm Success'});
        } else {
            console.error('VNPay IPN Signature Mismatch');
            res.status(200).json({RspCode: '97', Message: 'Fail checksum'});
        }
    } catch (error) {
        console.error('❌ Lỗi xử lý VNPay IPN:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi xử lý IPN.' });
    }
};

exports.vnpayReturn = async (req, res) => {
    try {
        console.log("====== VNPAY RETURN BẮT ĐẦU ======");
        console.log("req.query:", req.query);
        let vnp_Params = { ...req.query };
        const secureHash = vnp_Params['vnp_SecureHash'];
        
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        const secretKey = process.env.VNP_HASHSECRET;
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");     

        console.log("secureHash (từ VNPay):", secureHash);
        console.log("signed (tự tính):", signed);

        const frontendUrl = 'http://localhost:3000/bookings';
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const orderId = vnp_Params['vnp_TxnRef'];
        
        if (!orderId) {
            console.log("❌ Lỗi: orderId (vnp_TxnRef) bị rỗng!");
            return res.redirect(`${frontendUrl}?vnp_ResponseCode=99`);
        }

        if(secureHash === signed){
            console.log(`✅ Chữ ký HỢP LỆ cho đơn hàng ${orderId}. Mã Code: ${rspCode}`);
            // Xử lý Database phòng trường hợp IPN chưa kịp chạy
            if (rspCode === '00') {
                const bookingId = orderId.split('_')[1];
                if (bookingId) {
                    const [bookingRows] = await pool.query('SELECT id, tour_id, status, (adults + children) as totalPeople FROM bookings WHERE id = ?', [bookingId]);
                    if (bookingRows.length > 0) {
                        const booking = bookingRows[0];
                        
                        // Idempotency Check
                        if (booking.status === 'Đang chờ thanh toán') {
                            await pool.query(
                                'UPDATE bookings SET status = ?, payment_method = ?, payment_status = ? WHERE id = ?',
                                ['Đã xác nhận', 'Thanh toán qua VNPay', 'Đã thanh toán', booking.id]
                            );
                            
                            // Lưu vết (Audit Trail)
                            await pool.query(
                                `INSERT INTO order_logs (booking_id, action, description) VALUES (?, ?, ?)`,
                                [booking.id, 'CONFIRMED_BY_RETURN', 'Khách hàng được chuyển hướng về trang web từ VNPay và hệ thống tự động xác nhận đơn hàng do IPN đến trễ.']
                            );
                            
                            console.log(`✅ Đã cập nhật thành công CSDL từ vnpayReturn cho đơn TB-${bookingId}`);
                        } else {
                            console.log(`ℹ️ Đơn TB-${bookingId} đã được xử lý trước đó hoặc đã đổi trạng thái (hiện tại: ${booking.status}).`);
                        }
                    }
                }
            }
            return res.redirect(`${frontendUrl}?vnp_ResponseCode=${rspCode}`);
        } else {
            console.log("❌ Chữ ký KHÔNG HỢP LỆ!");
            return res.redirect(`${frontendUrl}?vnp_ResponseCode=97`);
        }
    } catch (error) {
        console.error('❌ Lỗi xử lý VNPay Return:', error);
        return res.redirect('http://localhost:3000/bookings?vnp_ResponseCode=99');
    }
};
