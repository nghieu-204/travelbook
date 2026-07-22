import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Dashboard({ user }) {
    const [stats, setStats] = useState({
        kpi: { total_revenue: 0, total_bookings: 0, active_tours: 0, pending_bookings: 0, total_users: 0 },
        monthly_analytics: [],
        region_analytics: [],
        payment_analytics: [],
        capacity_analytics: [],
        pending_bookings_list: []
    });
    const [loading, setLoading] = useState(true);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/admin/stats', getAuthHeaders());
            setStats({
                kpi: res.data.kpi || { total_revenue: 0, total_bookings: 0, active_tours: 0, pending_bookings: 0, total_users: 0 },
                monthly_analytics: res.data.monthly_analytics || [],
                region_analytics: res.data.region_analytics || [],
                payment_analytics: res.data.payment_analytics || [],
                capacity_analytics: res.data.capacity_analytics || [],
                pending_bookings_list: res.data.pending_bookings_list || []
            });
        } catch (error) {
            console.error("Lỗi lấy dữ liệu thống kê:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleConfirmBooking = async (id) => {
        if (!window.confirm("Xác nhận duyệt đơn đặt tour này?")) return;
        try {
            await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status: 'Đã xác nhận' }, getAuthHeaders());
            fetchStats();
        } catch (error) {
            console.error("Lỗi duyệt đơn:", error);
            alert("Lỗi khi duyệt đơn!");
        }
    };

    // Biểu đồ đường Doanh thu theo tháng
    const lineChartData = {
        labels: stats.monthly_analytics.map(m => m.month),
        datasets: [
            {
                label: 'Doanh Thu Thực (VNĐ)',
                data: stats.monthly_analytics.map(m => Number(m.revenue)),
                borderColor: '#0a66c2',
                backgroundColor: 'rgba(10, 102, 194, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: '#00d4bd'
            }
        ]
    };

    // Biểu đồ tròn Phân loại theo khu vực Miền Bắc / Miền Trung / Miền Nam
    const regionChartData = {
        labels: stats.region_analytics.map(r => r.region),
        datasets: [
            {
                data: stats.region_analytics.map(r => r.count),
                backgroundColor: ['#0a66c2', '#00d4bd', '#ffb703', '#10b981'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    // Biểu đồ tròn Phương thức thanh toán (Paypal, Momo, Chuyển khoản QR...)
    const paymentChartData = {
        labels: stats.payment_analytics.map(p => p.method),
        datasets: [
            {
                data: stats.payment_analytics.map(p => p.count),
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    // Biểu đồ cột Top Tour đặt chỗ
    const barChartData = {
        labels: stats.capacity_analytics.map(c => c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name),
        datasets: [
            {
                label: 'Sức chứa tối đa (chỗ)',
                data: stats.capacity_analytics.map(c => Number(c.available_spots)),
                backgroundColor: 'rgba(148, 163, 184, 0.4)',
                borderRadius: 8
            },
            {
                label: 'Số chỗ đã đặt',
                data: stats.capacity_analytics.map(c => Number(c.booked_spots)),
                backgroundColor: '#00d4bd',
                borderRadius: 8
            }
        ]
    };

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}>
                ⏳ Đang tải số liệu Bảng Điều Khiển SkyTravel...
            </div>
        );
    }

    return (
        <div>
            {/* Header Dashboard */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                        📊 Bảng Điều Khiển & Thống Kê (Dashboard)
                    </h1>
                    <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
                        Theo dõi tổng quan số liệu, phân loại khu vực 3 miền, phương thức thanh toán và sức chứa tour.
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '10px 18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    🔄 Làm mới số liệu
                </button>
            </div>

            {/* 4 Thẻ KPI Cards chính */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'rgba(10, 102, 194, 0.05)', borderRadius: '50%' }}></div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                        💰 Tổng Doanh Thu Thực
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#0a66c2' }}>
                        {Number(stats.kpi.total_revenue).toLocaleString('vi-VN')} <span style={{ fontSize: '16px' }}>VNĐ</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600, marginTop: '8px' }}>
                        ● Đơn hàng đã hoàn tất & xác nhận
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'rgba(0, 212, 189, 0.05)', borderRadius: '50%' }}></div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                        📋 Tổng Đơn Đặt Tour
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b' }}>
                        {stats.kpi.total_bookings} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>Lượt đặt</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#00d4bd', fontWeight: 600, marginTop: '8px' }}>
                        ● {stats.kpi.pending_bookings} đơn mới chờ duyệt
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'rgba(255, 183, 3, 0.05)', borderRadius: '50%' }}></div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                        🏖️ Tổng Tour Khả Dụng
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b' }}>
                        {stats.kpi.active_tours} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>Tour</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#d97706', fontWeight: 600, marginTop: '8px' }}>
                        ● Phân bổ Miền Bắc, Trung, Nam
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '50%' }}></div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                        👥 Người Dùng Đăng Ký
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#10b981' }}>
                        {stats.kpi.total_users} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>Khách hàng</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 600, marginTop: '8px' }}>
                        ● Thành viên hệ thống SkyTravel
                    </div>
                </div>
            </div>

            {/* Hàng 2: Biểu đồ Phân loại Khu vực 3 Miền & Biểu đồ Phương thức thanh toán */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🗺️ Phân Loại Tour Theo Khu Vực (Miền)
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>Thống kê danh sách tour theo từng khu vực Bắc, Trung, Nam</p>
                    <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {stats.region_analytics.length > 0 ? (
                            <Doughnut data={regionChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        ) : (
                            <div style={{ color: '#94a3b8' }}>Chưa có dữ liệu khu vực</div>
                        )}
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        💳 Phương Thức Thanh Toán Phổ Biến
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>Thống kê các cổng thanh toán (Paypal, Momo, QR Bank...)</p>
                    <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {stats.payment_analytics.length > 0 ? (
                            <Doughnut data={paymentChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        ) : (
                            <div style={{ color: '#94a3b8' }}>Chưa có dữ liệu thanh toán</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hàng 3: Biểu đồ đường Doanh thu tháng */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
                    📈 Biểu Đồ Doanh Thu Chi Tiết Theo Tháng
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>Biến động doanh thu thực tế từ các đơn tour xác nhận qua các tháng</p>
                <div style={{ height: '300px' }}>
                    {stats.monthly_analytics.length > 0 ? (
                        <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Chưa có dữ liệu doanh thu tháng</div>
                    )}
                </div>
            </div>

            {/* Hàng 3.5: Các Bảng Dữ Liệu Nhanh */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                
                {/* Bảng Phương Thức Thanh Toán */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        💳 Phương Thức Thanh Toán Phổ Biến
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>Phương Thức</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>Số Lượt Dùng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.payment_analytics.map((p, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>
                                            {p.method === 'office' ? 'Tiền mặt / Văn phòng' : 
                                             p.method === 'paypal' ? 'PayPal' : 
                                             p.method === 'momo' ? 'Ví MoMo' : p.method}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0a66c2' }}>{p.count} lượt</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bảng Đơn chờ duyệt */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⏳ Đơn Đặt Mới Chờ Xác Nhận
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>Khách Hàng</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>Tour</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>Tổng Tiền</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.pending_bookings_list && stats.pending_bookings_list.length > 0 ? stats.pending_bookings_list.map((b) => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>{b.user_name}</td>
                                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{b.tour_name.length > 20 ? b.tour_name.substring(0, 20)+'...' : b.tour_name}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#e11d48' }}>{Number(b.total_price).toLocaleString('vi-VN')} đ</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button 
                                                onClick={() => handleConfirmBooking(b.id)}
                                                style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                                title="Xác nhận nhanh đơn đặt này"
                                            >
                                                ✅ Duyệt nhanh
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>Không có đơn mới cần duyệt</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Hàng 4: Bảng & Biểu đồ Tour được đặt nhiều nhất, số chỗ đã đặt và chỗ trống */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
                    🏆 Top Tours Được Đặt Nhiều Nhất & Tình Trạng Sức Chứa
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>Liệt kê chi tiết số chỗ tối đa, số chỗ đã được khách đặt và số chỗ còn trống cho từng tour</p>
                
                <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Mã Tour</th>
                                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Tên Tour Du Lịch</th>
                                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Khu Vực</th>
                                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Sức Chứa Tối Đa</th>
                                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Số Chỗ Đã Đặt</th>
                                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Chỗ Còn Trống</th>
                                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.capacity_analytics.map((c, index) => {
                                const avail = Number(c.available_spots);
                                const booked = Number(c.booked_spots);
                                const remaining = Math.max(0, avail - booked);
                                const percent = Math.round((booked / avail) * 100);

                                return (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a66c2' }}>#T-{c.id}</td>
                                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1e293b' }}>{c.name}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                background: c.region === 'Miền Bắc' ? '#eff6ff' : c.region === 'Miền Trung' ? '#fef3c7' : '#ecfdf5',
                                                color: c.region === 'Miền Bắc' ? '#1d4ed8' : c.region === 'Miền Trung' ? '#b45309' : '#047857'
                                            }}>
                                                {c.region}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>{avail} chỗ</td>
                                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#00d4bd' }}>{booked} chỗ</td>
                                        <td style={{ padding: '14px 16px', fontWeight: 800, color: remaining === 0 ? '#e11d48' : '#64748b' }}>
                                            {remaining} chỗ
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '80px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${Math.min(100, percent)}%`, height: '100%', background: percent >= 90 ? '#e11d48' : percent >= 60 ? '#ffb703' : '#00d4bd', borderRadius: '4px' }}></div>
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{percent}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#475569', margin: '0 0 12px' }}>📊 Biểu Đồ Sức Chứa & Đặt Chỗ:</h4>
                <div style={{ height: '320px' }}>
                    {stats.capacity_analytics.length > 0 ? (
                        <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Chưa có dữ liệu tour</div>
                    )}
                </div>
            </div>
        </div>
    );
}
