import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import RecommenderSection from '../../components/Client/RecommenderSection';
import './Home.css';

export default function Home({ user }) {
    const navigate = useNavigate();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);

    // Floating Search Bar States
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [freeText, setFreeText] = useState('');
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5000/api/tours')
            .then(res => {
                setTours(res.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi lấy danh sách tour:", err);
                setLoading(false);
            });
    }, []);

    // Lấy danh sách tour mới nhất
    const latestTours = [...tours].reverse().slice(0, 6);

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
            return;
        }
        if (isListening) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFreeText(transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Xây dựng query string từ các trường
        const params = new URLSearchParams();
        if (destination) params.append('region', destination); // Assuming region for destination
        if (freeText) params.append('keyword', freeText);
        // Date có thể pass qua params nếu backend hỗ trợ
        
        navigate(`/tours?${params.toString()}`);
    };

    return (
        <div className="home-container">
            {/* 1. HERO SECTION */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title" style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>Tour Du Lịch</h1>
                </div>

                {/* Floating Search Bar */}
                <div className="search-bar-container">
                    {/* Destination Dropdown */}
                    <div className="search-field">
                        <span className="search-icon">📍</span>
                        <div className="search-input-group">
                            <span className="search-label">Điểm đến</span>
                            <select 
                                className="search-input" 
                                value={destination} 
                                onChange={e => setDestination(e.target.value)}
                                style={{ appearance: 'none', cursor: 'pointer' }}
                            >
                                <option value="">Tất cả địa điểm</option>
                                <option value="Miền Bắc">Miền Bắc</option>
                                <option value="Miền Trung">Miền Trung</option>
                                <option value="Miền Nam">Miền Nam</option>
                            </select>
                        </div>
                    </div>

                    {/* Start Date */}
                    <div className="search-field">
                        <span className="search-icon">🗓️</span>
                        <div className="search-input-group">
                            <span className="search-label">Ngày đi</span>
                            <input 
                                type="date" 
                                className="search-input" 
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="search-field">
                        <span className="search-icon">📅</span>
                        <div className="search-input-group">
                            <span className="search-label">Ngày về</span>
                            <input 
                                type="date" 
                                className="search-input" 
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Free Text Search with NLP mention */}
                    <div className="search-field" style={{ flex: 1.5 }}>
                        <span className="search-icon">✨</span>
                        <div className="search-input-group">
                            <span className="search-label">Mô tả chuyến đi của bạn (AI Search)</span>
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="VD: Tour trăng mật ở biển giá dưới 5 triệu..." 
                                value={freeText}
                                onChange={e => setFreeText(e.target.value)}
                            />
                        </div>
                        {/* Voice Button */}
                        <button 
                            type="button" 
                            className={`voice-btn ${isListening ? 'listening' : ''}`} 
                            onClick={handleVoiceSearch}
                            title="Tìm kiếm bằng giọng nói"
                        >
                            🎙️
                        </button>
                    </div>

                    <button onClick={handleSearch} className="search-btn">
                        🔍 Tìm kiếm
                    </button>
                </div>
            </section>

            {/* 2. CÁC TOUR MỚI NHẤT (LATEST TOURS) */}
            <section className="section">
                <h2 className="section-title">Các Tour Mới Nhất</h2>
                <p className="section-desc">Những hành trình vừa được ra mắt với ưu đãi hấp dẫn đang chờ đón bạn.</p>
                
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0', fontSize: '18px', color: '#64748b' }}>
                        ⏳ Đang tải danh sách tour...
                    </div>
                ) : (
                    <div className="tours-grid">
                        {latestTours.map((tour) => (
                            <div key={tour.id} className="tour-card">
                                <div className="tour-img-wrap">
                                    <img src={tour.image} alt={tour.name} className="tour-img" />
                                    <div className="tour-duration-badge">
                                        ⏱️ {tour.duration || '3 ngày 2 đêm'}
                                    </div>
                                </div>
                                <div className="tour-info">
                                    <h3 className="tour-name" title={tour.name}>{tour.name}</h3>
                                    <div className="tour-price-row">
                                        <div>
                                            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Giá từ</span>
                                            <div className="tour-price">{Number(tour.price).toLocaleString('vi-VN')} <span>đ</span></div>
                                        </div>
                                        <Link to={`/tours/${tour.id}`} className="btn-book">
                                            Đặt ngay
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 3. DU LỊCH VỚI SỰ TỰ TIN (TRAVEL WITH CONFIDENCE) */}
            <section className="confidence-section">
                <h2 className="confidence-title">Du Lịch Với Sự Tự Tin</h2>
                <div className="confidence-grid">
                    <div className="confidence-item">
                        <div className="confidence-icon">🌍</div>
                        <h3 className="confidence-item-title">Điểm Đến Đa Dạng</h3>
                        <p className="confidence-item-desc">Hàng trăm điểm đến hấp dẫn trải dài khắp mọi miền đất nước, sẵn sàng cho bạn khám phá.</p>
                    </div>
                    <div className="confidence-item">
                        <div className="confidence-icon">⭐</div>
                        <h3 className="confidence-item-title">Khách Hàng Tin Tưởng</h3>
                        <p className="confidence-item-desc">Hơn 50,000+ du khách đã trải nghiệm và đánh giá 5 sao cho dịch vụ của chúng tôi.</p>
                    </div>
                    <div className="confidence-item">
                        <div className="confidence-icon">🛡️</div>
                        <h3 className="confidence-item-title">Bảo Mật & An Toàn</h3>
                        <p className="confidence-item-desc">Hệ thống thanh toán an toàn, bảo mật thông tin tuyệt đối cùng gói bảo hiểm du lịch trọn gói.</p>
                    </div>
                    <div className="confidence-item">
                        <div className="confidence-icon">🎧</div>
                        <h3 className="confidence-item-title">Hỗ Trợ 24/7</h3>
                        <p className="confidence-item-desc">Đội ngũ chuyên viên tư vấn luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào, mọi nơi.</p>
                    </div>
                </div>
            </section>

            {/* 4. KHÁM PHÁ CÁC ĐIỂM ĐẾN PHỔ BIẾN (RECOMMENDER SYSTEM) */}
            {/* Sử dụng RecommenderSection có sẵn từ hệ thống hiện tại */}
            <section style={{ padding: '0 5%' }}>
                <RecommenderSection
                    user={user}
                    title={user ? `💡 Gợi Ý Cá Nhân Hóa Cho ${user.name}` : "🔥 Khám Phá Các Điểm Đến Phổ Biến"}
                />
            </section>

            <div style={{ height: '60px' }}></div> {/* Spacer */}
        </div>
    );
}