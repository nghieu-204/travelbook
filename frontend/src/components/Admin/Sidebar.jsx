import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ user, onLogout }) {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <aside style={{
            width: '260px',
            background: '#0f172a',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            height: '100vh',
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            zIndex: 100
        }}>
            {/* Logo Admin */}
            <div style={{
                padding: '24px 20px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0a66c2, #00d4bd)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    boxShadow: '0 4px 12px rgba(0, 212, 189, 0.3)'
                }}>
                    ✈️
                </div>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>SkyTravel</h2>
                    <span style={{ fontSize: '11px', color: '#00d4bd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Portal</span>
                </div>
            </div>

            {/* Admin Info */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: 'rgba(255,255,255,0.02)'
            }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#1e293b',
                    border: '2px solid #00d4bd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold'
                }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>{user?.name || 'Admin SkyTravel'}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Quản Trị Viên VIP</div>
                </div>
            </div>

            {/* Navigation Links */}
            <div style={{ padding: '20px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 10px', marginBottom: '4px' }}>
                    TỔNG QUAN
                </div>
                <Link
                    to="/admin"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: currentPath === '/admin' || currentPath === '/admin/dashboard' ? 'white' : '#94a3b8',
                        background: currentPath === '/admin' || currentPath === '/admin/dashboard' ? 'linear-gradient(135deg, #0a66c2, #00d4bd)' : 'transparent',
                        fontWeight: currentPath === '/admin' || currentPath === '/admin/dashboard' ? 800 : 600,
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <span>📊</span> Dashboard Thống Kê
                </Link>

                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 10px', margin: '14px 0 4px' }}>
                    QUẢN LÝ NGHIỆP VỤ
                </div>
                <Link
                    to="/admin/tours"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: currentPath.includes('/admin/tours') ? 'white' : '#94a3b8',
                        background: currentPath.includes('/admin/tours') ? 'linear-gradient(135deg, #0a66c2, #00d4bd)' : 'transparent',
                        fontWeight: currentPath.includes('/admin/tours') ? 800 : 600,
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <span>🏖️</span> Quản Lý Tours
                </Link>

                <Link
                    to="/admin/bookings"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: currentPath.includes('/admin/bookings') ? 'white' : '#94a3b8',
                        background: currentPath.includes('/admin/bookings') ? 'linear-gradient(135deg, #0a66c2, #00d4bd)' : 'transparent',
                        fontWeight: currentPath.includes('/admin/bookings') ? 800 : 600,
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <span>📋</span> Quản Lý Booking
                </Link>

                <Link
                    to="/admin/contacts"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: currentPath.includes('/admin/contacts') ? 'white' : '#94a3b8',
                        background: currentPath.includes('/admin/contacts') ? 'linear-gradient(135deg, #0a66c2, #00d4bd)' : 'transparent',
                        fontWeight: currentPath.includes('/admin/contacts') ? 800 : 600,
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <span>💬</span> Quản Lý Liên Hệ
                </Link>

                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 10px', margin: '14px 0 4px' }}>
                    HỆ THỐNG & TÀI KHOẢN
                </div>
                <Link
                    to="/admin/users"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: currentPath.includes('/admin/users') ? 'white' : '#94a3b8',
                        background: currentPath.includes('/admin/users') ? 'linear-gradient(135deg, #0a66c2, #00d4bd)' : 'transparent',
                        fontWeight: currentPath.includes('/admin/users') ? 800 : 600,
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <span>👥</span> Quản Lý Người Dùng
                </Link>

                <Link
                    to="/admin/profile"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: currentPath.includes('/admin/profile') ? 'white' : '#94a3b8',
                        background: currentPath.includes('/admin/profile') ? 'linear-gradient(135deg, #0a66c2, #00d4bd)' : 'transparent',
                        fontWeight: currentPath.includes('/admin/profile') ? 800 : 600,
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <span>⚙️</span> Quản Lý Tài Khoản
                </Link>
            </div>

            {/* Footer Action Links */}
            <div style={{ padding: '20px 14px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                    onClick={onLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '14px 18px',
                        borderRadius: '14px',
                        color: 'white',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 800,
                        boxShadow: '0 6px 16px rgba(239, 68, 68, 0.35)',
                        transition: 'all 0.2s'
                    }}
                    title="Đăng xuất khỏi hệ thống Quản Trị"
                >
                    <span style={{ fontSize: '18px' }}>🚪</span>
                    <span>Đăng Xuất Admin</span>
                </button>
            </div>
        </aside>
    );
}
