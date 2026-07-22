import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function MyBookings({ user }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        axios.get(`http://localhost:5000/api/bookings/user/${user.id}`)
            .then(res => {
                setBookings(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi lấy lịch sử đặt tour:", err);
                setLoading(false);
            });
    }, [user]);

    if (!user) {
        return (
            <div className="section" style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '600px' }}>
                <div style={{ fontSize: '54px', marginBottom: '15px' }}>🔐</div>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                    Bạn Cần Đăng Nhập Để Xem Lịch Sử
                </h2>
                <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.6' }}>
                    Vui lòng đăng nhập vào tài khoản SkyTravel của bạn để xem danh sách các chuyến đi đã đặt và trạng thái xác nhận.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <Link to="/login" className="btn btn-primary" style={{ padding: '12px 30px' }}>
                        👉 Đăng Nhập Ngay
                    </Link>
                    <Link to="/register" className="btn btn-outline" style={{ padding: '12px 30px' }}>
                        Tạo Tài Khoản
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="section" style={{ paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#1e293b' }}>
                        🎒 Lịch Sử Chuyến Đi Của Bạn
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '6px' }}>
                        Xin chào <strong style={{ color: '#0a66c2' }}>{user.name}</strong>! Dưới đây là danh sách toàn bộ các đơn đặt tour của bạn.
                    </p>
                </div>
                <Link to="/tours" className="btn btn-primary">
                    + Đặt Thêm Tour Mới
                </Link>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0', fontSize: '18px', color: '#64748b' }}>
                    ⏳ Đang tải dữ liệu đặt chỗ của bạn...
                </div>
            ) : bookings.length === 0 ? (
                <div style={{ background: 'white', padding: '70px 20px', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center', maxWidth: '700px', margin: '40px auto' }}>
                    <div style={{ fontSize: '56px', marginBottom: '15px' }}>🏖️</div>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
                        Bạn chưa đặt chuyến đi nào!
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: '25px' }}>
                        Hãy chọn cho mình một điểm đến mơ ước và trải nghiệm dịch vụ du lịch chuẩn 5 sao từ SkyTravel ngay hôm nay.
                    </p>
                    <Link to="/tours" className="btn btn-gold" style={{ padding: '14px 36px' }}>
                        🚀 Khám Phá Tour Ngay
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {bookings.map((booking) => {
                        const isConfirmed = booking.status === 'Đã xác nhận' || booking.status === 'Thành công';
                        return (
                            <div 
                                key={booking.id} 
                                style={{ 
                                    background: 'white', 
                                    padding: '26px 30px', 
                                    borderRadius: '20px', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                    display: 'grid',
                                    gridTemplateColumns: '1.8fr 1fr 1fr auto',
                                    gap: '25px',
                                    alignItems: 'center'
                                }}
                            >
                                {/* Cột 1: Thông tin tour */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: '6px' }}>
                                            #SKY-{booking.id}
                                        </span>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                            Đặt ngày: {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#1e293b', lineHeight: '1.4' }}>
                                        {booking.tour_name}
                                    </h3>
                                    <Link 
                                        to={`/tours/${booking.tour_id}`} 
                                        style={{ fontSize: '14px', color: '#0a66c2', fontWeight: 600, display: 'inline-block', marginTop: '6px' }}
                                    >
                                        👉 Xem lại thông tin tour
                                    </Link>
                                </div>

                                {/* Cột 2: Thời gian khởi hành & Khách */}
                                <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                                        Khởi hành
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                                        📅 {new Date(booking.departure_date).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                        👨‍👩‍👦 {booking.adults} Người lớn {booking.children > 0 && `• 👶 ${booking.children} Trẻ em`}
                                    </div>
                                </div>

                                {/* Cột 3: Tổng thanh toán */}
                                <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                                        Tổng tiền
                                    </div>
                                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#e11d48' }}>
                                        {Number(booking.total_price).toLocaleString('vi-VN')} đ
                                    </div>
                                </div>

                                {/* Cột 4: Trạng thái */}
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '6px',
                                        padding: '8px 16px', 
                                        borderRadius: '30px', 
                                        fontSize: '14px', 
                                        fontWeight: 700,
                                        background: isConfirmed ? '#ecfdf5' : '#fffbeb',
                                        color: isConfirmed ? '#059669' : '#d97706',
                                        border: `1px solid ${isConfirmed ? '#a7f3d0' : '#fde68a'}`
                                    }}>
                                        {isConfirmed ? '✅ Đã Xác Nhận' : '⏳ Đang Chờ Xử Lý'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
