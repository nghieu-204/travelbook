import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import InvoiceModal from '../../components/Admin/InvoiceModal';

export default function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/bookings', getAuthHeaders());
            setBookings(res.data);
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateBookingStatus = async (id, newStatus) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status: newStatus }, getAuthHeaders());
            setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
            if (newStatus === 'Đã xác nhận' && res.data.invoiceHtml) {
                setSelectedInvoice({ id: id, html: res.data.invoiceHtml });
            }
            alert(res.data.message || `Đã cập nhật trạng thái đơn hàng #${id}`);
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái booking:", error);
            alert("❌ Có lỗi xảy ra khi cập nhật đơn hàng.");
        }
    };

    // Gửi hóa đơn thủ công qua email
    const handleSendInvoiceEmail = async (id) => {
        try {
            const res = await axios.post(`http://localhost:5000/api/bookings/${id}/send-invoice`, {}, getAuthHeaders());
            if (res.data.invoiceHtml) {
                setSelectedInvoice({ id: id, html: res.data.invoiceHtml });
            }
            alert(res.data.message || `📧 Đã gửi hóa đơn Email đến khách hàng thành công!`);
        } catch (error) {
            console.error("Lỗi gửi hóa đơn:", error);
            alert("❌ Có lỗi xảy ra khi gửi hóa đơn email!");
        }
    };

    // Xuất Excel
    const exportBookingsExcel = () => {
        const dataToExport = bookings.map(b => ({
            "Mã Đơn": `#SKY-${b.id}`,
            "Khách Hàng": b.user_name,
            "Số Điện Thoại": b.user_phone,
            "Email": b.user_email,
            "Tên Tour": b.tour_name,
            "Ngày Khởi Hành": new Date(b.departure_date).toLocaleDateString('vi-VN'),
            "Số Lượng": `${b.adults} NL, ${b.children || 0} TE`,
            "Tổng Tiền (VNĐ)": Number(b.total_price).toLocaleString('vi-VN'),
            "Thanh Toán": b.payment_method || 'Chuyển khoản QR',
            "Trạng Thái": b.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachDonHang");
        XLSX.writeFile(workbook, "SkyTravel_DanhSachDonHang.xlsx");
    };

    // Xuất PDF
    const exportBookingsPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(16);
        doc.text("SKYTRAVEL - DANH SACH DON DAT TOUR", 14, 20);

        const tableColumn = ["Ma Don", "Khach Hang", "SDT", "Tour Du Lich", "Khoi Hanh", "So Luong", "Tong Tien (VND)", "Trang Thai"];
        const tableRows = [];

        bookings.forEach(b => {
            const row = [
                `#SKY-${b.id}`,
                b.user_name,
                b.user_phone,
                b.tour_name.length > 25 ? b.tour_name.substring(0, 25) + '...' : b.tour_name,
                new Date(b.departure_date).toLocaleDateString('vi-VN'),
                `${b.adults} NL, ${b.children || 0} TE`,
                Number(b.total_price).toLocaleString('vi-VN'),
                b.status
            ];
            tableRows.push(row);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 28,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [10, 102, 194] }
        });

        doc.save("SkyTravel_DanhSachDonHang.pdf");
    };

    const printBookings = () => {
        window.print();
    };

    const filteredBookings = bookings.filter(b => 
        (statusFilter === 'Tất cả' || b.status === statusFilter) &&
        (b.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.user_phone?.includes(searchTerm) ||
         b.tour_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         `#SKY-${b.id}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1e293b', margin: '0 0 6px' }}>
                        📋 Quản Lý Đơn Đặt Tour & Hóa Đơn Email ({bookings.length})
                    </h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                        Duyệt đơn đặt tour, tự động gửi hóa đơn sang trọng qua Nodemailer và xuất báo cáo tài chính.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={printBookings} className="btn btn-outline btn-sm" style={{ padding: '10px 14px', fontWeight: 800 }}>
                        🖨️ In Danh Sách
                    </button>
                    <button onClick={exportBookingsExcel} className="btn btn-outline btn-sm" style={{ padding: '10px 14px', fontWeight: 800 }}>
                        📊 Xuất Excel
                    </button>
                    <button onClick={exportBookingsPDF} className="btn btn-outline btn-sm" style={{ padding: '10px 14px', fontWeight: 800 }}>
                        📑 Xuất PDF
                    </button>
                </div>
            </div>

            {/* Filter Tabs & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    {['Tất cả', 'Đang chờ xác nhận', 'Đã xác nhận', 'Hủy'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: '13px',
                                cursor: 'pointer',
                                background: statusFilter === st ? 'linear-gradient(135deg, #0a66c2, #00d4bd)' : 'transparent',
                                color: statusFilter === st ? 'white' : '#64748b',
                                transition: 'all 0.2s'
                            }}
                        >
                            {st}
                        </button>
                    ))}
                </div>

                <div style={{ background: 'white', padding: '10px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center', width: '360px' }}>
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm mã đơn, tên khách, SĐT hoặc tour..."
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#1e293b' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Bookings Table */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>MÃ ĐƠN</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>KHÁCH HÀNG & LIÊN HỆ</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>TOUR CHI TIẾT</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>KHỞI HÀNH & ĐOÀN</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>TỔNG THANH TOÁN</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>TRẠNG THÁI</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: '#64748b', textAlign: 'right' }}>THAO TÁC & HÓA ĐƠN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 'bold' }}>⏳ Đang tải đơn hàng...</td></tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chưa có đơn đặt tour nào phù hợp!</td></tr>
                            ) : (
                                filteredBookings.map(b => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 20px', fontWeight: 900, color: '#0a66c2' }}>#SKY-{b.id}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: 800, color: '#1e293b' }}>👤 {b.user_name}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>📞 {b.user_phone}</div>
                                            <div style={{ fontSize: '13px', color: '#00d4bd', fontWeight: 600 }}>📧 {b.user_email}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', maxWidth: '240px' }}>🌴 {b.tour_name}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: 800, color: '#475569' }}>📅 {new Date(b.departure_date).toLocaleDateString('vi-VN')}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>👥 {b.adults} Người lớn {b.children > 0 ? `, ${b.children} Trẻ em` : ''}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: 900, color: '#e11d48', fontSize: '16px' }}>{Number(b.total_price).toLocaleString('vi-VN')} VNĐ</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{b.payment_method || 'Chuyển khoản QR'}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '100px',
                                                fontSize: '12px',
                                                fontWeight: 800,
                                                background: (b.status === 'Đã xác nhận' || b.status?.includes('thanh toán')) ? '#ecfdf5' : (b.status === 'Hoàn thành' || b.status === 'Đã hoàn thành') ? '#eff6ff' : b.status === 'Hủy' ? '#fef2f2' : '#fef3c7',
                                                color: (b.status === 'Đã xác nhận' || b.status?.includes('thanh toán')) ? '#059669' : (b.status === 'Hoàn thành' || b.status === 'Đã hoàn thành') ? '#2563eb' : b.status === 'Hủy' ? '#dc2626' : '#d97706'
                                            }}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            {b.status === 'Đang chờ xác nhận' && (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => updateBookingStatus(b.id, 'Đã xác nhận')} className="btn btn-primary btn-sm" style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 800 }}>
                                                        ✅ Duyệt & Gửi Mail
                                                    </button>
                                                    <button onClick={() => updateBookingStatus(b.id, 'Hủy')} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, cursor: 'pointer', fontSize: '12px' }}>
                                                        ❌ Hủy
                                                    </button>
                                                </div>
                                            )}
                                            {(b.status === 'Đã xác nhận' || b.status?.includes('thanh toán')) && (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => updateBookingStatus(b.id, 'Hoàn thành')}
                                                        className="btn btn-outline btn-sm"
                                                        style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 800, background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}
                                                        title="Đánh dấu tour đã hoàn thành (khách đã trải nghiệm)"
                                                    >
                                                        🏁 Hoàn thành
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            axios.put(`http://localhost:5000/api/bookings/${b.id}/status`, { status: 'Đã xác nhận' }, getAuthHeaders())
                                                                .then(res => { if (res.data.invoiceHtml) setSelectedInvoice({ id: b.id, html: res.data.invoiceHtml }); });
                                                        }}
                                                        className="btn btn-outline btn-sm"
                                                        style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 800 }}
                                                    >
                                                        👁️ Xem Hóa Đơn
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendInvoiceEmail(b.id)}
                                                        className="btn btn-primary btn-sm"
                                                        style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 800, background: '#10b981', borderColor: '#10b981' }}
                                                        title="Tự động gửi lại email hóa đơn sang trọng đến khách hàng"
                                                    >
                                                        📧 Gửi Mail
                                                    </button>
                                                </div>
                                            )}
                                            {(b.status === 'Hoàn thành' || b.status === 'Đã hoàn thành') && (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 800, alignSelf: 'center' }}>✨ Đã trải nghiệm</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Modal */}
            <InvoiceModal
                selectedInvoice={selectedInvoice}
                setSelectedInvoice={setSelectedInvoice}
                onSendInvoice={async (id) => {
                    try {
                        const res = await axios.post(`http://localhost:5000/api/bookings/${id}/send-invoice`, {}, getAuthHeaders());
                        if (res.data.invoiceHtml) {
                            setSelectedInvoice({ id: id, html: res.data.invoiceHtml });
                        }
                    } catch (error) {
                        console.error("Lỗi gửi hóa đơn:", error);
                        alert("❌ Có lỗi xảy ra khi gửi hóa đơn email!");
                        throw error;
                    }
                }}
            />
        </div>
    );
}
