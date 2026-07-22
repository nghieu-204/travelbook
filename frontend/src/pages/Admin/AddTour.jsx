import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AddTour() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        region: 'Miền Bắc',
        available_spots: 30,
        price: '',
        child_price: '',
        departure_date: '',
        end_date: '',
        category: 'Trải nghiệm',
        badge: 'Mới',
        description: ''
    });

    // Dropzone State
    const [images, setImages] = useState([]);
    
    // Itinerary State
    const [itinerary, setItinerary] = useState([
        { day: 'Ngày 1', title: '', detail: '' }
    ]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Dropzone Logic ---
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        simulateUpload(files);
    }, []);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        simulateUpload(files);
    };

    const simulateUpload = (files) => {
        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file),
            uploading: true,
            success: false
        }));
        
        setImages(prev => [...prev, ...newImages]);

        newImages.forEach(img => {
            setTimeout(() => {
                setImages(prev => prev.map(p => p.id === img.id ? { ...p, uploading: false, success: true } : p));
            }, 800 + Math.random() * 1000); 
        });
    };

    const removeImage = (id) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    // --- Itinerary Logic ---
    const addDay = () => {
        setItinerary([...itinerary, { day: `Ngày ${itinerary.length + 1}`, title: '', detail: '' }]);
    };

    const handleItineraryChange = (index, field, value) => {
        const newItin = [...itinerary];
        newItin[index][field] = value;
        setItinerary(newItin);
    };

    const removeDay = (index) => {
        const newItin = [...itinerary];
        newItin.splice(index, 1);
        const renumbered = newItin.map((item, i) => ({ ...item, day: `Ngày ${i + 1}` }));
        setItinerary(renumbered);
    };

    // --- Submit Logic ---
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const mainImageUrl = images.length > 0 ? images[0].preview : "https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80";

            let duration = '3 Ngày 2 Đêm';
            if (formData.departure_date && formData.end_date) {
                const diffTime = Math.abs(new Date(formData.end_date) - new Date(formData.departure_date));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                duration = `${diffDays} Ngày ${diffDays > 1 ? diffDays - 1 : 0} Đêm`;
            }

            const payload = {
                ...formData,
                price: Number(formData.price),
                child_price: Number(formData.child_price || Number(formData.price) * 0.7),
                available_spots: Number(formData.available_spots),
                duration: duration,
                image: mainImageUrl,
                gallery: images.map(img => img.preview),
                itinerary: itinerary.filter(i => i.title || i.detail),
                included: ["Khách sạn 4-5 sao", "Vé máy bay khứ hồi", "Ăn uống theo chương trình", "Bảo hiểm du lịch"],
                excluded: ["Chi phí cá nhân", "VAT"]
            };

            await axios.post('http://localhost:5000/api/tours', payload, getAuthHeaders());
            
            setTimeout(() => {
                setIsSubmitting(false);
                navigate('/admin/tours');
            }, 800);
            
        } catch (error) {
            console.error("Lỗi khi thêm tour:", error);
            alert("Có lỗi xảy ra khi lưu tour!");
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '20px 40px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
            {/* Header & Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <Link to="/admin/tours" style={{ color: '#0a66c2', fontWeight: 600, textDecoration: 'none' }}>← Quay lại</Link>
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: 0 }}>Thêm Tour Mới (Wizard)</h1>
                    <p style={{ color: '#64748b', marginTop: '6px' }}>Hoàn thành các bước dưới đây để tạo một hành trình mới</p>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {[1, 2, 3].map(num => (
                        <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                                width: '40px', height: '40px', borderRadius: '50%', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                background: step >= num ? '#0a66c2' : '#f1f5f9',
                                color: step >= num ? 'white' : '#64748b',
                                fontWeight: 800, fontSize: '16px',
                                transition: 'all 0.3s'
                            }}>
                                {step > num ? '✓' : num}
                            </div>
                            <div style={{ fontWeight: step >= num ? 700 : 500, color: step >= num ? '#1e293b' : '#94a3b8' }}>
                                {num === 1 ? 'Thông tin' : num === 2 ? 'Mô tả & Ảnh' : 'Lịch trình'}
                            </div>
                            {num < 3 && <div style={{ width: '40px', height: '2px', background: step > num ? '#0a66c2' : '#e2e8f0' }}></div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Wizard Content */}
            <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', minHeight: '500px' }}>
                
                {/* STEP 1: Basic Info */}
                {step === 1 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>1. Thông tin cơ bản</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>Tên Tour <span style={{ color: 'red' }}>*</span></label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="VD: Khám phá Tây Bắc 4N3Đ..." style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>Điểm Đến</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="VD: Sapa, Lào Cai" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>Khu Vực</label>
                                <select name="region" value={formData.region} onChange={handleChange} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }}>
                                    <option value="Miền Bắc">Miền Bắc</option>
                                    <option value="Miền Trung">Miền Trung</option>
                                    <option value="Miền Nam">Miền Nam</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>Giá Người Lớn (VNĐ)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="VD: 5500000" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>Giá Trẻ Em (VNĐ)</label>
                                <input type="number" name="child_price" value={formData.child_price} onChange={handleChange} placeholder="Để trống tự tính = 70% giá NL" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>Ngày Khởi Hành</label>
                                <input type="date" name="departure_date" value={formData.departure_date} onChange={handleChange} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>Ngày Kết Thúc</label>
                                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                            </div>
                            
                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>Số chỗ tối đa</label>
                                <input type="number" name="available_spots" value={formData.available_spots} onChange={handleChange} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Description & Images */}
                {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>2. Mô tả chi tiết & Hình ảnh</h2>
                        
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', color: '#334155' }}>Mô tả Tour</label>
                            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                                <textarea 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                    placeholder="Nhập nội dung mô tả chi tiết tour..."
                                    style={{ width: '100%', height: '200px', padding: '16px', border: 'none', resize: 'vertical', outline: 'none', fontSize: '15px', fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', color: '#334155' }}>Upload Hình Ảnh (Kéo thả file)</label>
                            <div 
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                                style={{ 
                                    border: '2px dashed #0a66c2', background: '#f0f9ff', padding: '40px', 
                                    borderRadius: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' 
                                }}
                            >
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>☁️</div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0a66c2' }}>Kéo thả hoặc click để chọn ảnh</div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Hỗ trợ JPG, PNG (Mô phỏng upload)</div>
                                <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
                            </div>

                            {/* Gallery Preview */}
                            {images.length > 0 && (
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px' }}>
                                    {images.map(img => (
                                        <div key={img.id} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <img src={img.preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: img.uploading ? 0.5 : 1 }} />
                                            {img.uploading && (
                                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid #0a66c2', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            )}
                                            {img.success && (
                                                <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#10b981', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>✓</div>
                                            )}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                                style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '6px', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px' }}
                                            >🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: Itinerary */}
                {step === 3 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>3. Lịch Trình Chi Tiết (Timeline Builder)</h2>
                            <button onClick={addDay} style={{ background: '#ecfdf5', color: '#10b981', padding: '10px 16px', borderRadius: '10px', border: '1px solid #a7f3d0', fontWeight: 700, cursor: 'pointer' }}>+ Thêm Ngày Mới</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {itinerary.map((item, idx) => (
                                <div key={idx} style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '-12px', left: '24px', background: '#0a66c2', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
                                        {item.day}
                                    </div>
                                    {itinerary.length > 1 && (
                                        <button onClick={() => removeDay(idx)} style={{ position: 'absolute', top: '16px', right: '16px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Xóa ngày</button>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>Tiêu đề (VD: HCM - Đà Lạt)</label>
                                            <input type="text" value={item.title} onChange={(e) => handleItineraryChange(idx, 'title', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>Nội dung lịch trình</label>
                                            <textarea value={item.detail} onChange={(e) => handleItineraryChange(idx, 'detail', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', minHeight: '100px', resize: 'vertical' }}></textarea>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button 
                    disabled={step === 1}
                    onClick={() => setStep(step - 1)} 
                    style={{ padding: '14px 28px', background: step === 1 ? '#e2e8f0' : 'white', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: 700, color: step === 1 ? '#94a3b8' : '#334155', cursor: step === 1 ? 'not-allowed' : 'pointer' }}
                >
                    ← Quay lại
                </button>

                {step < 3 ? (
                    <button 
                        onClick={() => setStep(step + 1)} 
                        style={{ padding: '14px 36px', background: '#0a66c2', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                    >
                        Tiếp theo →
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        style={{ padding: '14px 36px', background: isSubmitting ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                    >
                        {isSubmitting ? 'ĐANG LƯU...' : '✅ HOÀN THÀNH & LƯU TOUR'}
                    </button>
                )}
            </div>
            
            <style>{`
                @keyframes spin { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
