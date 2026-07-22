import { useState } from 'react';
import axios from 'axios';

export default function Contact() {
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: '',
        user_phone: '',
        contact_date: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ text: '', type: '' });
        try {
            const res = await axios.post('http://localhost:5000/api/contacts', formData);
            setStatus({ text: 'Gửi yêu cầu thành công, quản trị viên sẽ liên hệ với bạn qua email', type: 'success' });
            setFormData({ user_name: '', user_email: '', user_phone: '', contact_date: '', subject: '', message: '' });
        } catch (error) {
            setStatus({ text: '❌ Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại!', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '85vh', padding: '60px 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 50px' }}>
                    <div style={{ display: 'inline-block', padding: '6px 16px', background: '#ecfdf5', color: '#059669', borderRadius: '100px', fontSize: '13px', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase' }}>
                        💬 Chăm Sóc Khách Hàng 24/7
                    </div>
                    <h1 style={{ fontSize: '38px', fontWeight: 900, color: '#1e293b', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
                        Chúng Tôi Luôn Sẵn Sàng Lắng Nghe
                    </h1>
                    <p style={{ fontSize: '17px', color: '#64748b', lineHeight: 1.6 }}>
                        Bạn có thắc mắc về lịch trình tour, chính sách giá trẻ em hay yêu cầu thiết kế tour riêng cho doanh nghiệp? Hãy gửi thông tin ngay cho Travel N!
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px', alignItems: 'start' }}>
                    {/* Contact Info Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #0a66c2, #00d4bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: 'white', flexShrink: 0 }}>
                                📞
                            </div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>Hotline Tư Vấn Nhanh</h3>
                                <p style={{ fontSize: '22px', fontWeight: 900, color: '#0a66c2', margin: 0 }}>1900 8888 <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>(Miễn cước)</span></p>
                            </div>
                        </div>

                        <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #00d4bd, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: 'white', flexShrink: 0 }}>
                                📧
                            </div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>Email Liên Hệ</h3>
                                <p style={{ fontSize: '18px', fontWeight: 800, color: '#00d4bd', margin: 0 }}>support@traveln.vn</p>
                            </div>
                        </div>

                        <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #ffb703, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: 'white', flexShrink: 0 }}>
                                🏢
                            </div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>Trụ Sở Travel N</h3>
                                <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>255-257 Hùng Vương, Vĩnh Trung, Thanh Khê, Đà Nẵng</p>
                            </div>
                        </div>

                        <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.829986348421!2d108.21206161479867!3d16.07166018887965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142183141f177fb%3A0x6b4859a72ccbf513!2s255%20H%C3%B9ng%20V%C6%B0%C6%A1ng%2C%20V%C4%A9nh%20Trung%2C%20Thanh%20Kh%C3%AA%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng%20550000%2C%20Vietnam!5e0!3m2!1sen!2s!4v1684307525381!5m2!1sen!2s" 
                                width="100%" 
                                height="250" 
                                style={{ border: 0, display: 'block' }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>

                    {/* Contact Form Box */}
                    <div style={{ background: 'white', padding: '38px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: '0 0 24px' }}>
                            ✍️ Gửi Yêu Cầu Liên Hệ
                        </h2>

                        {status.text && (
                            <div style={{
                                padding: '16px',
                                borderRadius: '14px',
                                marginBottom: '20px',
                                fontWeight: 600,
                                fontSize: '14px',
                                background: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                color: status.type === 'success' ? '#059669' : '#dc2626',
                                border: `1px solid ${status.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                            }}>
                                {status.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-group">
                                <label>Họ và tên của bạn</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập họ và tên..."
                                    value={formData.user_name}
                                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="example@gmail.com"
                                    value={formData.user_email}
                                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder="Nhập số điện thoại..."
                                        value={formData.user_phone}
                                        onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ngày liên hệ</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.contact_date}
                                        onChange={(e) => setFormData({ ...formData, contact_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Chủ đề cần tư vấn</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="VD: Tư vấn tour Phú Quốc cho gia đình 5 người"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Nội dung chi tiết</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Vui lòng cho biết thêm chi tiết về ngày khởi hành dự kiến, số lượng thành viên..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{
                                    padding: '16px',
                                    fontSize: '16px',
                                    fontWeight: 800,
                                    borderRadius: '16px',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? '⏳ Đang Gửi Yêu Cầu...' : '🚀 Gửi Thông Tin Cho Travel N'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
