import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({ text: '', type: '' });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users', getAuthHeaders());
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách người dùng:", error);
            showNotification("❌ Không thể tải danh sách người dùng", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showNotification = (text, type = 'success') => {
        setNotification({ text, type });
        setTimeout(() => setNotification({ text: '', type: '' }), 4000);
    };

    // Khóa hoặc mở khóa tài khoản
    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Đã khóa' ? 'Hoạt động' : 'Đã khóa';
        try {
            const res = await axios.put(
                `http://localhost:5000/api/admin/users/${userId}/status`,
                { status: newStatus },
                getAuthHeaders()
            );
            showNotification(res.data.message, "success");
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            showNotification("❌ Lỗi khi cập nhật trạng thái", "error");
        }
    };

    // Kích hoạt thủ công
    const handleActivate = async (userId) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/admin/users/${userId}/activate`, {}, getAuthHeaders());
            showNotification(res.data.message, "success");
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: 1, status: 'Hoạt động' } : u));
        } catch (error) {
            console.error("Lỗi kích hoạt:", error);
            showNotification("❌ Lỗi kích hoạt tài khoản", "error");
        }
    };

    // Xóa tài khoản
    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`⚠️ Bạn có chắc chắn muốn xóa tài khoản "${userName}" khỏi hệ thống? Hành động này không thể hoàn tác!`)) {
            return;
        }
        try {
            const res = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, getAuthHeaders());
            showNotification(res.data.message, "success");
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Lỗi xóa người dùng:", error);
            showNotification("❌ Lỗi khi xóa tài khoản", "error");
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
    );

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                        👥 Quản Lý Người Dùng & Thành Viên (Users Management)
                    </h1>
                    <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
                        Hiển thị danh sách toàn bộ người dùng, khóa/chặn tài khoản, xóa hoặc kích hoạt thủ công cho khách hàng.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <input
                            type="text"
                            placeholder="🔍 Tìm kiếm tên, email, số điện thoại..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 18px',
                                borderRadius: '14px',
                                border: '1px solid #cbd5e1',
                                fontSize: '14px',
                                fontWeight: 600,
                                outline: 'none',
                                background: 'white'
                            }}
                        />
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '12px 18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        🔄 Làm mới
                    </button>
                </div>
            </div>

            {/* Notification Bar */}
            {notification.text && (
                <div style={{
                    padding: '14px 20px',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: 700,
                    marginBottom: '24px',
                    background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: notification.type === 'success' ? '#059669' : '#dc2626',
                    border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>{notification.type === 'success' ? '✅' : '❌'}</span>
                    <span>{notification.text}</span>
                </div>
            )}

            {/* Bảng Người dùng */}
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', fontSize: '16px', fontWeight: 700, color: '#64748b' }}>
                        ⏳ Đang tải danh sách người dùng SkyTravel...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', fontSize: '16px', fontWeight: 700, color: '#64748b' }}>
                        ❌ Không tìm thấy người dùng nào phù hợp
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '16px 20px', fontWeight: 800 }}>Thành Viên</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 800 }}>Email & Số Điện Thoại</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 800 }}>Vai Trò (Role)</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 800 }}>Trạng Thái Tài Khoản</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 800 }}>Kích Hoạt Email</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 800, textAlign: 'right' }}>Thao Tác Quản Trị</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => {
                                    const isAdmin = u.role === 'admin';
                                    const isBlocked = u.status === 'Đã khóa';
                                    const isActive = Boolean(u.is_active || u.status === 'Hoạt động');

                                    return (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        borderRadius: '50%',
                                                        overflow: 'hidden',
                                                        border: `2px solid ${isAdmin ? '#ffb703' : '#00d4bd'}`,
                                                        background: '#f1f5f9',
                                                        flexShrink: 0
                                                    }}>
                                                        <img
                                                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                                                            alt={u.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '15px' }}>{u.name}</div>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>ID: #{u.id} • {u.address || 'Chưa cập nhật địa chỉ'}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ fontWeight: 700, color: '#334155' }}>📧 {u.email}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>📞 {u.phone || 'Chưa có SĐT'}</div>
                                            </td>

                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 800,
                                                    background: isAdmin ? 'rgba(255, 183, 3, 0.15)' : 'rgba(10, 102, 194, 0.1)',
                                                    color: isAdmin ? '#d97706' : '#0a66c2',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <span>{isAdmin ? '👑' : '👤'}</span>
                                                    <span>{isAdmin ? 'Quản Trị Viên (Admin)' : 'Khách Hàng (User)'}</span>
                                                </span>
                                            </td>

                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 800,
                                                    background: isBlocked ? '#fef2f2' : '#ecfdf5',
                                                    color: isBlocked ? '#dc2626' : '#059669',
                                                    border: `1px solid ${isBlocked ? '#fecaca' : '#a7f3d0'}`
                                                }}>
                                                    {isBlocked ? '🔒 Đã khóa tài khoản' : '✅ Hoạt động tốt'}
                                                </span>
                                            </td>

                                            <td style={{ padding: '16px 20px' }}>
                                                {isActive ? (
                                                    <span style={{ color: '#059669', fontWeight: 800, fontSize: '13px' }}>
                                                        ⚡ Đã kích hoạt
                                                    </span>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ color: '#d97706', fontWeight: 700, fontSize: '12px' }}>Chưa kích hoạt</span>
                                                        <button
                                                            onClick={() => handleActivate(u.id)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontSize: '11px',
                                                                fontWeight: 800,
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                                                            }}
                                                            title="Kích hoạt tài khoản thủ công cho khách hàng"
                                                        >
                                                            ⚡ Kích hoạt ngay
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                {isAdmin ? (
                                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Tài khoản Admin (Được bảo vệ)</span>
                                                ) : (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                        <button
                                                            onClick={() => toggleStatus(u.id, u.status)}
                                                            style={{
                                                                padding: '8px 14px',
                                                                borderRadius: '10px',
                                                                background: isBlocked ? '#0a66c2' : '#fff7ed',
                                                                color: isBlocked ? 'white' : '#c2410c',
                                                                border: `1px solid ${isBlocked ? '#0a66c2' : '#fed7aa'}`,
                                                                fontSize: '12px',
                                                                fontWeight: 800,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            title={isBlocked ? "Mở khóa tài khoản" : "Khóa / Chặn tài khoản người dùng"}
                                                        >
                                                            {isBlocked ? '🔓 Mở Khóa' : '🔒 Khóa / Chặn'}
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(u.id, u.name)}
                                                            style={{
                                                                padding: '8px 14px',
                                                                borderRadius: '10px',
                                                                background: '#fef2f2',
                                                                color: '#dc2626',
                                                                border: '1px solid #fecaca',
                                                                fontSize: '12px',
                                                                fontWeight: 800,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            title="Xóa tài khoản khỏi hệ thống"
                                                        >
                                                            🗑️ Xóa
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
