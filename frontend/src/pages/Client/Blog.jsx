import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Blog() {
    // Cuộn lên đầu trang khi vào trang này
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Dữ liệu bài viết cẩm nang du lịch
    const travelGuides = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
            category: 'Kinh nghiệm du lịch',
            date: '20/07/2026',
            title: 'Kinh nghiệm du lịch Phú Quốc Grand World & Hòn Thơm từ A-Z',
            summary: 'Khám phá trọn vẹn "Thành phố không ngủ" Grand World, bí kíp săn vé cáp treo vượt biển Hòn Thơm giá cực hời.'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
            category: 'Review địa điểm',
            date: '18/07/2026',
            title: 'Top 5 Resort 6 Sao Sang Trọng Bậc Nhất Tại Đà Nẵng & Hội An',
            summary: 'Tận hưởng không gian nghỉ dưỡng biệt lập với bể bơi vô cực ngắm trọn biển Mỹ Khê và kiến trúc di sản độc đáo.'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1517865288-9af2a11b6260?auto=format&fit=crop&w=600&q=80',
            category: 'Mẹo chuẩn bị hành lý',
            date: '15/07/2026',
            title: '5 Mẹo Xếp Hành Lý Siêu Gọn Nhẹ Cho Chuyến Đi Dài Ngày',
            summary: 'Hướng dẫn cách tối ưu không gian vali, lựa chọn trang phục đa dụng và mang đầy đủ vật dụng cần thiết mà không bị lố ký.'
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
            category: 'Kinh nghiệm du lịch',
            date: '10/07/2026',
            title: 'Chinh Phục Đỉnh Fansipan Sapa & Săn Mây Y Tý Mùa Thu',
            summary: 'Chuẩn bị trang phục, rèn luyện thể lực và thời điểm vàng trong ngày để ngắm biển mây rực rỡ trên Nóc nhà Đông Dương.'
        }
    ];

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#f8fafc' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 5%' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'inline-block', background: '#eff6ff', color: '#0a66c2', padding: '8px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>
                        📰 CẨM NANG & KINH NGHIỆM DU LỊCH
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: '0 0 16px' }}>
                        Góc Truyền Cảm Hứng & Bí Kíp Từ Chuyên Gia
                    </h1>
                    <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        Cập nhật xu hướng du lịch mới nhất, hướng dẫn lịch trình tự túc và bí quyết săn deal ưu đãi từ các chuyên gia du lịch hàng đầu.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                    {travelGuides.map(guide => (
                        <div key={guide.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)';
                            }}
                        >
                            <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                                <img src={guide.image} alt={guide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(10, 102, 194, 0.95)', color: 'white', padding: '6px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: 800, backdropFilter: 'blur(4px)' }}>
                                    {guide.category}
                                </span>
                            </div>
                            <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '12px' }}>🕒 Cập nhật: {guide.date}</span>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', lineHeight: '1.4', marginBottom: '12px' }}>
                                        {guide.title}
                                    </h3>
                                    <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                                        {guide.summary}
                                    </p>
                                </div>
                                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#0a66c2', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        Đọc chi tiết <span style={{ fontSize: '16px' }}>→</span>
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, background: '#f8fafc', padding: '4px 10px', borderRadius: '10px' }}>
                                        5 phút đọc
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Phân trang giả định để làm đẹp */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '60px' }}>
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0a66c2', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(10, 102, 194, 0.3)' }}>1</button>
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; }}>2</button>
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; }}>3</button>
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; }}>→</button>
                </div>
            </div>
        </div>
    );
}

export default Blog;
