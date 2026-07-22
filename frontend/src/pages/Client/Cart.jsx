import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';

export default function Cart({ user }) {
    const { cart, selectedCartItems, removeFromCart, updateCartItem, toggleSelectItem, toggleSelectAll, clearCart, cartCount, selectedCount, cartTotal } = useCart();
    const navigate = useNavigate();

    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showLoginAlert, setShowLoginAlert] = useState(false); // Modal thông báo yêu cầu đăng nhập khi ấn thanh toán
    const [phone, setPhone] = useState(user?.phone || '');
    const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản ngân hàng / QR Code');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Xử lý khi ấn nút Thanh Toán / Tiến hành đặt tất cả tour đã tích chọn
    const handleOpenCheckout = () => {
        if (selectedCount === 0) {
            alert('⚠️ Vui lòng tích chọn ít nhất 1 tour trong giỏ hàng để tiến hành thanh toán!');
            return;
        }
        if (!user) {
            // Nếu khách hàng chưa đăng nhập -> Hiện thông báo yêu cầu đăng nhập
            alert('⚠️ Vui lòng đăng nhập để có thể thanh toán và đặt tour!');
            setShowLoginAlert(true);
            return;
        }
        setShowCheckoutModal(true);
    };

    const handleConfirmBatchBooking = async (e) => {
        e.preventDefault();
        if (!phone) {
            alert('Vui lòng nhập số điện thoại liên hệ!');
            return;
        }

        setSubmitting(true);
        try {
            // Gửi từng tour đã được tích chọn trong giỏ hàng vào bảng bookings
            for (const item of selectedCartItems) {
                const itemTotal = (item.adults * item.price) + (item.children * Math.round(item.price * 0.7));
                await axios.post('http://localhost:5000/api/bookings', {
                    tour_id: item.tourId,
                    tour_name: item.name,
                    user_id: user.id || null,
                    user_name: user.name,
                    user_email: user.email,
                    user_phone: phone,
                    departure_date: item.departureDate,
                    adults: item.adults,
                    children: item.children,
                    total_price: itemTotal,
                    payment_method: paymentMethod
                });
            }

            setSubmitting(false);
            setShowCheckoutModal(false);
            setBookingSuccess(true);

            // Xóa các tour đã đặt thành công ra khỏi giỏ
            for (const item of selectedCartItems) {
                removeFromCart(item.tourId);
            }
        } catch (error) {
            console.error("Lỗi đặt tour:", error);
            alert("Có lỗi xảy ra trong quá trình đặt tour. Vui lòng thử lại!");
            setSubmitting(false);
        }
    };

    if (bookingSuccess) {
        return (
            <div className="section" style={{ paddingTop: '60px', paddingBottom: '100px', textAlign: 'center' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '50px 30px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#10b981', marginBottom: '14px' }}>
                        Đặt Tour Thành Công!
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
                        Cảm ơn <strong style={{ color: '#1e293b' }}>{user?.name}</strong> đã tin tưởng lựa chọn SkyTravel! Đơn đặt tour của bạn đã được gửi tới hệ thống. Bộ phận chăm sóc khách hàng sẽ liên hệ xác nhận sớm nhất.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Link to="/my-bookings" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: 800 }}>
                            📜 Xem Lịch Sử Đặt Tour
                        </Link>
                        <Link to="/" className="btn btn-outline" style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: 800 }}>
                            🏠 Về Trang Chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="section" style={{ paddingTop: '30px', paddingBottom: '80px' }}>
            {/* Breadcrumb & Header */}
            <div style={{ marginBottom: '32px' }}>
                <Link to="/tours" style={{ color: '#0a66c2', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>← Khám phá thêm tour khác</span>
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                            🛒 Giỏ Hàng Của Bạn
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
                            Tích chọn vào các chuyến đi bạn muốn thanh toán. Hệ thống sẽ tự động tính chính xác tổng tiền cho các tour được chọn!
                        </p>
                    </div>
                    {cartCount > 0 && (
                        <button
                            onClick={clearCart}
                            style={{
                                background: '#fee2e2',
                                color: '#e11d48',
                                border: '1px solid #fecdd3',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                fontSize: '13.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🗑️ Xóa toàn bộ giỏ hàng
                        </button>
                    )}
                </div>
            </div>

            {cartCount === 0 ? (
                <div style={{ background: 'white', padding: '80px 20px', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎒</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                        Giỏ hàng của bạn đang trống!
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '460px', margin: '0 auto 26px', lineHeight: '1.6' }}>
                        Bạn chưa chọn chuyến đi nào. Hãy khám phá kho báu du lịch 3 Miền của SkyTravel và chọn cho mình hành trình ưng ý nhé!
                    </p>
                    <Link
                        to="/tours"
                        className="btn btn-primary"
                        style={{ padding: '14px 32px', borderRadius: '14px', fontWeight: 800, fontSize: '15px', display: 'inline-block' }}
                    >
                        🌍 Khám Phá Danh Sách Tour Ngay →
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 390px', gap: '35px', alignItems: 'start' }}>
                    {/* Danh sách Tour trong giỏ bên trái */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Thanh Chọn Tất Cả */}
                        <div style={{ background: 'white', padding: '14px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '15px', color: '#1e293b', userSelect: 'none' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCount === cartCount && cartCount > 0}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                    style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
                                />
                                <span>Chọn tất cả ({cartCount} hành trình)</span>
                            </label>
                            <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 600 }}>
                                Đã tích chọn: <strong style={{ color: '#10b981', fontSize: '15px' }}>{selectedCount}</strong> / {cartCount} tour
                            </span>
                        </div>

                        {cart.map((item) => {
                            const itemSubtotal = (item.adults * item.price) + (item.children * Math.round(item.price * 0.7));
                            const isSelected = item.selected !== false;
                            return (
                                <div
                                    key={item.tourId}
                                    style={{
                                        background: isSelected ? 'white' : '#f8fafc',
                                        borderRadius: '20px',
                                        padding: '20px',
                                        border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                                        boxShadow: isSelected ? '0 8px 25px rgba(16, 185, 129, 0.08)' : '0 4px 15px rgba(0,0,0,0.02)',
                                        display: 'grid',
                                        gridTemplateColumns: 'auto 170px 1fr auto',
                                        gap: '16px',
                                        alignItems: 'center',
                                        opacity: isSelected ? 1 : 0.65,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {/* Checkbox chọn đơn hàng này */}
                                    <div style={{ display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelectItem(item.tourId)}
                                            style={{ width: '22px', height: '22px', accentColor: '#10b981', cursor: 'pointer' }}
                                        />
                                    </div>

                                    {/* Ảnh thumbnail */}
                                    <div style={{ position: 'relative', width: '170px', height: '140px', borderRadius: '16px', overflow: 'hidden' }}>
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(15, 23, 42, 0.8)', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
                                            📍 {item.location}
                                        </div>
                                    </div>

                                    {/* Thông tin tour & chỉnh sửa số lượng */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ background: '#ecfdf5', color: '#065f46', padding: '2px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
                                                {item.region}
                                            </span>
                                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                                                ⏱️ {item.duration}
                                            </span>
                                        </div>

                                        <Link to={`/tours/${item.tourId}`} style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', textDecoration: 'none', lineHeight: '1.4' }}>
                                            {item.name}
                                        </Link>

                                        {/* Ngày khởi hành & Số lượng */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
                                            <div>
                                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                                    📅 Ngày khởi hành:
                                                </label>
                                                <input
                                                    type="date"
                                                    value={item.departureDate}
                                                    onChange={(e) => updateCartItem(item.tourId, item.adults, item.children, e.target.value)}
                                                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                                    🧑 Người lớn ({item.price.toLocaleString('vi-VN')} đ):
                                                </label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <button
                                                        onClick={() => updateCartItem(item.tourId, item.adults - 1, item.children, item.departureDate)}
                                                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, cursor: 'pointer' }}
                                                    >
                                                        -
                                                    </button>
                                                    <span style={{ fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>{item.adults}</span>
                                                    <button
                                                        onClick={() => updateCartItem(item.tourId, item.adults + 1, item.children, item.departureDate)}
                                                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, cursor: 'pointer' }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                                    👶 Trẻ em ({Math.round(item.price * 0.7).toLocaleString('vi-VN')} đ):
                                                </label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <button
                                                        onClick={() => updateCartItem(item.tourId, item.adults, item.children - 1, item.departureDate)}
                                                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, cursor: 'pointer' }}
                                                    >
                                                        -
                                                    </button>
                                                    <span style={{ fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>{item.children}</span>
                                                    <button
                                                        onClick={() => updateCartItem(item.tourId, item.adults, item.children + 1, item.departureDate)}
                                                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, cursor: 'pointer' }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Giá tiền subtotal, Nút Đặt Tour (Chuyển giao diện đặt tour) & Nút xóa */}
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Thành tiền</span>
                                            <span style={{ fontSize: '20px', fontWeight: 900, color: '#e11d48' }}>
                                                {itemSubtotal.toLocaleString('vi-VN')} đ
                                            </span>
                                        </div>

                                        {/* Nút Đặt Tour chuyển qua giao diện chi tiết đặt tour của món này */}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <Link
                                                to={`/tours/${item.tourId}`}
                                                style={{
                                                    background: 'linear-gradient(135deg, #0a66c2, #00d4bd)',
                                                    color: 'white',
                                                    padding: '8px 14px',
                                                    borderRadius: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: 800,
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    boxShadow: '0 4px 12px rgba(10, 102, 194, 0.25)',
                                                    transition: 'transform 0.2s'
                                                }}
                                                title="Chuyển qua giao diện đặt tour chi tiết"
                                            >
                                                <span>👉 Đặt Tour</span>
                                            </Link>

                                            <button
                                                onClick={() => removeFromCart(item.tourId)}
                                                style={{
                                                    background: '#fef2f2',
                                                    color: '#ef4444',
                                                    border: '1px solid #fee2e2',
                                                    padding: '8px 12px',
                                                    borderRadius: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                                title="Xóa tour khỏi giỏ"
                                            >
                                                <span>🗑️</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* TÓM TẮT ĐƠN HÀNG & THANH TOÁN BÊN PHẢI */}
                    <div style={{ background: 'white', padding: '28px 24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', position: 'sticky', top: '100px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                            🧾 Tóm Tắt Đơn Hàng
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                                <span>Tour đang chọn:</span>
                                <strong style={{ color: '#10b981', fontSize: '16px' }}>{selectedCount} / {cartCount} tour</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                                <span>Tổng khách người lớn:</span>
                                <strong style={{ color: '#1e293b' }}>{selectedCartItems.reduce((s, i) => s + i.adults, 0)} người</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                                <span>Tổng khách trẻ em:</span>
                                <strong style={{ color: '#1e293b' }}>{selectedCartItems.reduce((s, i) => s + i.children, 0)} bé</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                                <span>Thuế VAT & Bảo hiểm:</span>
                                <strong style={{ color: '#10b981' }}>Miễn phí 100%</strong>
                            </div>
                        </div>

                        <div style={{ paddingTop: '18px', borderTop: '2px dashed #e2e8f0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Tổng thanh toán:</span>
                            <span style={{ fontSize: '24px', fontWeight: 900, color: '#e11d48' }}>
                                {cartTotal.toLocaleString('vi-VN')} đ
                            </span>
                        </div>

                        {/* NÚT THANH TOÁN CÁC TOUR ĐÃ CHỌN */}
                        <button
                            onClick={handleOpenCheckout}
                            className="btn btn-primary"
                            disabled={selectedCount === 0}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                fontSize: '16px',
                                fontWeight: 900,
                                boxShadow: selectedCount > 0 ? '0 8px 25px rgba(10, 102, 194, 0.3)' : 'none',
                                background: selectedCount > 0 ? 'linear-gradient(135deg, #0a66c2, #00d4bd)' : '#cbd5e1',
                                border: 'none',
                                cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
                                opacity: selectedCount > 0 ? 1 : 0.7,
                                transition: 'all 0.2s'
                            }}
                        >
                            ⚡ Tiến Hành Thanh Toán ({selectedCount} Tour) →
                        </button>

                        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                            🔒 Đặt chỗ bảo mật & hoàn tiền 100% nếu hủy trước 7 ngày khởi hành
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL THÔNG BÁO YÊU CẦU ĐĂNG NHẬP KHI CHƯA ĐĂNG NHẬP MÀ ẤN THANH TOÁN */}
            {showLoginAlert && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999999,
                    padding: '20px',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '36px',
                        maxWidth: '440px',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                        border: '1px solid #e2e8f0',
                        animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔐</div>
                        <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b', marginBottom: '10px' }}>
                            Yêu Cầu Đăng Nhập
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
                            Vui lòng đăng nhập để có thể thanh toán. Các tour trong giỏ hàng của bạn vẫn sẽ được giữ nguyên sau khi đăng nhập thành công!
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Link
                                to="/login"
                                onClick={() => setShowLoginAlert(false)}
                                style={{
                                    background: 'linear-gradient(135deg, #0a66c2, #00d4bd)',
                                    color: 'white',
                                    padding: '14px 20px',
                                    borderRadius: '14px',
                                    fontWeight: 800,
                                    fontSize: '15.5px',
                                    textDecoration: 'none',
                                    boxShadow: '0 6px 20px rgba(10, 102, 194, 0.3)',
                                    display: 'block'
                                }}
                            >
                                🔑 Đăng Nhập Tài Khoản Ngay →
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowLoginAlert(false)}
                                style={{
                                    background: '#f1f5f9',
                                    color: '#64748b',
                                    border: '1px solid #cbd5e1',
                                    padding: '12px 20px',
                                    borderRadius: '14px',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                ❌ Đóng / Xem tiếp giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL XÁC NHẬN ĐẶT TOUR BATCH (KHI ĐÃ ĐĂNG NHẬP) */}
            {showCheckoutModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '36px',
                        maxWidth: '520px',
                        width: '100%',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                        border: '1px solid #e2e8f0',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>
                            🚀 Xác Nhận Đặt & Thanh Toán {cartCount} Tour
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                            Vui lòng xác nhận thông tin liên hệ và phương thức thanh toán cho toàn bộ giỏ hàng
                        </p>

                        <form onSubmit={handleConfirmBatchBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                                    👤 Người đặt hàng
                                </label>
                                <input
                                    type="text"
                                    value={user?.name || ''}
                                    disabled
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', fontWeight: 700, color: '#64748b' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                                    📞 Số điện thoại liên hệ (*)
                                </label>
                                <input
                                    type="text"
                                    placeholder="0912345678"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 600, outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                                    💳 Phương thức thanh toán
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 600, outline: 'none', background: 'white' }}
                                >
                                    <option value="Chuyển khoản ngân hàng / QR Code">Chuyển khoản ngân hàng / QR Code (Khuyên dùng)</option>
                                    <option value="Tiền mặt tại văn phòng SkyTravel">Tiền mặt tại văn phòng SkyTravel</option>
                                </select>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                                    <span>Tổng số hành trình:</span>
                                    <strong style={{ color: '#1e293b' }}>{cartCount} tour</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, color: '#e11d48' }}>
                                    <span>Tổng tiền cần thanh toán:</span>
                                    <span>{cartTotal.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCheckoutModal(false)}
                                    style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{ flex: 2, padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #0a66c2, #00d4bd)', color: 'white', fontWeight: 900, cursor: 'pointer', boxShadow: '0 6px 20px rgba(10, 102, 194, 0.3)' }}
                                >
                                    {submitting ? '⏳ Đang xử lý đặt tour...' : '✅ Hoàn Tất Đặt Chỗ Ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
