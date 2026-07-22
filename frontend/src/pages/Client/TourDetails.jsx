import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import RecommenderSection from '../../components/Client/RecommenderSection';
import ReviewSection from '../../components/Client/ReviewSection';

export default function TourDetails({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Tabs state
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        axios.get(`http://localhost:5000/api/tours/${id}`)
            .then(res => {
                setTour(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi lấy chi tiết tour:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: '#64748b' }}>⏳ Đang tải thông tin chi tiết của hành trình...</div>;
    }

    if (!tour) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h2>❌ Không tìm thấy tour này!</h2>
                <Link to="/tours" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', background: '#0a66c2', color: 'white', textDecoration: 'none', borderRadius: '12px', fontWeight: 700 }}>Quay lại danh sách tour</Link>
            </div>
        );
    }

    let parsedItinerary = [];
    let parsedIncluded = [];
    let parsedExcluded = [];
    try {
        parsedItinerary = typeof tour.itinerary === 'string' ? JSON.parse(tour.itinerary) : (tour.itinerary || []);
        parsedIncluded = typeof tour.included === 'string' ? JSON.parse(tour.included) : (tour.included || []);
        parsedExcluded = typeof tour.excluded === 'string' ? JSON.parse(tour.excluded) : (tour.excluded || []);
    } catch (e) {}

    const adultPrice = Number(tour.price) || 0;

    const handleBookClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/checkout/${id}`);
    };

    return (
        <div className="section" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#64748b' }}>
                <Link to="/" style={{ color: '#0a66c2', textDecoration: 'none' }}>Trang chủ</Link> / 
                <Link to="/tours" style={{ color: '#0a66c2', textDecoration: 'none', margin: '0 6px' }}>Danh sách tour</Link> / 
                <span style={{ color: '#1e293b', fontWeight: 600, marginLeft: '6px' }}>{tour.name}</span>
            </div>

            {/* TOP SECTION: Ảnh cover, Tiêu đề, Đánh giá, Giá, Nút Đặt Tour */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', marginBottom: '40px' }}>
                <div style={{ borderRadius: '24px', overflow: 'hidden', height: '420px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <img src={tour.image} alt={tour.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ display: 'inline-block', background: '#eff6ff', color: '#0a66c2', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 800 }}>
                            📍 {tour.location}
                        </span>
                        {tour.badge && (
                            <span style={{ display: 'inline-block', background: '#fff1f2', color: '#e11d48', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 800 }}>
                                🔥 {tour.badge}
                            </span>
                        )}
                    </div>
                    
                    <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', lineHeight: '1.3', marginBottom: '16px' }}>
                        {tour.name}
                    </h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', fontSize: '15px' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>⭐</span> {tour.rating || '4.9'} <span style={{ color: '#64748b', fontWeight: 500 }}>({tour.reviews_count || 0} đánh giá)</span>
                        </span>
                        <span style={{ color: '#cbd5e1' }}>|</span>
                        <span style={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>⏱️</span> {tour.duration}
                        </span>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', marginBottom: '30px' }}>
                        <span style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Giá ưu đãi từ</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '8px' }}>
                            <span style={{ fontSize: '36px', fontWeight: 900, color: '#e11d48' }}>
                                {adultPrice.toLocaleString('vi-VN')} đ
                            </span>
                            <span style={{ color: '#64748b', fontSize: '15px', fontWeight: 600 }}>/ khách</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleBookClick}
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '16px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s', width: '100%' }}
                    >
                        🚀 ĐẶT TOUR NGAY
                    </button>
                    {!user && (
                        <p style={{ textAlign: 'center', marginTop: '12px', color: '#64748b', fontSize: '14px' }}>
                            Bạn cần <Link to="/login" style={{ color: '#0a66c2', fontWeight: 700, textDecoration: 'none' }}>đăng nhập</Link> để đặt tour này
                        </p>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
                
                {/* Left Column: Tabs Content */}
                <div>
                    {/* Tabs Header */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0' }}>
                        {['description', 'includes', 'itinerary'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{ 
                                    padding: '14px 24px', 
                                    background: 'none', 
                                    border: 'none', 
                                    borderBottom: activeTab === tab ? '3px solid #0a66c2' : '3px solid transparent',
                                    color: activeTab === tab ? '#0a66c2' : '#64748b',
                                    fontSize: '16px', 
                                    fontWeight: activeTab === tab ? 800 : 600,
                                    cursor: 'pointer',
                                    marginBottom: '-2px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab === 'description' && '📝 Mô Tả'}
                                {tab === 'includes' && '✅ Bao Gồm / Không Bao Gồm'}
                                {tab === 'itinerary' && '🗺️ Lịch Trình'}
                            </button>
                        ))}
                    </div>

                    {/* Tabs Body */}
                    <div style={{ background: 'white', padding: '36px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', marginBottom: '40px' }}>
                        
                        {activeTab === 'description' && (
                            <div style={{ color: '#334155', fontSize: '16.5px', lineHeight: '1.9', whiteSpace: 'pre-line' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>Điểm nhấn hành trình</h2>
                                {tour.description}
                            </div>
                        )}

                        {activeTab === 'includes' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div style={{ background: '#f0fdf4', padding: '28px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#166534', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>✅ Dịch Vụ Bao Gồm</h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', color: '#15803d', fontSize: '15.5px', fontWeight: 500 }}>
                                        {parsedIncluded.length > 0 ? parsedIncluded.map((inc, i) => (
                                            <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><span style={{ color: '#22c55e', marginTop: '2px' }}>✔️</span><span style={{ lineHeight: '1.5' }}>{inc}</span></li>
                                        )) : <li>Đang cập nhật...</li>}
                                    </ul>
                                </div>
                                <div style={{ background: '#fef2f2', padding: '28px', borderRadius: '20px', border: '1px solid #fecaca' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#991b1b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>❌ Không Bao Gồm</h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', color: '#b91c1c', fontSize: '15.5px', fontWeight: 500 }}>
                                        {parsedExcluded.length > 0 ? parsedExcluded.map((exc, i) => (
                                            <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><span style={{ color: '#ef4444', marginTop: '2px' }}>✖️</span><span style={{ lineHeight: '1.5' }}>{exc}</span></li>
                                        )) : <li>Đang cập nhật...</li>}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'itinerary' && (
                            <div style={{ paddingLeft: '24px', borderLeft: '3px dashed #cbd5e1', position: 'relative', marginTop: '10px' }}>
                                {parsedItinerary.length > 0 ? parsedItinerary.map((item, idx) => (
                                    <div key={idx} style={{ position: 'relative', marginBottom: idx === parsedItinerary.length - 1 ? '0' : '45px' }}>
                                        <div style={{ position: 'absolute', left: '-42px', top: '0', width: '34px', height: '34px', borderRadius: '50%', background: '#0a66c2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px', border: '4px solid white', boxShadow: '0 0 0 2px #e0f2fe' }}>{idx + 1}</div>
                                        <div style={{ paddingLeft: '16px' }}>
                                            <div style={{ display: 'inline-block', background: '#f1f5f9', color: '#0a66c2', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>{item.day || `Ngày ${idx + 1}`}</div>
                                            <h4 style={{ margin: '0 0 14px', fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>{item.title}</h4>
                                            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', color: '#475569', fontSize: '15.5px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{item.content || item.detail}</div>
                                        </div>
                                    </div>
                                )) : <p style={{ color: '#64748b' }}>Chưa có thông tin lịch trình chi tiết.</p>}
                            </div>
                        )}
                    </div>

                    <ReviewSection 
                        tourId={id} 
                        user={user} 
                        onReviewAdded={(newRating, newCount) => {
                            setTour(prev => ({ ...prev, rating: newRating, reviews_count: newCount }));
                        }} 
                    />
                </div>

                {/* Right Column: Sticky Summary Card */}
                <div style={{ position: 'sticky', top: '90px' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 15px 35px rgba(0,0,0,0.08)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 16px 0' }}>Sẵn sàng trải nghiệm?</h3>
                        <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Giá ưu đãi</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 900, color: '#e11d48' }}>
                                    {adultPrice.toLocaleString('vi-VN')} đ
                                </span>
                                <span style={{ color: '#64748b', fontSize: '15px', fontWeight: 600 }}>/ khách</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleBookClick}
                            style={{ background: '#0a66c2', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', width: '100%', boxShadow: '0 4px 15px rgba(10, 102, 194, 0.2)' }}
                        >
                            Tiếp Tục Đặt Tour ➡️
                        </button>
                        {!user && (
                            <p style={{ textAlign: 'center', marginTop: '12px', color: '#64748b', fontSize: '13px' }}>
                                Vui lòng đăng nhập để tiến hành thanh toán
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <RecommenderSection user={user} currentTourId={id} title="🌍 Khám Phá Các Tour Tương Tự" />
        </div>
    );
}
