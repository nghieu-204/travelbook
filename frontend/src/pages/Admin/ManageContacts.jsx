import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageContacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [replyingContact, setReplyingContact] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    // Toast state
    const [showToast, setShowToast] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/contacts', getAuthHeaders());
            setContacts(res.data);
        } catch (error) {
            console.error("Lỗi lấy contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return alert("Vui lòng nhập nội dung phản hồi!");
        if (!replyingContact) return;

        setIsSending(true);
        try {
            await axios.put(`http://localhost:5000/api/contacts/${replyingContact.id}/reply`, { admin_reply: replyText }, getAuthHeaders());
            
            // Show toast
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            
            // Remove from list or update status
            setContacts(contacts.map(c => c.id === replyingContact.id ? { ...c, status: 'Đã phản hồi' } : c));
            
            // Close modal
            setReplyingContact(null);
            setReplyText('');
        } catch (error) {
            console.error("Lỗi gửi phản hồi:", error);
            alert("❌ Lỗi khi gửi phản hồi");
        } finally {
            setIsSending(false);
        }
    };

    const pendingContacts = contacts.filter(c => c.status !== 'Đã phản hồi');

    return (
        <div>
            {/* Toast Notification */}
            {showToast && (
                <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(16,185,129,0.4)', animation: 'fadeInDown 0.3s', zIndex: 1200, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✅ Đã phản hồi qua email thành công
                </div>
            )}

            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1e293b', margin: '0 0 6px' }}>
                    💬 Quản Lý Yêu Cầu Liên Hệ ({pendingContacts.length})
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    Tiếp nhận yêu cầu liên hệ, trả lời thắc mắc và gửi email phản hồi trực tiếp cho khách hàng.
                </p>
            </div>

            {/* Table View */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>NGÀY GỬI</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>HỌ TÊN KHÁCH</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>EMAIL</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>SĐT</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b', width: '30%' }}>NỘI DUNG YÊU CẦU</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b', textAlign: 'right' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 'bold' }}>⏳ Đang tải danh sách liên hệ...</td></tr>
                            ) : pendingContacts.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Không có yêu cầu liên hệ nào chờ xử lý!</td></tr>
                            ) : (
                                pendingContacts.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', fontWeight: 600 }}>
                                            {new Date(c.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1e293b', fontWeight: 700 }}>
                                            {c.user_name}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#0a66c2', fontWeight: 600 }}>
                                            {c.user_email}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', fontWeight: 600 }}>
                                            {c.user_phone || 'Chưa cung cấp'}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#334155' }}>
                                            <div style={{ fontWeight: 800, marginBottom: '4px' }}>{c.subject}</div>
                                            <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.message}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => { setReplyingContact(c); setReplyText(''); }} 
                                                className="btn btn-primary btn-sm" 
                                                style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 800, borderRadius: '8px' }}
                                            >
                                                ✍️ Reply
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reply Modal */}
            {replyingContact && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', position: 'relative', animation: 'fadeIn 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
                                ✉️ Phản hồi Yêu cầu
                            </h2>
                            <button
                                onClick={() => setReplyingContact(null)}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                                Từ: <span style={{ color: '#1e293b' }}>{replyingContact.user_name} ({replyingContact.user_email})</span>
                            </div>
                            <div style={{ fontSize: '14px', color: '#334155', fontStyle: 'italic', lineHeight: 1.6 }}>
                                "{replyingContact.message}"
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '10px', color: '#334155' }}>Nội dung phản hồi (Admin)</label>
                            <textarea
                                className="form-control"
                                rows="5"
                                placeholder="Nhập câu trả lời (VD: Chào bạn, tôi sẽ liên hệ lại ngay...)"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setReplyingContact(null)} 
                                className="btn btn-outline" 
                                style={{ padding: '10px 20px', fontWeight: 700, borderRadius: '10px' }}
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleReplySubmit} 
                                disabled={isSending}
                                className="btn btn-primary" 
                                style={{ padding: '10px 24px', fontWeight: 800, borderRadius: '10px', background: isSending ? '#94a3b8' : '#0a66c2', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {isSending ? (
                                    <>
                                        <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>🚀 Gửi Email</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeInDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
}
