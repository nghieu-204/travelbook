import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import TourModal from '../../components/Admin/TourModal';
import { useNavigate } from 'react-router-dom';

export default function ManageTours() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingTour, setEditingTour] = useState(null);
    const [formData, setFormData] = useState({
        name: '', location: 'Phú Quốc', region: 'Miền Nam', departure_date: '2026-08-15', price: '', child_price: '', available_spots: 30, duration: '4 Ngày 3 Đêm', category: 'Biển đảo', image: '', badge: 'Mới', description: ''
    });
    const [itineraryItems, setItineraryItems] = useState([{ day: 'Ngày 1', title: '', detail: '' }]);
    const [galleryUrls, setGalleryUrls] = useState(['']);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchTours = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/tours');
            setTours(res.data);
        } catch (error) {
            console.error("Lỗi tải tours:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTours();
    }, []);

    const handleOpenCreateModal = () => {
        navigate('/admin/tours/add');
    };

    const handleOpenEditModal = (tour) => {
        setEditingTour(tour);
        setFormData({
            name: tour.name || '',
            location: tour.location || 'Phú Quốc',
            region: tour.region || 'Miền Nam',
            departure_date: tour.departure_date || '2026-08-15',
            price: tour.price || '',
            child_price: tour.child_price || '',
            available_spots: tour.available_spots || 30,
            duration: tour.duration || '',
            category: tour.category || 'Biển đảo',
            image: tour.image || '',
            badge: tour.badge || 'Mới',
            description: tour.description || ''
        });

        // Parse Itinerary
        try {
            const parsedItin = typeof tour.itinerary === 'string' ? JSON.parse(tour.itinerary) : (tour.itinerary || []);
            setItineraryItems(parsedItin.length > 0 ? parsedItin : [{ day: 'Ngày 1', title: '', detail: '' }]);
        } catch (e) {
            setItineraryItems([{ day: 'Ngày 1', title: '', detail: '' }]);
        }

        // Parse Gallery
        try {
            const parsedGallery = typeof tour.gallery === 'string' ? JSON.parse(tour.gallery) : (tour.gallery || [tour.image]);
            setGalleryUrls(parsedGallery.length > 0 ? parsedGallery : ['']);
        } catch (e) {
            setGalleryUrls(tour.image ? [tour.image] : ['']);
        }

        setShowModal(true);
    };

    const handleSaveTour = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                child_price: Number(formData.child_price || formData.price * 0.7),
                available_spots: Number(formData.available_spots || 30),
                itinerary: itineraryItems.filter(item => item.title.trim() !== '' || item.detail.trim() !== ''),
                gallery: galleryUrls.filter(url => url.trim() !== ''),
                included: ["Vé máy bay khứ hồi", "Khách sạn 5 sao tiêu chuẩn", "Các bữa ăn đặc sản theo chương trình", "Bảo hiểm du lịch 100.000.000 VNĐ"],
                excluded: ["Chi phí cá nhân ngoài chương trình", "Tiền tip cho hướng dẫn viên"]
            };

            if (editingTour) {
                await axios.put(`http://localhost:5000/api/tours/${editingTour.id}`, payload, getAuthHeaders());
                alert("🎉 Cập nhật thông tin tour thành công!");
            } else {
                await axios.post('http://localhost:5000/api/tours', payload, getAuthHeaders());
                alert("🎉 Thêm tour mới thành công!");
            }
            setShowModal(false);
            fetchTours();
        } catch (error) {
            console.error("Lỗi lưu tour:", error);
            alert("❌ Có lỗi xảy ra khi lưu tour!");
        }
    };

    const handleDeleteTour = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tour này khỏi hệ thống?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/tours/${id}`, getAuthHeaders());
            setTours(tours.filter(t => t.id !== id));
            alert("✅ Đã xóa tour thành công!");
        } catch (error) {
            console.error("Lỗi xóa tour:", error);
            alert("❌ Lỗi khi xóa tour!");
        }
    };

    // Xuất Excel
    const exportToursExcel = () => {
        const dataToExport = tours.map(t => ({
            "ID": t.id,
            "Tên Tour": t.name,
            "Khu Vực": t.region || 'Miền Nam',
            "Địa Điểm": t.location,
            "Ngày Khởi Hành": t.departure_date || '2026-08-15',
            "Danh Mục": t.category,
            "Thời Gian": t.duration,
            "Giá Người Lớn (VNĐ)": Number(t.price).toLocaleString('vi-VN'),
            "Giá Trẻ Em (VNĐ)": Number(t.child_price || 0).toLocaleString('vi-VN'),
            "Số Chỗ Tối Đa": t.available_spots || 30,
            "Huy Hiệu": t.badge || ''
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachTours");
        XLSX.writeFile(workbook, "SkyTravel_DanhSachTours_5Sao.xlsx");
    };

    // Xuất PDF
    const exportToursPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(18);
        doc.text("SKYTRAVEL - DANH SACH TOUR DU LICH 5 SAO", 14, 20);

        const tableColumn = ["ID", "Ten Tour", "Khu Vuc", "Dia Diem", "Khoi Hanh", "Gia NL (VND)", "So Cho"];
        const tableRows = [];

        tours.forEach(t => {
            const tourData = [
                t.id,
                t.name.length > 30 ? t.name.substring(0, 30) + '...' : t.name,
                t.region || 'Mien Nam',
                t.location,
                t.departure_date || '2026-08-15',
                Number(t.price).toLocaleString('vi-VN'),
                t.available_spots || 30
            ];
            tableRows.push(tourData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 28,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [10, 102, 194] }
        });

        doc.save("SkyTravel_DanhSachTours.pdf");
    };

    // In trực tiếp (Print)
    const printTours = () => {
        window.print();
    };

    const filteredTours = tours.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.region && t.region.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1e293b', margin: '0 0 6px' }}>
                        🏖️ Quản Lý Hệ Thống Tours ({tours.length})
                    </h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                        Thêm tour mới, phân loại khu vực Bắc/Trung/Nam, thiết lập lịch trình và xuất PDF/Excel/In ấn.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={printTours} className="btn btn-outline btn-sm" style={{ padding: '10px 14px', fontWeight: 800 }}>
                        🖨️ In Danh Sách
                    </button>
                    <button onClick={exportToursExcel} className="btn btn-outline btn-sm" style={{ padding: '10px 14px', fontWeight: 800 }}>
                        📊 Xuất Excel
                    </button>
                    <button onClick={exportToursPDF} className="btn btn-outline btn-sm" style={{ padding: '10px 14px', fontWeight: 800 }}>
                        📑 Xuất PDF
                    </button>
                    <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm" style={{ padding: '10px 18px', fontWeight: 800 }}>
                        + Thêm Tour Mới
                    </button>
                </div>
            </div>

            {/* Search Box */}
            <div style={{ background: 'white', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px' }}>🔍</span>
                <input
                    type="text"
                    placeholder="Tìm kiếm tour theo tên, địa điểm hoặc khu vực (Miền Bắc, Miền Trung, Miền Nam)..."
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', color: '#1e293b' }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tours Table */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>ID</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>ẢNH</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>TÊN TOUR DU LỊCH</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>KHU VỰC / ĐỊA ĐIỂM</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>KHỞI HÀNH</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>GIÁ NGƯỜI LỚN / TRẺ EM</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>SỨC CHỨA</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b', textAlign: 'right' }}>HÀNH ĐỘNG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 'bold' }}>⏳ Đang tải danh sách tour...</td></tr>
                            ) : filteredTours.length === 0 ? (
                                <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy tour nào phù hợp!</td></tr>
                            ) : (
                                filteredTours.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#64748b' }}>#{t.id}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <img src={t.image} alt={t.name} style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '10px' }} />
                                        </td>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', maxWidth: '280px' }}>
                                            {t.name}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>⏱️ {t.duration}</span>
                                                <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 800 }}>{t.badge || 'Mới'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 800,
                                                background: t.region === 'Miền Bắc' ? '#eff6ff' : t.region === 'Miền Trung' ? '#fef3c7' : '#ecfdf5',
                                                color: t.region === 'Miền Bắc' ? '#1d4ed8' : t.region === 'Miền Trung' ? '#b45309' : '#047857',
                                                display: 'inline-block',
                                                marginBottom: '4px'
                                            }}>
                                                {t.region || 'Miền Nam'}
                                            </span>
                                            <div style={{ fontWeight: 600, color: '#475569', fontSize: '13px' }}>📍 {t.location}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#334155' }}>
                                            📅 {t.departure_date || '2026-08-15'}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: 800, color: '#e11d48' }}>{Number(t.price).toLocaleString('vi-VN')} VNĐ</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TE: {Number(t.child_price || t.price * 0.7).toLocaleString('vi-VN')} VNĐ</div>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0a66c2' }}>{t.available_spots || 30} chỗ</td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            <button onClick={() => handleOpenEditModal(t)} className="btn btn-outline btn-sm" style={{ marginRight: '8px', padding: '6px 12px' }}>✏️ Sửa</button>
                                            <button onClick={() => handleDeleteTour(t.id)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 800 }}>🗑️ Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tour Modal */}
            <TourModal
                showModal={showModal}
                setShowModal={setShowModal}
                editingTour={editingTour}
                formData={formData}
                setFormData={setFormData}
                itineraryItems={itineraryItems}
                setItineraryItems={setItineraryItems}
                galleryUrls={galleryUrls}
                setGalleryUrls={setGalleryUrls}
                handleSaveTour={handleSaveTour}
            />
        </div>
    );
}
