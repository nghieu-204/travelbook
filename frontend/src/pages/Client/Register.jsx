import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                name: name,
                email: email,
                password: password
            });

            setMessage({ text: response.data.message || '🎉 Đăng ký tài khoản thành công!', type: 'success' });
            setName('');
            setEmail('');
            setPassword('');
            setLoading(false);

            // Chuyển sang trang đăng nhập sau 1.5 giây
            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (error) {
            setLoading(false);
            if (error.response && error.response.data) {
                setMessage({ text: error.response.data.message || '❌ Đăng ký thất bại.', type: 'error' });
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
                <div style={{ width: '64px', height: '64px', background: '#ecfdf5', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px' }}>
                    🌟
                </div>

                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                    Tạo Tài Khoản Mới
                </h2>
                <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '30px' }}>
                    Trở thành thành viên VIP của SkyTravel để nhận vô vàn ưu đãi hấp dẫn
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

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
                    <div className="form-group">
                        <label>👤 Họ và Tên</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nguyễn Văn A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                        <label>🔒 Mật Khẩu</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Tối thiểu 6 ký tự"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-gold" 
                        style={{ width: '100%', height: '50px', fontSize: '16px', marginTop: '10px' }}
                        disabled={loading}
                    >
                        {loading ? '⏳ Đang Tạo Tài Khoản...' : '🎉 Đăng Ký Thành Viên'}
                    </button>
                </form>

                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '28px', paddingTop: '22px', fontSize: '15px', color: '#64748b' }}>
                    Bạn đã có tài khoản rồi?{' '}
                    <Link to="/login" style={{ color: '#0a66c2', fontWeight: 700 }}>
                        Đăng Nhập Ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}