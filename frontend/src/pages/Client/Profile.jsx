import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Profile({ user, setUser }) {
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    if (!user) {
        return (
            <div className="section" style={{ paddingTop: '80px', paddingBottom: '100px', textAlign: 'center' }}>
                <h2>Vui lòng đăng nhập để truy cập Cài Đặt Tài Khoản!</h2>
                <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Đăng nhập ngay</Link>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (newPassword && newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không trùng khớp!");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const res = await axios.put('http://localhost:5000/api/users/profile', {
                name,
                phone,
                address,
                avatar,
                new_password: newPassword || undefined
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const updatedUser = res.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (setUser) setUser(updatedUser);

            setMessage("🎉 Cài đặt thông tin tài khoản thành công!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("Lỗi cập nhật profile:", err);
            setError(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
            <div style={{ maxWidth: '750px', margin: '0 auto', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 35px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                {/* Header banner */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '36px 30px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        {avatar ? (
                            <img src={avatar} alt={user.name} style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} />
                        ) : (
                            <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'linear-gradient(135deg, #0a66c2, #00d4bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 900, color: 'white', border: '4px solid rgba(255,255,255,0.2)' }}>
                                {user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                            {user.role === 'admin' ? '👑 Quản Trị Viên' : '⭐ Khách Hàng Thân Thiết'}
                        </span>
                        <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0 4px' }}>{user.name}</h1>
                        <div style={{ color: '#94a3b8', fontSize: '14px' }}>📧 {user.email}</div>
                    </div>
                </div>

                {/* Form chỉnh sửa profile */}
                <form onSubmit={handleSubmit} style={{ padding: '36px 30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        ⚙️ Cài Đặt Thông Tin Cá Nhân
                    </h3>

                    {message && (
                        <div style={{ background: '#ecfdf5', color: '#065f46', padding: '14px 18px', borderRadius: '14px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                            {message}
                        </div>
                    )}
                    {error && (
                        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '14px 18px', borderRadius: '14px', fontWeight: 700, border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                👤 Họ và tên hiển thị (*)
                            </label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 600, outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                📧 Địa chỉ Email (Không đổi)
                            </label>
                            <input 
                                type="email" 
                                value={user.email} 
                                disabled 
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', fontWeight: 600, color: '#64748b' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                📞 Số điện thoại
                            </label>
                            <input 
                                type="text" 
                                placeholder="Nhập số điện thoại liên hệ..." 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 600, outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                🖼️ Link ảnh đại diện (URL)
                            </label>
                            <input 
                                type="text" 
                                placeholder="https://images.unsplash.com/..." 
                                value={avatar} 
                                onChange={(e) => setAvatar(e.target.value)} 
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 600, outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                            📍 Địa chỉ thường trú
                        </label>
                        <input 
                            type="text" 
                            placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố..." 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 600, outline: 'none' }}
                        />
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '14px 0 0', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        🔒 Đổi Mật Khẩu (Bỏ trống nếu không đổi)
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                Mật khẩu mới
                            </label>
                            <input 
                                type="password" 
                                placeholder="Nhập mật khẩu mới..." 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 600, outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                Xác nhận mật khẩu mới
                            </label>
                            <input 
                                type="password" 
                                placeholder="Nhập lại mật khẩu mới..." 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 600, outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '16px' }}>
                        <Link to="/" className="btn btn-outline" style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: 800 }}>
                            Quay lại
                        </Link>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary" 
                            style={{ padding: '12px 32px', borderRadius: '14px', fontWeight: 900 }}
                        >
                            {loading ? '⏳ Đang lưu thay đổi...' : '💾 Lưu Cài Đặt Tài Khoản'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
