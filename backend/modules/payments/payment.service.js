const crypto = require('crypto');
const querystring = require('qs');
const { pool } = require('../../config/db');

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

function buildPaymentUrl(bookingId, amount, orderInfo, ipAddr) {
    const tmnCode = process.env.VNP_TMNCODE || 'TEST_TMNCODE';
    const secretKey = process.env.VNP_HASHSECRET || 'TEST_SECRET_KEY_1234567890';
    let vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    // Bắt buộc gọi về Backend API trước để xử lý DB, sau đó Backend mới redirect về Frontend
    const returnUrl = 'http://localhost:8902/api/payments/vnpay-return';

    const date = new Date();
    const createDate = date.getFullYear().toString() + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0') + 
                       date.getHours().toString().padStart(2, '0') + 
                       date.getMinutes().toString().padStart(2, '0') + 
                       date.getSeconds().toString().padStart(2, '0');

    const orderId = `TB_${bookingId}_${date.getTime()}`;
    const amountVNPay = amount * 100;

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
    return vnpUrl;
}

function verifySignature(vnp_Params) {
    const secureHash = vnp_Params['vnp_SecureHash'];
    // Clone object to avoid mutating the original request params
    let paramsCopy = { ...vnp_Params };
    delete paramsCopy['vnp_SecureHash'];
    delete paramsCopy['vnp_SecureHashType'];

    paramsCopy = sortObject(paramsCopy);
    const secretKey = process.env.VNP_HASHSECRET || 'TEST_SECRET_KEY_1234567890';
    const signData = querystring.stringify(paramsCopy, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");     

    return { isValid: secureHash === signed, signed, secureHash };
}

async function processPaymentUpdate(orderId, rspCode, isIpn = false) {
    if (rspCode !== '00') return null;
    
    const bookingId = orderId.split('_')[1];
    if (!bookingId) return null;

    const [bookingRows] = await pool.query('SELECT id, tour_id, status, payment_status, (adults + children) as totalPeople FROM bookings WHERE id = ?', [bookingId]);
    if (bookingRows.length === 0) return null;

    const booking = bookingRows[0];
    
    // Idempotency Check
    if (booking.status !== 'Đang chờ thanh toán') {
        return { alreadyProcessed: true, status: booking.status, bookingId };
    }

    await pool.query(
        'UPDATE bookings SET status = ?, payment_method = ?, payment_status = ? WHERE id = ?',
        ['Đã xác nhận', 'Thanh toán qua VNPay', 'Đã thanh toán', booking.id]
    );
    
    const actionDesc = isIpn 
        ? 'VNPay Webhook xác nhận thanh toán thành công.' 
        : 'Khách hàng được chuyển hướng về trang web từ VNPay và hệ thống tự động xác nhận đơn hàng do IPN đến trễ.';
    const actionCode = isIpn ? 'CONFIRMED_BY_IPN' : 'CONFIRMED_BY_RETURN';

    // Lưu vết (Audit Trail)
    await pool.query(
        `INSERT INTO order_logs (booking_id, action, description) VALUES (?, ?, ?)`,
        [booking.id, actionCode, actionDesc]
    );

    return { alreadyProcessed: false, bookingId };
}

module.exports = {
    buildPaymentUrl,
    verifySignature,
    processPaymentUpdate
};
