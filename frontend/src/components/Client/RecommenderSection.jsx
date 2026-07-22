import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function RecommenderSection({ user, currentTourId = null, title = "💡 Tour Gợi Ý Dành Riêng Cho Bạn" }) {
    const { addToCart } = useCart();
    const [tours, setTours] = useState([]);
    const [matchReason, setMatchReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState('Tất cả');

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                let endpoint = 'http://localhost:5000/api/recommendations';
                if (currentTourId) {
                    endpoint = `http://localhost:5000/api/recommendations/related/${currentTourId}`;
                } else {
                    const params = new URLSearchParams();
                    if (user?.id) params.append('userId', user.id);
                    if (user?.email) params.append('email', user.email);
                    if (selectedRegion && selectedRegion !== 'Tất cả') params.append('region', selectedRegion);
                    endpoint += `?${params.toString()}`;
                }

                const res = await axios.get(endpoint);
                if (currentTourId) {
                    setTours(res.data || []);
                    setMatchReason('🎯 Các tour có cùng khu vực & chủ đề tương tự');
                } else {
                    setTours(res.data.tours || []);
                    setMatchReason(res.data.matchReason || '🔥 Top tour phổ biến được yêu thích nhất');
                }
            } catch (error) {
                console.error('Lỗi tải tour gợi ý:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user, currentTourId, selectedRegion]);

    // Lọc tours theo miền nếu đang chọn ở tab client
    const filteredTours = selectedRegion === 'Tất cả' 
        ? tours 
        : tours.filter(t => t.region === selectedRegion || tours.length <= 6);

    if (loading && tours.length === 0) return null;

    return (
        <section style={{
            margin: '50px 0',
            padding: '36px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #0a66c2, #00d4bd)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            boxShadow: '0 2px 8px rgba(10, 102, 194, 0.25)'
                        }}>
                            ✨ AI Recommender System
                        </span>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                            {matchReason}
                        </span>
                    </div>
                    <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                        {title}
                    </h2>
                </div>
                {!currentTourId && (
                    <Link to="/tours" style={{
                        color: '#0a66c2',
                        fontWeight: 700,
                        textDecoration: 'none',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span>Khám phá tất cả tour</span>
                        <span>→</span>
                    </Link>
                )}
            </div>

            {/* Bộ lọc nhanh chia theo 3 Miền right in RecommenderSection */}
            {!currentTourId && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam'].map((reg) => (
                        <button
                            key={reg}
                            onClick={() => setSelectedRegion(reg)}
                            style={{
                                padding: '8px 18px',
                                borderRadius: '20px',
                                border: selectedRegion === reg ? '2px solid #10b981' : '1px solid #cbd5e1',
                                background: selectedRegion === reg ? '#ecfdf5' : 'white',
                                color: selectedRegion === reg ? '#065f46' : '#475569',
                                fontWeight: selectedRegion === reg ? 800 : 600,
                                fontSize: '13.5px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: selectedRegion === reg ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                            }}
                        >
                            {reg === 'Tất cả' && '🔥 Tất cả'}
                            {reg === 'Miền Bắc' && '🌸 Miền Bắc'}
                            {reg === 'Miền Trung' && '🌊 Miền Trung'}
                            {reg === 'Miền Nam' && '☀️ Miền Nam'}
                        </button>
                    ))}
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
            }}>
                {filteredTours.map((tour) => (
                    <div key={tour.id} style={{
                        background: 'white',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(10, 102, 194, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.04)';
                    }}
                    >
                        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                            <img
                                src={tour.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
                                alt={tour.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '14px',
                                left: '14px',
                                background: 'rgba(15, 23, 42, 0.75)',
                                backdropFilter: 'blur(8px)',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 700
                            }}>
                                📍 {tour.region || 'Miền Nam'}
                            </div>
                            {tour.badge && (
                                <div style={{
                                    position: 'absolute',
                                    top: '14px',
                                    right: '14px',
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 800
                                }}>
                                    {tour.badge}
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748b' }}>
                                    <span>⏱️ {tour.duration || '3 ngày 2 đêm'}</span>
                                    <span style={{ color: '#f59e0b', fontWeight: 800 }}>⭐ {tour.rating || '4.8'} ({tour.reviews_count || 120})</span>
                                </div>
                                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: '0 0 10px', lineHeight: '1.4' }}>
                                    {tour.name}
                                </h3>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #f1f5f9', marginTop: '12px' }}>
                                <div>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Chỉ từ</span>
                                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#e11d48' }}>
                                        {Number(tour.price).toLocaleString('vi-VN')} đ
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            addToCart(tour);
                                        }}
                                        style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '16px', cursor: 'pointer' }}
                                        title="Thêm nhanh vào giỏ hàng"
                                    >
                                        🛒
                                    </button>
                                    <Link
                                        to={`/tours/${tour.id}`}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #0a66c2, #00d4bd)',
                                            color: 'white',
                                            textDecoration: 'none',
                                            fontWeight: 800,
                                            fontSize: '13px',
                                            boxShadow: '0 4px 12px rgba(10, 102, 194, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        Đặt Ngay →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
