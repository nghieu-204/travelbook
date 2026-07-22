import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, Navigate } from 'react-router-dom';

export default function Login({ setUser, user }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Nếu đã đăng nhập là Admin thì tự động vào luôn trang quản trị
    if (user && user.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email: email,
                password: password
            });

            setMessage({ text: response.data.message || '🎉 Đăng nhập thành công!', type: 'success' });

            // Lưu token và thông tin user vào localStorage
            localStorage.setItem('token', response.data.token);
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (setUser) {
                    setUser(response.data.user);
                }
            }

            setLoading(false);

            // Nếu là Quản trị viên (Admin): Chuyển thẳng ngay lập tức vào Trang Quản trị (/admin) bằng window.location.href, tuyệt đối không thông qua giao diện người dùng
            if (response.data.user && response.data.user.role === 'admin') {
                window.location.href = '/admin';
                return;
            } else {
                navigate('/');
            }

        } catch (error) {
            setLoading(false);
            if (error.response && error.response.data) {
                setMessage({ text: error.response.data.message || '❌ Đăng nhập thất bại.', type: 'error' });
            } else {
                setMessage({ text: '❌ Lỗi kết nối đến server. Vui lòng kiểm tra lại!', type: 'error' });
            }
        }
    };

    return (
        <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div style={{ 
                background: 'white', 
                padding: '45px 40px', 
                borderRadius: '28px', 
                boxShadow: '0 20px 45px rgba(0,0,0,0.08)', 
                border: '1px solid #e2e8f0',
                width: '100%',
                maxWidth: '440px',
                textAlign: 'center'
            }}>
                <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px' }}>
                    ✈️
                </div>

                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                    Chào Mừng Trở Lại
                </h2>
                <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '30px' }}>
                    Đăng nhập vào tài khoản SkyTravel để khám phá những chuyến đi tuyệt vời
                </p>

                {message.text && (
                    <div style={{ 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        fontSize: '14px', 
                        fontWeight: 600,
                        marginBottom: '20px',
                        background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        color: message.type === 'success' ? '#059669' : '#dc2626',
                        border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
                    <div className="form-group">
                        <label>📧 Địa Chỉ Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="nhapemail@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label>🔒 Mật Khẩu</label>
                            <a href="#forgot" style={{ fontSize: '13px', color: '#0a66c2', textDecoration: 'none' }}>Quên mật khẩu?</a>
                        </div>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', height: '50px', fontSize: '16px', marginTop: '10px' }}
                        disabled={loading}
                    >
                        {loading ? '⏳ Đang Đăng Nhập...' : '🚀 Đăng Nhập Ngay'}
                    </button>
                </form>

                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '28px', paddingTop: '22px', fontSize: '15px', color: '#64748b' }}>
                    Bạn chưa có tài khoản?{' '}
                    <Link to="/register" style={{ color: '#0a66c2', fontWeight: 700 }}>
                        Đăng Ký Ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}