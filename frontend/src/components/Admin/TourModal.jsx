export default function TourModal({
    showModal,
    setShowModal,
    editingTour,
    formData,
    setFormData,
    itineraryItems,
    setItineraryItems,
    galleryUrls,
    setGalleryUrls,
    handleSaveTour
}) {
    if (!showModal) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '880px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                        {editingTour ? '✏️ Cập Nhật Thông Tin Tour VIP' : '➕ Thêm Tour Mới 5 Sao'}
                    </h3>
                    <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
                </div>

                <form onSubmit={handleSaveTour} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>Tên Tour Du Lịch</label>
                        <input type="text" className="form-control" placeholder="VD: Khám Phá Phú Quốc Grand World 4N3Đ Tiêu Chuẩn 5 Sao..." required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>📍 Địa Điểm Cụ Thể</label>
                        <input type="text" className="form-control" placeholder="Phú Quốc, Đà Nẵng, Hạ Long..." required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>🗺️ Khu Vực (Miền)</label>
                        <select className="form-control" value={formData.region || 'Miền Nam'} onChange={e => setFormData({ ...formData, region: e.target.value })}>
                            <option value="Miền Bắc">🟢 Miền Bắc</option>
                            <option value="Miền Trung">🟡 Miền Trung</option>
                            <option value="Miền Nam">🔵 Miền Nam</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>📅 Ngày Khởi Hành (Departure Date)</label>
                        <input type="date" className="form-control" required value={formData.departure_date || '2026-08-15'} onChange={e => setFormData({ ...formData, departure_date: e.target.value })} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>⏱️ Thời Gian Lịch Trình</label>
                        <input type="text" className="form-control" placeholder="4 Ngày 3 Đêm" required value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>💵 Giá Người Lớn (VNĐ)</label>
                        <input type="number" className="form-control" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>👶 Giá Trẻ Em (VNĐ)</label>
                        <input type="number" className="form-control" required value={formData.child_price} onChange={e => setFormData({ ...formData, child_price: e.target.value })} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>🧑‍🤝‍🧑 Số Chỗ Tối Đa (Available Spots)</label>
                        <input type="number" className="form-control" required value={formData.available_spots} onChange={e => setFormData({ ...formData, available_spots: e.target.value })} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>🏖️ Danh Mục Trải Nghiệm</label>
                        <select className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option value="Biển đảo">🏖️ Biển đảo</option>
                            <option value="Núi rừng">⛰️ Núi rừng</option>
                            <option value="Nghỉ dưỡng sang trọng">👑 Nghỉ dưỡng sang trọng</option>
                            <option value="Mạo hiểm">🧗 Mạo hiểm</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>🔥 Huy Hiệu Nổi Bật (Badge)</label>
                        <select className="form-control" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })}>
                            <option value="🔥 Hot Nhất">🔥 Hot Nhất</option>
                            <option value="👑 Siêu Sang">👑 Siêu Sang</option>
                            <option value="⚡ Giảm Giá Sốc">⚡ Giảm Giá Sốc</option>
                            <option value="🌟 Ưu Đãi Mùa Hè">🌟 Ưu Đãi Mùa Hè</option>
                            <option value="Mới">✨ Mới</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>🖼️ URL Ảnh Đại Diện Chính</label>
                        <input type="url" className="form-control" placeholder="https://images.unsplash.com/..." required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                    </div>

                    {/* Gallery URL Builder */}
                    <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b', margin: 0 }}>🖼️ Thư Viện Ảnh (Gallery URLs)</label>
                            <button
                                type="button"
                                onClick={() => setGalleryUrls([...galleryUrls, ''])}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 12px', fontSize: '12px' }}
                            >
                                + Thêm link ảnh
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {galleryUrls.map((url, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="url"
                                        className="form-control"
                                        placeholder={`Link ảnh Gallery ${idx + 1}...`}
                                        value={url}
                                        onChange={e => {
                                            const updated = [...galleryUrls];
                                            updated[idx] = e.target.value;
                                            setGalleryUrls(updated);
                                        }}
                                    />
                                    {galleryUrls.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== idx))}
                                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Itinerary Timeline Builder */}
                    <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b', margin: 0 }}>📅 Chi Tiết Lịch Trình Từng Ngày (Timeline Itinerary)</label>
                            <button
                                type="button"
                                onClick={() => setItineraryItems([...itineraryItems, { day: `Ngày ${itineraryItems.length + 1}`, title: '', detail: '' }])}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 12px', fontSize: '12px' }}
                            >
                                + Thêm Ngày
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {itineraryItems.map((item, idx) => (
                                <div key={idx} style={{ background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: '10px', alignItems: 'start' }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ngày 1"
                                        value={item.day}
                                        onChange={e => {
                                            const updated = [...itineraryItems];
                                            updated[idx].day = e.target.value;
                                            setItineraryItems(updated);
                                        }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tiêu đề hoạt động chính..."
                                            value={item.title}
                                            onChange={e => {
                                                const updated = [...itineraryItems];
                                                updated[idx].title = e.target.value;
                                                setItineraryItems(updated);
                                            }}
                                        />
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            placeholder="Mô tả chi tiết lịch trình..."
                                            value={item.detail}
                                            onChange={e => {
                                                const updated = [...itineraryItems];
                                                updated[idx].detail = e.target.value;
                                                setItineraryItems(updated);
                                            }}
                                        />
                                    </div>
                                    {itineraryItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setItineraryItems(itineraryItems.filter((_, i) => i !== idx))}
                                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#334155' }}>Mô tả tổng quan tour</label>
                        <textarea className="form-control" rows="3" placeholder="Giới thiệu điểm nhấn và các trải nghiệm đặc biệt của tour..." required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ padding: '12px 24px' }}>Hủy Bỏ</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontWeight: 800 }}>
                            {editingTour ? '💾 Cập Nhật Tour' : '🚀 Tạo Tour Mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
