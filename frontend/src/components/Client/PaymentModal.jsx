import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PaymentModal({ booking, onClose, onSuccess }) {
    const [activeTab, setActiveTab] = useState('MoMo');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 phút đếm ngược
    const [qrData, setQrData] = useState(null);

    useEffect(() => {
        // Tạo QR MoMo tự động khi mở tab MoMo
        const fetchMoMoQr = async () => {
            try {
                const res = await axios.post('http://localhost:5000/api/payments/momo-qr', {
                    bookingId: booking.id || booking.bookingId,
                    amount: booking.total_price,
                    orderInfo: `Thanh toán tour ${booking.tour_name}`
                });
                setQrData(res.data.momoPayload);
            } catch (err) {
                console.error("Lỗi tạo MoMo QR:", err);
            }
        };

        if (booking) fetchMoMoQr();
    }, [booking]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleConfirmPayment = async (methodName) => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/payments/confirm', {
                bookingId: booking.id || booking.bookingId,
                paymentMethod: methodName,
                transactionId: qrData?.transactionId || 'TRANS_' + Date.now()
            });

            alert(`🎉 Thanh toán thành công qua ${methodName}! Đơn tour #SKY-${booking.id || booking.bookingId} của bạn đã được xác nhận.`);
            onSuccess();
        } catch (error) {
            console.error("Lỗi xác nhận thanh toán:", error);
            alert("⚠️ Lỗi kết nối khi xác nhận thanh toán.");
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    const usdAmount = Math.round(booking.total_price / 25000);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '560px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '24px 28px',
                    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#00d4bd', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            🔒 Cổng Thanh Toán Trực Tuyến An Toàn
                        </span>
                        <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 900 }}>
                            Thanh Toán Đơn Tour #SKY-{booking.id || booking.bookingId}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Amount Summary Bar */}
                <div style={{
                    padding: '16px 28px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Tour: <strong style={{ color: '#1e293b' }}>{booking.tour_name}</strong></div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Số lượng: {booking.adults} Người lớn {booking.children > 0 ? `, ${booking.children} Trẻ em` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Tổng thanh toán</div>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: '#e11d48' }}>
                            {Number(booking.total_price).toLocaleString('vi-VN')} VNĐ
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #e2e8f0' }}>
                    {[
                        { id: 'MoMo', label: '📱 MoMo QR', color: '#a50064' },
                        { id: 'PayPal', label: '🌐 PayPal USD', color: '#003087' },
                        { id: 'Bank', label: '🏦 Chuyển Khoản', color: '#059669' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '14px 10px',
                                border: 'none',
                                background: activeTab === tab.id ? 'white' : '#f1f5f9',
                                color: activeTab === tab.id ? tab.color : '#64748b',
                                fontWeight: activeTab === tab.id ? 800 : 600,
                                fontSize: '13px',
                                cursor: 'pointer',
                                borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ padding: '28px', flex: 1 }}>
                    {activeTab === 'MoMo' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                background: '#fdf2f8',
                                border: '2px dashed #f472b6',
                                borderRadius: '16px',
                                padding: '20px',
                                display: 'inline-block',
                                marginBottom: '16px'
                            }}>
                                <img
                                    src={qrData?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=a50064&data=MOMO_SKY_${booking.id}`}
                                    alt="MoMo QR Code"
                                    style={{ width: '180px', height: '180px', borderRadius: '12px' }}
                                />
                                <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: 800, color: '#a50064' }}>
                                    Mã giao dịch: {qrData?.transactionId || 'MOMO_889900'}
                                </div>
                            </div>

                            <div style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
                                Mở ứng dụng <strong style={{ color: '#a50064' }}>MoMo</strong> trên điện thoại và quét mã QR để thanh toán.
                            </div>

                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#f1f5f9',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#334155',
                                marginBottom: '24px'
                            }}>
                                <span>⏳ Mã hết hạn sau:</span>
                                <span style={{ color: '#e11d48' }}>{formatTime(timeLeft)}</span>
                            </div>

                            <button
                                onClick={() => handleConfirmPayment('MoMo QR Code')}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #a50064, #d82d8b)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(165, 0, 100, 0.3)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {loading ? '⏳ Đang xác nhận thanh toán...' : '✅ Xác Nhận Đã Quét QR & Hoàn Tất Thanh Toán'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'PayPal' && (
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <div style={{
                                background: '#eff6ff',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px',
                                border: '1px solid #bfdbfe'
                            }}>
                                <div style={{ fontSize: '14px', color: '#1e3a8a', marginBottom: '8px', fontWeight: 600 }}>
                                    Số tiền thanh toán quốc tế (Quy đổi USD)
                                </div>
                                <div style={{ fontSize: '36px', fontWeight: 900, color: '#003087' }}>
                                    ${usdAmount} USD
                                </div>
                                <div style={{ fontSize: '12px', color: '#60a5fa', marginTop: '4px' }}>
                                    Tỷ giá áp dụng: 1 USD = 25,000 VNĐ
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                                Bạn sẽ được chuyển hướng an toàn đến cổng thanh toán trực tuyến <strong>PayPal / Visa / Mastercard</strong> để hoàn tất đơn đặt tour.
                            </div>

                            <button
                                onClick={() => handleConfirmPayment('PayPal USD')}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: '#003087',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(0, 48, 135, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                }}
                            >
                                <span>🌐</span>
                                <span>{loading ? '⏳ Đang xử lý PayPal...' : 'Thanh Toán Ngay Qua PayPal ($' + usdAmount + ')'}</span>
                            </button>
                        </div>
                    )}

                    {activeTab === 'Bank' && (
                        <div>
                            <div style={{
                                background: '#ecfdf5',
                                borderRadius: '16px',
                                padding: '20px',
                                border: '1px solid #a7f3d0',
                                marginBottom: '20px'
                            }}>
                                <h4 style={{ margin: '0 0 12px', color: '#065f46', fontSize: '15px', fontWeight: 800 }}>
                                    🏦 Thông tin tài khoản nhận thanh toán
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#047857' }}>
                                    <div>Ngân hàng: <strong>Vietcombank (Chi nhánh Hội sở)</strong></div>
                                    <div>Số tài khoản: <strong style={{ fontSize: '16px', letterSpacing: '1px' }}>0123456789</strong></div>
                                    <div>Chủ tài khoản: <strong>CÔNG TY CP DU LỊCH SKYTRAVEL</strong></div>
                                    <div>Nội dung CK: <strong style={{ color: '#e11d48' }}>SKYTOUR {booking.id || booking.bookingId} {booking.user_phone}</strong></div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleConfirmPayment('Chuyển khoản ngân hàng / QR')}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #059669, #10b981)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3)'
                                }}
                            >
                                {loading ? '⏳ Đang xác nhận...' : '✅ Tôi Đã Chuyển Khoản Thành Công'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div style={{
                    padding: '14px 28px',
                    background: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#94a3b8'
                }}>
                    🔒 Bảo mật 256-bit SSL Encryption. Giao dịch được bảo vệ và hoàn tiền 100% nếu hủy trước 7 ngày.
                </div>
            </div>
        </div>
    );
}
