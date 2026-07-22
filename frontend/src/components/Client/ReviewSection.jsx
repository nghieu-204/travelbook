import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReviewSection({ tourId, user, onReviewAdded }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [eligibility, setEligibility] = useState({ canReview: false, reason: 'Đang kiểm tra điều kiện đánh giá...' });
    const [noticeMessage, setNoticeMessage] = useState({ text: '', type: '' });

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reviews/tour/${tourId}`);
            setReviews(res.data || []);
        } catch (error) {
            console.error('Lỗi tải danh sách nhận xét:', error);
        }
    };

    const checkEligibility = async () => {
        if (!user || user.role === 'admin') return;
        try {
            const res = await axios.get(`http://localhost:5000/api/reviews/check-eligibility?tourId=${tourId}&userId=${user.id || ''}&email=${user.email || ''}`);
            setEligibility(res.data || { canReview: false, reason: 'Không đủ điều kiện đánh giá.' });
        } catch (error) {
            console.error('Lỗi kiểm tra quyền đánh giá:', error);
            setEligibility({ canReview: false, reason: 'Không thể kiểm tra điều kiện đánh giá từ máy chủ.' });
        }
    };

    useEffect(() => {
        if (tourId) {
            fetchReviews();
            if (user && user.role !== 'admin') {
                checkEligibility();
            }
        }
    }, [tourId, user]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setNoticeMessage({ text: '', type: '' });
        if (!user || !eligibility.canReview) {
            setNoticeMessage({ text: '⚠️ Vui lòng đặt tour để có thể đánh giá', type: 'warning' });
            alert('Vui lòng đặt tour để có thể đánh giá');
            return;
        }
        if (!comment.trim()) {
            setNoticeMessage({ text: '⚠️ Vui lòng nhập nội dung nhận xét của bạn!', type: 'warning' });
            alert('Vui lòng nhập nội dung nhận xét của bạn!');
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post('http://localhost:5000/api/reviews', {
                tour_id: tourId,
                user_id: user.id,
                user_email: user.email,
                user_name: user.name,
                user_avatar: user.avatar,
                rating,
                comment: comment.trim()
            });

            setComment('');
            setRating(5);
            fetchReviews();
            checkEligibility();
            if (onReviewAdded && res.data.newRating) {
                onReviewAdded(res.data.newRating, res.data.newReviewsCount);
            }
            setNoticeMessage({ text: res.data.message || '🎉 Đánh giá của bạn đã được gửi thành công!', type: 'success' });
            alert(res.data.message || '🎉 Đánh giá của bạn đã được gửi thành công!');
        } catch (error) {
            console.error('Lỗi gửi nhận xét:', error);
            const msg = error.response?.data?.message || '⚠️ Vui lòng đặt tour để có thể đánh giá';
            setNoticeMessage({ text: msg.includes('chưa đặt tour') || msg.includes('Vui lòng đặt tour') ? '⚠️ Vui lòng đặt tour để có thể đánh giá' : `⚠️ ${msg}`, type: 'warning' });
            alert(msg.includes('chưa đặt tour') || msg.includes('Vui lòng đặt tour') ? 'Vui lòng đặt tour để có thể đánh giá' : msg);
        } finally {
            setSubmitting(false);
        }
    };

    const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, cur) => acc + Number(cur.rating), 0) / reviews.length).toFixed(1)
        : '5.0';

    return (
        <section style={{
            margin: '40px 0',
            padding: '36px',
            background: 'white',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
            {/* Title & Summary Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px', marginBottom: '30px' }}>
                <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0a66c2', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ⭐ Đánh Giá Từ Khách Hàng Thực Tế
                    </span>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '4px 0 0' }}>
                        Nhận Xét & Đánh Giá Tour
                    </h2>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: '#f8fafc',
                    padding: '12px 24px',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#f59e0b' }}>
                        {avgRating}
                    </div>
                    <div>
                        <div style={{ color: '#f59e0b', fontSize: '16px', letterSpacing: '2px' }}>
                            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                            Dựa trên {reviews.length} đánh giá
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Form Box */}
            {user && eligibility.canReview ? (
                <div style={{
                    background: '#f8fafc',
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '36px'
                }}>
                    <form onSubmit={handleSubmitReview}>
                        <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                            ✍️ Chia sẻ trải nghiệm của bạn {user ? `(${user.name})` : ''}
                        </h4>

                        {/* Star selection */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Chấm điểm chuyến đi:</span>
                            <div style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{
                                            fontSize: '26px',
                                            color: star <= (hoverRating || rating) ? '#f59e0b' : '#cbd5e1',
                                            transition: 'color 0.15s, transform 0.15s',
                                            transform: star === (hoverRating || rating) ? 'scale(1.2)' : 'scale(1)'
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a66c2' }}>
                                {rating === 5 && 'Tuyệt vời xuất sắc (5 sao)'}
                                {rating === 4 && 'Rất hài lòng (4 sao)'}
                                {rating === 3 && 'Bình thường (3 sao)'}
                                {rating <= 2 && 'Cần cải thiện'}
                            </span>
                        </div>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm thực tế của bạn về lịch trình, chất lượng hướng dẫn viên, khách sạn và ẩm thực..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '14px',
                                border: '1px solid #cbd5e1',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                outline: 'none',
                                resize: 'vertical',
                                marginBottom: '16px',
                                boxSizing: 'border-box'
                            }}
                        />

                        {noticeMessage.text && (
                            <div style={{
                                padding: '12px 18px',
                                borderRadius: '12px',
                                marginBottom: '16px',
                                fontSize: '14px',
                                fontWeight: 700,
                                background: noticeMessage.type === 'success' ? '#ecfdf5' : '#fffbeb',
                                color: noticeMessage.type === 'success' ? '#059669' : '#d97706',
                                border: `1px solid ${noticeMessage.type === 'success' ? '#a7f3d0' : '#fde68a'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span>{noticeMessage.text}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            {(!user || !eligibility.canReview) && (
                                <span style={{ fontSize: '13px', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    🔒 Vui lòng đặt tour để có thể đánh giá
                                </span>
                            )}
                            <div style={{ marginLeft: 'auto' }}>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #0a66c2, #00d4bd)',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: 800,
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(10, 102, 194, 0.25)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {submitting ? '⏳ Đang gửi đánh giá...' : '🚀 Gửi Nhận Xét Của Tôi'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{
                    background: '#f8fafc',
                    padding: '20px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    color: '#64748b',
                    marginBottom: '36px',
                    border: '1px dashed #cbd5e1'
                }}>
                    👑 Quản trị viên chỉ xem nhận xét từ khách hàng, không tham gia chấm điểm tour.
                </div>
            )}

            {/* Review List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        Chưa có nhận xét nào cho tour này. Hãy là người đầu tiên trải nghiệm và để lại đánh giá nhé!
                    </div>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev.id} style={{
                            padding: '20px',
                            borderRadius: '16px',
                            background: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            gap: '16px'
                        }}>
                            <img
                                src={rev.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                                alt={rev.user_name}
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                                        {rev.user_name}
                                    </h4>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <div style={{ color: '#f59e0b', fontSize: '14px', marginBottom: '8px' }}>
                                    {'★'.repeat(Number(rev.rating) || 5)}{'☆'.repeat(5 - (Number(rev.rating) || 5))}
                                </div>
                                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                                    {rev.comment}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
