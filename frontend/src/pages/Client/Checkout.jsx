import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Checkout({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking Details
    const [departureDate, setDepartureDate] = useState('');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    // Contact Info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    // Payment
    const [paymentMethod, setPaymentMethod] = useState('office'); // office, paypal, momo
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 3);
        setDepartureDate(nextDate.toISOString().split('T')[0]);

        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAddress(user.address || ''); // Assuming user object has address
        }

        axios.get(`http://localhost:5000/api/tours/${id}`)
            .then(res => {
                setTour(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi lấy thông tin tour:", err);
                setLoading(false);
            });
    }, [id, user, navigate]);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: '#64748b' }}>⏳ Đang chuẩn bị thông tin thanh toán...</div>;
    if (!tour) return <div style={{ textAlign: 'center', padding: '100px 0' }}><h2>❌ Không tìm thấy tour này!</h2></div>;

    const adultPrice = Number(tour.price) || 0;
    const childPrice = Math.round(adultPrice * 0.7);
    const totalPriceVND = (adults * adultPrice) + (children * childPrice);
    
    // Simulate USD exchange rate: 1 USD = 25,000 VND
    const exchangeRate = 25000;
    const totalPriceUSD = (totalPriceVND / exchangeRate).toFixed(2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!departureDate || !name || !email || !phone || !address) {
            alert("⚠️ Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }

        setIsSubmitting(true);
        
        try {
            await axios.post('http://localhost:5000/api/bookings', {
                user_id: user.id,
                tour_id: tour.id,
                tour_name: tour.name,
                user_name: name,
                user_email: email,
                user_phone: phone,
                departure_date: departureDate,
                adults: adults,
                children: children,
                total_price: totalPriceVND,
                payment_method: paymentMethod
            });

            setSuccessMessage('🎉 Đặt tour và thanh toán thành công! Hệ thống sẽ chuyển hướng trong giây lát...');
            
            setTimeout(() => {
                navigate('/my-bookings');
            }, 3000);
        } catch (error) {
            console.error("Lỗi thanh toán:", error);
            alert("❌ Đã xảy ra lỗi khi xử lý đặt tour. Vui lòng thử lại!");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="section" style={{ paddingTop: '40px', paddingBottom: '80px', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ marginBottom: '40px' }}>
                <Link to={`/tours/${tour.id}`} style={{ color: '#0a66c2', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>←</span> Quay lại chi tiết tour
                </Link>
                <h1 style={{ fontSize: '34px', fontWeight: 900, color: '#1e293b', marginTop: '16px', marginBottom: '8px' }}>Xác Nhận & Thanh Toán</h1>
                <p style={{ color: '#64748b', fontSize: '15px' }}>Hoàn tất thông tin của bạn để giữ chỗ cho chuyến đi tuyệt vời này.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '40px', alignItems: 'start' }}>
                {/* LEFT COLUMN: Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* Form 1: Lịch trình & Số lượng */}
                    <div style={{ background: 'white', padding: '36px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ background: '#e0f2fe', color: '#0a66c2', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>1</span> 
                            Tùy chọn Lịch Trình
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#334155', fontSize: '14.5px' }}>📅 Ngày Khởi Hành</label>
                                <input 
                                    type="date" 
                                    value={departureDate}
                                    onChange={(e) => setDepartureDate(e.target.value)}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', color: '#1e293b' }}
                                />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#334155', fontSize: '14.5px' }}>👨‍👩‍👦 Người Lớn (&gt;12t)</label>
                                    <input 
                                        type="number" min="1" 
                                        value={adults}
                                        onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                                        style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', color: '#1e293b' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#334155', fontSize: '14.5px' }}>👶 Trẻ Em (3-12t)</label>
                                    <input 
                                        type="number" min="0" 
                                        value={children}
                                        onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                                        style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', color: '#1e293b' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form 2: Thông tin liên hệ */}
                    <div style={{ background: 'white', padding: '36px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ background: '#e0f2fe', color: '#0a66c2', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>2</span> 
                            Thông Tin Liên Hệ
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#334155', fontSize: '14.5px' }}>Họ và Tên</label>
                                <input 
                                    type="text" 
                                    placeholder="Vd: Nguyễn Văn A"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', color: '#1e293b' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#334155', fontSize: '14.5px' }}>Email</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', color: '#1e293b' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#334155', fontSize: '14.5px' }}>Số Điện Thoại</label>
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', color: '#1e293b' }}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#334155', fontSize: '14.5px' }}>Địa chỉ liên hệ</label>
                                <input 
                                    type="text" 
                                    placeholder="Nhập địa chỉ nhận vé / hóa đơn"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', color: '#1e293b' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form 3: Phương thức thanh toán */}
                    <div style={{ background: 'white', padding: '36px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ background: '#e0f2fe', color: '#0a66c2', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>3</span> 
                            Phương Thức Thanh Toán
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <label style={{ 
                                display: 'flex', alignItems: 'center', gap: '16px', padding: '22px', 
                                border: paymentMethod === 'office' ? '2px solid #0a66c2' : '1px solid #e2e8f0', 
                                borderRadius: '16px', cursor: 'pointer', background: paymentMethod === 'office' ? '#f0f9ff' : 'white',
                                transition: 'all 0.2s'
                            }}>
                                <input 
                                    type="radio" 
                                    name="payment" 
                                    value="office" 
                                    checked={paymentMethod === 'office'} 
                                    onChange={() => setPaymentMethod('office')}
                                    style={{ width: '22px', height: '22px', accentColor: '#0a66c2', flexShrink: 0 }} 
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '16.5px', fontWeight: 800, color: '#1e293b' }}>Thanh toán trực tiếp tại văn phòng</span>
                                    <span style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>Giữ chỗ miễn phí, thanh toán tiền mặt hoặc quẹt thẻ khi đến văn phòng của chúng tôi.</span>
                                </div>
                            </label>

                            <label style={{ 
                                display: 'flex', alignItems: 'center', gap: '16px', padding: '22px', 
                                border: paymentMethod === 'paypal' ? '2px solid #0a66c2' : '1px solid #e2e8f0', 
                                borderRadius: '16px', cursor: 'pointer', background: paymentMethod === 'paypal' ? '#f0f9ff' : 'white',
                                transition: 'all 0.2s'
                            }}>
                                <input 
                                    type="radio" 
                                    name="payment" 
                                    value="paypal" 
                                    checked={paymentMethod === 'paypal'} 
                                    onChange={() => setPaymentMethod('paypal')}
                                    style={{ width: '22px', height: '22px', accentColor: '#0a66c2', flexShrink: 0 }} 
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '16.5px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        Thanh toán qua PayPal <span style={{ background: '#003087', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 900, letterSpacing: '0.5px' }}>PayPal</span>
                                    </span>
                                    <span style={{ fontSize: '13.5px', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>Thanh toán an toàn qua cổng quốc tế (Hỗ trợ thẻ Visa, Mastercard).</span>
                                </div>
                            </label>

                            <label style={{ 
                                display: 'flex', alignItems: 'center', gap: '16px', padding: '22px', 
                                border: paymentMethod === 'momo' ? '2px solid #0a66c2' : '1px solid #e2e8f0', 
                                borderRadius: '16px', cursor: 'pointer', background: paymentMethod === 'momo' ? '#f0f9ff' : 'white',
                                transition: 'all 0.2s'
                            }}>
                                <input 
                                    type="radio" 
                                    name="payment" 
                                    value="momo" 
                                    checked={paymentMethod === 'momo'} 
                                    onChange={() => setPaymentMethod('momo')}
                                    style={{ width: '22px', height: '22px', accentColor: '#0a66c2', flexShrink: 0 }} 
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '16.5px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        Thanh toán qua Ví MoMo <span style={{ background: '#a50064', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 900, letterSpacing: '0.5px' }}>MoMo</span>
                                    </span>
                                    <span style={{ fontSize: '13.5px', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>Quét mã QR qua ứng dụng MoMo nhanh chóng, tiện lợi, không mất phí giao dịch.</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Order Summary */}
                <div style={{ position: 'sticky', top: '100px' }}>
                    <div style={{ background: 'white', padding: '0', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 15px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        
                        {/* Tour Header Image */}
                        <div style={{ height: '200px', position: 'relative' }}>
                            <img src={tour.image} alt={tour.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(15, 23, 42, 0.95))', padding: '30px 24px 20px 24px' }}>
                                <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, marginBottom: '8px', display: 'inline-block' }}>{tour.duration}</span>
                                <h3 style={{ color: 'white', fontSize: '17.5px', fontWeight: 800, margin: 0, lineHeight: '1.4' }}>{tour.name}</h3>
                            </div>
                        </div>

                        <div style={{ padding: '28px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Tóm Tắt Đơn Hàng</h4>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '15px', color: '#475569' }}>
                                <span>Người lớn (x{adults})</span>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>{(adults * adultPrice).toLocaleString('vi-VN')} đ</span>
                            </div>
                            
                            {children > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '15px', color: '#475569' }}>
                                    <span>Trẻ em (x{children})</span>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{(children * childPrice).toLocaleString('vi-VN')} đ</span>
                                </div>
                            )}

                            <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '20px', paddingTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '17px', fontWeight: 900, color: '#1e293b' }}>Tổng Thanh Toán</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '32px', fontWeight: 900, color: '#e11d48', lineHeight: '1.1' }}>{totalPriceVND.toLocaleString('vi-VN')} đ</span>
                                        {paymentMethod === 'paypal' && (
                                            <span style={{ fontSize: '14.5px', color: '#003087', fontWeight: 800, marginTop: '8px', background: '#f0f9ff', padding: '6px 12px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                                                ~ {totalPriceUSD} USD
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {successMessage && (
                                <div style={{ marginTop: '24px', padding: '20px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', color: '#065f46', fontSize: '15px', fontWeight: 800, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)' }}>
                                    <span style={{ fontSize: '28px' }}>🎉</span>
                                    {successMessage}
                                </div>
                            )}

                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{ 
                                    width: '100%', 
                                    background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '18px', 
                                    borderRadius: '16px', 
                                    fontSize: '17px', 
                                    fontWeight: 900, 
                                    marginTop: '28px', 
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    boxShadow: isSubmitting ? 'none' : '0 10px 25px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN & THANH TOÁN 🚀'}
                            </button>
                            <p style={{ textAlign: 'center', margin: '14px 0 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                                Bằng việc xác nhận đặt tour, bạn đã đồng ý với<br/> <Link to="#" style={{ color: '#0a66c2', fontWeight: 600 }}>Điều khoản</Link> và <Link to="#" style={{ color: '#0a66c2', fontWeight: 600 }}>Chính sách hoàn hủy</Link> của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
