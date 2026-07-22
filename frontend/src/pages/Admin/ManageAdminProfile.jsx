import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageAdminProfile({ user, setUser }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        new_password: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                new_password: ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ text: res.data.message || '🎉 Cập nhật hồ sơ Quản trị viên thành công!', type: 'success' });
            
            if (res.data.user) {
                const updatedUser = res.data.user;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                if (setUser) setUser(updatedUser);
            }
            setFormData(prev => ({ ...prev, new_password: '' }));
        } catch (error) {
            console.error("Lỗi cập nhật profile admin:", error);
            setMessage({ 
                text: error.response?.data?.message || '❌ Lỗi cập nhật thông tin. Vui lòng kiểm tra lại!', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                    ⚙️ Quản Lý Tài Khoản Quản Trị Viên (Admin Profile)
                </h1>
                <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
                    Thay đổi thông tin cá nhân, cập nhật ảnh đại diện, địa chỉ, số điện thoại và mật khẩu bảo mật hệ thống.
                </p>
            </div>

            {message.text && (
                <div style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    fontSize: '15px',
                    fontWeight: 600,
                    marginBottom: '24px',
                    background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: message.type === 'success' ? '#059669' : '#dc2626',
                    border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>{message.type === 'success' ? '✅' : '❌'}</span>
                    <span>{message.text}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
                {/* Cột trái: Thẻ Avatar Preview */}
                <div style={{
                    background: 'white',
                    padding: '30px 24px',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        margin: '0 auto 20px',
                        border: '4px solid #00d4bd',
                        boxShadow: '0 12px 24px rgba(0, 212, 189, 0.25)',
                        position: 'relative'
                    }}>
                        <img
                            src={formData.avatar}
                            alt="Admin Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'; }}
                        />
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
                        {formData.name || 'Quản Trị Viên VIP'}
                    </h3>
                    <span style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #0a66c2, #00d4bd)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '16px'
                    }}>
                        👑 System Admin
                    </span>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                        Quyền hạn tối cao: Duyệt đơn tour, xuất báo cáo tài chính, quản lý người dùng và phản hồi hỗ trợ khách hàng.
                    </p>
                </div>

                {/* Cột phải: Form Chỉnh sửa thông tin */}
                <div style={{
                    background: 'white',
                    padding: '36px 32px',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '0 0 24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                        📝 Cập Nhật Thông Tin Cá Nhân
                    </h3>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                                    👤 Tên Hiển Thị (Họ & Tên)
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#1e293b'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                                    📧 Địa Chỉ Email Đăng Nhập
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#1e293b'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                                    📞 Số Điện Thoại Liên Hệ
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Ví dụ: 0988888888"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#1e293b'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                                    🔒 Mật Khẩu Mới (Nếu muốn đổi)
                                </label>
                                <input
                                    type="password"
                                    name="new_password"
                                    placeholder="Bỏ trống nếu giữ mật khẩu hiện tại"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#1e293b'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                                🏠 Địa Chỉ Trụ Sở / Văn Phòng
                            </label>
                            <input
                                type="text"
                                name="address"
                                placeholder="Ví dụ: Tòa nhà SkyTravel, Quận 1, TP. HCM"
                                value={formData.address}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#1e293b'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                                🖼️ URL Ảnh Đại Diện (Avatar URL)
                            </label>
                            <input
                                type="url"
                                name="avatar"
                                placeholder="https://images.unsplash.com/..."
                                value={formData.avatar}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#1e293b'
                                }}
                            />
                        </div>

                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '14px 32px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #0a66c2, #00d4bd)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '15px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 8px 20px rgba(10, 102, 194, 0.25)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <span>{loading ? '⏳' : '💾'}</span>
                                <span>{loading ? 'Đang cập nhật...' : 'Lưu & Cập Nhật Hồ Sơ'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
