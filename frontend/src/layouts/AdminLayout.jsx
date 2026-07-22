import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Admin/Sidebar';

export default function AdminLayout({ user, onLogout, children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar bên trái */}
            <Sidebar user={user} onLogout={onLogout} />

            {/* Khu vực nội dung bên phải kèm Topbar */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Topbar */}
                <header style={{
                    height: '70px',
                    background: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 90,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
                            Trang Quản Trị Hệ Thống SkyTravel
                        </span>
                        <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 700 }}>
                            ● Hệ thống trực tuyến
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{user?.name || 'Admin VIP'}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email || 'admin@skytravel.vn'}</div>
                            </div>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #0a66c2, #00d4bd)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '18px',
                                boxShadow: '0 4px 12px rgba(10, 102, 194, 0.2)'
                            }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                        </div>

                        {/* Nút Đăng Xuất Topbar */}
                        <button
                            onClick={onLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 18px',
                                borderRadius: '12px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                fontWeight: 800,
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)'
                            }}
                            title="Đăng xuất khỏi hệ thống Quản Trị"
                        >
                            <span>🚪</span>
                            <span>Đăng Xuất</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
}
