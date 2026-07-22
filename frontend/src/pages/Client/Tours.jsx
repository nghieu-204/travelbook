import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Tours() {
    const { addToCart } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();
    const [allTours, setAllTours] = useState([]);
    const [loading, setLoading] = useState(true);

    // States bộ lọc
    const initialKeyword = searchParams.get('keyword') || '';
    const initialRegion = searchParams.get('region') || '';
    const [keyword, setKeyword] = useState(initialKeyword);
    const [selectedRegions, setSelectedRegions] = useState(initialRegion ? [initialRegion] : []);
    const [minRating, setMinRating] = useState(0);
    const [selectedDurations, setSelectedDurations] = useState([]);
    const [sortBy, setSortBy] = useState('default');

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const toursPerPage = 6;

    useEffect(() => {
        setLoading(true);
        axios.get('http://localhost:5000/api/tours')
            .then(res => {
                setAllTours(res.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi lấy tours:", err);
                setLoading(false);
            });
    }, []);

    // Filter logic
    const displayedTours = allTours.filter(tour => {
        if (keyword && !tour.name.toLowerCase().includes(keyword.toLowerCase()) && !(tour.location && tour.location.toLowerCase().includes(keyword.toLowerCase()))) return false;
        if (selectedRegions.length > 0 && !selectedRegions.includes(tour.region)) return false;
        if (selectedDurations.length > 0 && !selectedDurations.includes(tour.duration)) return false;
        if (minRating > 0 && Number(tour.rating || 5) !== minRating && minRating !== 0) {
            // Note: Radio button rating usually means "exactly this rating" or "this rating and above". Let's do exactly or >=. Let's do >= for better UX.
            if (Number(tour.rating || 5) < minRating) return false;
        }
        return true;
    }).sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
        return 0;
    });

    // Reset current page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, selectedRegions, selectedDurations, minRating, sortBy]);

    // Tính toán list hiển thị theo page
    const totalPages = Math.ceil(displayedTours.length / toursPerPage);
    const indexOfLastTour = currentPage * toursPerPage;
    const indexOfFirstTour = indexOfLastTour - toursPerPage;
    const currentTours = displayedTours.slice(indexOfFirstTour, indexOfLastTour);

    // Tính toán Featured Tours
    const featuredTours = [...allTours].sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0)).slice(0, 3);

    const handleRegionChange = (region) => {
        if (selectedRegions.includes(region)) {
            setSelectedRegions(selectedRegions.filter(r => r !== region));
        } else {
            setSelectedRegions([...selectedRegions, region]);
        }
    };

    const handleDurationChange = (duration) => {
        if (selectedDurations.includes(duration)) {
            setSelectedDurations(selectedDurations.filter(d => d !== duration));
        } else {
            setSelectedDurations([...selectedDurations, duration]);
        }
    };

    const handleResetFilters = () => {
        setKeyword('');
        setSelectedRegions([]);
        setSelectedDurations([]);
        setMinRating(0);
        setSortBy('default');
        setSearchParams({});
    };

    // Các lựa chọn cứng
    const regionOptions = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];
    const durationOptions = ['2 ngày 1 đêm', '3 ngày 2 đêm', '4 ngày 3 đêm', '5 ngày 4 đêm'];

    return (
        <div className="section" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
            {/* Header & Breadcrumb */}
            <div style={{ marginBottom: '30px' }}>
                <Link to="/" style={{ color: '#0a66c2', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>← Trang chủ</span>
                </Link>
                <h1 style={{ fontSize: '34px', fontWeight: 900, color: '#1e293b', marginTop: '10px' }}>
                    🌍 Khám Phá Kho Báu Du Lịch Việt Nam & Quốc Tế
                </h1>
                <p style={{ color: '#64748b', fontSize: '15px' }}>Sử dụng bộ lọc nâng cao để tìm kiếm hành trình hoàn hảo cho bạn</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '35px', alignItems: 'start' }}>
                {/* SIDEBAR BỘ LỌC */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'white', padding: '24px 20px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                ⚙️ Bộ Lọc Nâng Cao
                            </h3>
                            <button 
                                onClick={handleResetFilters} 
                                style={{ background: '#f43f5e', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Clear
                            </button>
                        </div>

                        {/* 1. Lọc theo Khu vực (Checkbox) */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>Khu vực (Miền)</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {regionOptions.map(region => (
                                    <label key={region} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14.5px', color: '#475569' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedRegions.includes(region)}
                                            onChange={() => handleRegionChange(region)}
                                            style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                                        />
                                        {region}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 2. Lọc theo Thời lượng (Checkbox) */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>Thời lượng</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {durationOptions.map(duration => (
                                    <label key={duration} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14.5px', color: '#475569' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedDurations.includes(duration)}
                                            onChange={() => handleDurationChange(duration)}
                                            style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
                                        />
                                        {duration}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 3. Lọc theo Đánh giá (Radio) */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>Đánh giá (Từ)</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[5, 4, 3, 2, 1].map(star => (
                                    <label key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14.5px', color: '#475569' }}>
                                        <input 
                                            type="radio" 
                                            name="rating"
                                            checked={minRating === star}
                                            onChange={() => setMinRating(star)}
                                            style={{ width: '18px', height: '18px', accentColor: '#f59e0b', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: '#f59e0b', fontSize: '15px', letterSpacing: '2px' }}>
                                            {'★'.repeat(star)}<span style={{ color: '#cbd5e1' }}>{'★'.repeat(5 - star)}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Từ khóa tìm kiếm */}
                        <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>Tìm theo tên / từ khóa</h4>
                            <input 
                                type="text" 
                                placeholder="VD: Sapa, Đà Lạt..." 
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                    </div>

                    {/* SECTION: CÁC TOUR NỔI BẬT (Bên dưới bộ lọc) */}
                    {featuredTours.length > 0 && (
                        <div style={{ background: 'white', padding: '24px 20px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '16px', borderBottom: '2px solid #3b82f6', display: 'inline-block', paddingBottom: '4px' }}>
                                🔥 Các Tour Nổi Bật
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {featuredTours.map(tour => (
                                    <Link to={`/tours/${tour.id}`} key={`featured-${tour.id}`} style={{ display: 'flex', gap: '12px', textDecoration: 'none', transition: 'transform 0.2s' }} className="featured-tour-card">
                                        <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                                            <img src={tour.image} alt={tour.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tour.name}</h4>
                                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>{Number(tour.price).toLocaleString('vi-VN')} đ</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* DANH SÁCH TOURS BÊN PHẢI */}
                <main>
                    {/* Top Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'white', padding: '14px 22px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                            Tìm thấy <strong style={{ color: '#10b981', fontSize: '16px' }}>{displayedTours.length}</strong> hành trình
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Sắp xếp:</span>
                            <select 
                                style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#334155', outline: 'none', cursor: 'pointer', background: 'white' }}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="default">Mặc định</option>
                                <option value="price-asc">Giá: Thấp đến Cao</option>
                                <option value="price-desc">Giá: Cao đến Thấp</option>
                                <option value="rating">Đánh giá cao nhất ⭐</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0', fontSize: '18px', color: '#64748b' }}>
                            ⏳ Đang tải danh sách tours...
                        </div>
                    ) : currentTours.length === 0 ? (
                        <div style={{ background: 'white', padding: '60px 20px', borderRadius: '20px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏝️</div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>Không tìm thấy tour phù hợp</h3>
                            <p style={{ color: '#64748b', marginBottom: '20px' }}>Vui lòng thay đổi tiêu chí lọc để xem thêm các chuyến đi tuyệt vời khác!</p>
                            <button onClick={handleResetFilters} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                🔄 Xóa Bộ Lọc
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="tour-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px' }}>
                                {currentTours.map((tour) => (
                                    <div key={tour.id} className="tour-card" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s' }}>
                                        <div className="tour-image-container" style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
                                            <img src={tour.image} alt={tour.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            
                                            {/* Badge bên trái */}
                                            <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, boxShadow: '0 2px 8px rgba(225, 29, 72, 0.4)' }}>
                                                {tour.badge || 'Nổi bật'}
                                            </div>

                                            {/* Nút Heart bên phải */}
                                            <button style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px', borderRadius: '50%', background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} title="Yêu thích">
                                                🧡
                                            </button>

                                            {/* Điểm đến bên dưới ảnh */}
                                            <div style={{ position: 'absolute', bottom: '12px', left: '14px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                                                📍 {tour.location ? tour.location.toUpperCase() : 'VIỆT NAM'}
                                            </div>
                                        </div>

                                        <div className="tour-body" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <h3 className="tour-title" title={tour.name} style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: '0 0 12px', lineHeight: '1.4' }}>
                                                    {tour.name}
                                                </h3>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                                                    <span>⏱️ {tour.duration || '3 ngày 2 đêm'}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 800 }}>
                                                        <span>👤 {tour.reviews_count || 46}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
                                                <div>
                                                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b' }}>
                                                        {Number(tour.price).toLocaleString('vi-VN')} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>đ</span>
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
                                                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                        title="Thêm vào giỏ"
                                                    >
                                                        🛒
                                                    </button>
                                                    <Link 
                                                        to={`/tours/${tour.id}`} 
                                                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#1e293b', fontSize: '16px', fontWeight: 800, transition: 'all 0.2s' }}
                                                        title="Xem chi tiết"
                                                    >
                                                        ↗
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* PHÂN TRANG (PAGINATION) */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '40px', gap: '8px' }}>
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1e293b' }}
                                    >
                                        &lt;
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, idx) => (
                                        <button 
                                            key={idx + 1}
                                            onClick={() => setCurrentPage(idx + 1)}
                                            style={{ width: '40px', height: '40px', borderRadius: '10px', border: currentPage === idx + 1 ? 'none' : '1px solid #cbd5e1', background: currentPage === idx + 1 ? '#3b82f6' : 'white', color: currentPage === idx + 1 ? 'white' : '#1e293b', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}

                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1e293b' }}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}