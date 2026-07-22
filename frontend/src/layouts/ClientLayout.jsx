import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ChatWidget from '../components/Client/ChatWidget';

function Navigation({ user, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartCount } = useCart();

    // 1. Phân biệt trang chủ và trang phụ để tự động chỉnh màu menu
    const isHome = location.pathname === '/';
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const prevScrollY = useRef(0);

    // 2. States cho chức năng Kính lúp (Click to open / Click outside to close)
    const [showSearch, setShowSearch] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isListening, setIsListening] = useState(false);
    const searchRef = useRef(null);

    // 3. States cho Dropdown Tài khoản (Cài đặt, Giỏ hàng, Lịch sử, Đăng xuất)
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    // Xử lý click ra ngoài ô tìm kiếm hoặc menu user để tự động đóng
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Smart scroll: Đổi màu và tự động ẩn/hiện khi cuộn trang
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Đổi màu nền khi vượt qua 50px
            if (currentScrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            // Ẩn menu khi cuộn xuống sâu hơn 150px, hiện ra khi cuộn ngược lên
            if (currentScrollY > 150 && currentScrollY > prevScrollY.current + 10) {
                setIsHidden(true);
                setShowSearch(false);
                setShowUserMenu(false);
            } else if (currentScrollY < prevScrollY.current) {
                setIsHidden(false);
            }

            prevScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Xử lý tìm kiếm giọng nói
    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('⚠️ Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng gõ từ khóa.');
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
            setSearchKeyword(transcript);
            setIsListening(false);
            navigate(`/tours?keyword=${encodeURIComponent(transcript.trim())}`);
            setShowSearch(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchKeyword.trim()) {
            navigate(`/tours?keyword=${encodeURIComponent(searchKeyword.trim())}`);
            setShowSearch(false);
        }
    };

    return (
        <nav
            className="navbar"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1000,
                background: isHome && !isScrolled ? 'transparent' : '#ffffff',
                borderBottom: isHome && !isScrolled ? 'none' : '1px solid #e2e8f0',
                boxShadow: isHome && !isScrolled ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                transform: isHidden ? 'translateY(-100%)' : 'translateY(0)',
                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease, padding 0.35s ease, box-shadow 0.35s ease',
                padding: isScrolled ? '12px 5%' : '18px 5%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            {/* BÊN TRÁI: LOGO */}
            <Link to="/" className="logo" style={{ color: isHome && !isScrolled ? 'white' : '#0f172a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #ffb703, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(255, 183, 3, 0.4)' }}>
                    ✈️
                </div>
                <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
                    Sky<span style={{ color: isHome && !isScrolled ? '#a7f3d0' : '#00d4bd' }}>Travel</span>
                </span>
            </Link>

            {/* Ở GIỮA: CÁC ĐƯỜNG LINK (Trang chủ, Tours, Điểm đến, Liên hệ) */}
            <div className="nav-links" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', background: isHome && !isScrolled ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.04)', padding: '6px 10px', borderRadius: '30px', border: isHome && !isScrolled ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.08)', zIndex: 10 }}>
                <Link
                    to="/"
                    style={{
                        padding: '8px 20px',
                        borderRadius: '24px',
                        fontWeight: 700,
                        fontSize: '14.5px',
                        textDecoration: 'none',
                        color: location.pathname === '/' ? 'white' : (isHome && !isScrolled ? 'white' : '#475569'),
                        background: location.pathname === '/' ? '#22c55e' : 'transparent',
                        boxShadow: location.pathname === '/' ? '0 4px 14px rgba(34, 197, 94, 0.4)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    Trang Chủ
                </Link>
                <Link
                    to="/tours"
                    style={{
                        padding: '8px 20px',
                        borderRadius: '24px',
                        fontWeight: 700,
                        fontSize: '14.5px',
                        textDecoration: 'none',
                        color: location.pathname.startsWith('/tours') ? 'white' : (isHome && !isScrolled ? 'white' : '#475569'),
                        background: location.pathname.startsWith('/tours') ? '#22c55e' : 'transparent',
                        boxShadow: location.pathname.startsWith('/tours') ? '0 4px 14px rgba(34, 197, 94, 0.4)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    Tours Du Lịch
                </Link>
                <Link
                    to="/blog"
                    style={{
                        padding: '8px 20px',
                        borderRadius: '24px',
                        fontWeight: 700,
                        fontSize: '14.5px',
                        textDecoration: 'none',
                        color: location.pathname.startsWith('/blog') ? 'white' : (isHome && !isScrolled ? 'white' : '#475569'),
                        background: location.pathname.startsWith('/blog') ? '#22c55e' : 'transparent',
                        boxShadow: location.pathname.startsWith('/blog') ? '0 4px 14px rgba(34, 197, 94, 0.4)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    Cẩm Nang
                </Link>
                <Link
                    to="/contact"
                    style={{
                        padding: '8px 20px',
                        borderRadius: '24px',
                        fontWeight: 700,
                        fontSize: '14.5px',
                        textDecoration: 'none',
                        color: location.pathname === '/contact' ? 'white' : (isHome && !isScrolled ? 'white' : '#475569'),
                        background: location.pathname === '/contact' ? '#22c55e' : 'transparent',
                        boxShadow: location.pathname === '/contact' ? '0 4px 14px rgba(34, 197, 94, 0.4)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    Liên Hệ
                </Link>
            </div>

            {/* BÊN PHẢI CÙNG: KÍNH LÚP, GIỎ HÀNG & USER DROPDOWN */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                {/* 1. Kính lúp (Click to open / Click outside to close) */}
                <div ref={searchRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        style={{
                            background: showSearch ? 'rgba(0, 0, 0, 0.1)' : (isHome && !isScrolled ? 'rgba(255,255,255,0.15)' : 'rgba(0, 0, 0, 0.05)'),
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            color: isHome && !isScrolled ? 'white' : '#0f172a',
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '17px',
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(8px)'
                        }}
                        title="Tìm kiếm"
                    >
                        🔍
                    </button>
                    {showSearch && (
                        <form
                            onSubmit={handleSearchSubmit}
                            style={{
                                position: 'absolute',
                                top: '130%',
                                right: 0,
                                display: 'flex',
                                alignItems: 'center',
                                background: 'white',
                                borderRadius: '30px',
                                padding: '4px 6px 4px 16px',
                                boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
                                border: '1px solid #e2e8f0',
                                width: '280px',
                                zIndex: 99999
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Bạn muốn đi đâu?..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                autoFocus
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '14px',
                                    color: '#1e293b',
                                    flex: 1,
                                    background: 'transparent',
                                    fontWeight: 600
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleVoiceSearch}
                                style={{
                                    background: isListening ? '#ffe4e6' : 'transparent',
                                    border: 'none',
                                    color: isListening ? '#e11d48' : '#64748b',
                                    padding: '6px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    fontSize: '15px'
                                }}
                                title="Nói từ khóa tìm kiếm"
                            >
                                {isListening ? '🔴' : '🎙️'}
                            </button>
                            <button
                                type="submit"
                                style={{
                                    background: 'linear-gradient(135deg, #ffb703, #f97316)',
                                    border: 'none',
                                    color: 'white',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    marginLeft: '4px'
                                }}
                                title="Tìm"
                            >
                                🔍
                            </button>
                        </form>
                    )}
                </div>

                {/* 2. Giỏ Hàng (Cart Icon & Badge) */}
                <Link
                    to="/cart"
                    style={{
                        position: 'relative',
                        background: location.pathname === '/cart' ? '#22c55e' : (isHome && !isScrolled ? 'rgba(255,255,255,0.15)' : 'rgba(0, 0, 0, 0.05)'),
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        color: location.pathname === '/cart' ? 'white' : (isHome && !isScrolled ? 'white' : '#0f172a'),
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        textDecoration: 'none',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.2s',
                        boxShadow: location.pathname === '/cart' ? '0 4px 14px rgba(34, 197, 94, 0.4)' : 'none'
                    }}
                    title="Giỏ hàng của bạn"
                >
                    🛒
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            background: '#f43f5e',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 900,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(244, 63, 94, 0.5)'
                        }}>
                            {cartCount}
                        </span>
                    )}
                </Link>



                {/* 4. TÀI KHOẢN / AVATAR DROPDOWN MENU */}
                {user ? (
                    <div ref={userMenuRef} style={{ position: 'relative' }}>
                        <div
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '42px',
                                height: '42px',
                                background: showUserMenu ? 'rgba(0,0,0,0.1)' : (isHome && !isScrolled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)'),
                                borderRadius: '50%',
                                border: '1px solid rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                userSelect: 'none'
                            }}
                            title={user.name}
                        >
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '50%', background: isHome && !isScrolled ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', color: isHome && !isScrolled ? 'white' : '#0f172a', fontWeight: 800, fontSize: '14px' }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Dropdown Menu thả xuống (Cài đặt, Giỏ hàng, Lịch sử tour, Đăng xuất) */}
                        {showUserMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '130%',
                                right: 0,
                                width: '230px',
                                background: 'white',
                                borderRadius: '18px',
                                boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
                                border: '1px solid #e2e8f0',
                                padding: '8px',
                                zIndex: 99999,
                                color: '#1e293b'
                            }}>
                                <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '6px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{user.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                </div>

                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin/dashboard"
                                        onClick={() => setShowUserMenu(false)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: '#0a66c2', textDecoration: 'none', fontSize: '13.5px', fontWeight: 800 }}
                                    >
                                        <span>👑</span>
                                        <span>Trang Quản Trị (Admin)</span>
                                    </Link>
                                )}

                                <Link
                                    to="/profile"
                                    onClick={() => setShowUserMenu(false)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: '#334155', textDecoration: 'none', fontSize: '13.5px', fontWeight: 700 }}
                                >
                                    <span>⚙️</span>
                                    <span>Cài đặt</span>
                                </Link>

                                <Link
                                    to="/cart"
                                    onClick={() => setShowUserMenu(false)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '12px', color: '#334155', textDecoration: 'none', fontSize: '13.5px', fontWeight: 700 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span>🛒</span>
                                        <span>Giỏ hàng</span>
                                    </div>
                                    {cartCount > 0 && (
                                        <span style={{ background: '#f43f5e', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 900 }}>
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    to="/my-bookings"
                                    onClick={() => setShowUserMenu(false)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: '#334155', textDecoration: 'none', fontSize: '13.5px', fontWeight: 700 }}
                                >
                                    <span>📜</span>
                                    <span>Lịch sử tour</span>
                                </Link>

                                <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 0' }} />

                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        onLogout();
                                    }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 12px',
                                        borderRadius: '12px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#e11d48',
                                        fontSize: '13.5px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span>🚪</span>
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Link
                            to="/login"
                            style={{
                                color: isHome && !isScrolled ? 'white' : '#0f172a',
                                fontWeight: 700,
                                fontSize: '14px',
                                textDecoration: 'none',
                                padding: '6px 14px'
                            }}
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            style={{
                                background: '#00d4bd',
                                color: 'white',
                                padding: '8px 18px',
                                borderRadius: '20px',
                                fontWeight: 800,
                                fontSize: '14px',
                                textDecoration: 'none',
                                boxShadow: '0 4px 12px rgba(0, 212, 189, 0.4)'
                            }}
                        >
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default function ClientLayout({ user, onLogout }) {
    const location = useLocation();
    const isHome = location.pathname === '/';

    // Điều hướng Admin nếu cố tình vào client mà là admin
    if (user && user.role === 'admin' && location.pathname === '/') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <div className="client-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation user={user} onLogout={onLogout} />

            <main style={{ flex: 1, paddingTop: isHome ? 0 : '100px' }}>
                <Outlet />
            </main>

            {/* FOOTER TOÀN DIỆN */}
            <footer style={{ background: '#0f172a', color: 'white', padding: '60px 5% 30px', marginTop: '60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '50px' }}>

                    {/* Cột 1: Thông tin thương hiệu */}
                    <div>
                        <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #ffb703, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                                ✈️
                            </div>
                            <span style={{ fontSize: '22px', fontWeight: 900 }}>
                                Sky<span style={{ color: '#00d4bd' }}>Travel</span>
                            </span>
                        </Link>
                        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                            Hệ thống đặt tour du lịch cao cấp hàng đầu Việt Nam. Khám phá vẻ đẹp 3 Miền Bắc - Trung - Nam với trải nghiệm trọn gói 5 sao.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none' }}>🌐</a>
                            <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none' }}>📘</a>
                            <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none' }}>📸</a>
                        </div>
                    </div>

                    {/* Cột 2: Đường link nhanh */}
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: '#f8fafc' }}>Khám Phá Nhanh</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                            <li><Link to="/tours?region=Miền Bắc" style={{ color: '#94a3b8', textDecoration: 'none' }}>🌸 Tour Miền Bắc</Link></li>
                            <li><Link to="/tours?region=Miền Trung" style={{ color: '#94a3b8', textDecoration: 'none' }}>🌊 Tour Miền Trung</Link></li>
                            <li><Link to="/tours?region=Miền Nam" style={{ color: '#94a3b8', textDecoration: 'none' }}>☀️ Tour Miền Nam</Link></li>
                            <li><Link to="/cart" style={{ color: '#94a3b8', textDecoration: 'none' }}>🛒 Giỏ hàng của tôi</Link></li>
                            <li><Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none' }}>📞 Hỗ trợ & Trợ giúp</Link></li>
                        </ul>
                    </div>

                    {/* Cột 3: Bản đồ & Vị trí */}
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: '#f8fafc' }}>Vị Trí Của Chúng Tôi</h4>
                        <div style={{ width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.1104354045543!2d108.2076043148583!3d16.05975808888636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219b4239d8e51%3A0x96e408c6b0419760!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBEdXkgVMOibiAoRFRVKQ!5e0!3m2!1svi!2s!4v1628172911294!5m2!1svi!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Google Maps"
                            ></iframe>
                        </div>
                    </div>

                    {/* Cột 4: Thông tin liên hệ */}
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: '#f8fafc' }}>Liên Hệ Hotline</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>📍</span>
                                <span>456 Đường Lê Lợi, TP. Đà Nẵng</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>☎️</span>
                                <span style={{ color: '#00d4bd', fontWeight: 800, fontSize: '16px' }}>1900 8888 (24/7)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>✉️</span>
                                <span>booking@skytravel.vn</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Dòng bản quyền dưới cùng */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                    <div>© 2026 SkyTravel Booking Platform. All rights reserved.</div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <span>Điều khoản sử dụng</span>
                        <span>Quyền riêng tư</span>
                        <span>Bảo mật thanh toán</span>
                    </div>
                </div>
            </footer>

            <ChatWidget />
        </div>
    );
}
