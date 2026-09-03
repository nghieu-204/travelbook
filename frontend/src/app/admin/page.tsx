/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { Map, ShoppingBag, DollarSign, CheckCircle2, MoreHorizontal, Calendar, Download, UserPlus, TrendingDown, ChevronRight, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'
import { fetchApi } from '@/lib/api'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

const REGION_COLORS: Record<string, string> = {
  'Trong nước': '#3b82f6', // Blue
  'Quốc tế': '#10b981',    // Green
  'Miền Bắc': '#ef4444',
  'Miền Trung': '#f59e0b',
  'Miền Nam': '#8b5cf6',
  'Châu Á': '#ec4899',
  'Châu Âu': '#06b6d4',
  'Châu Mỹ': '#f97316',
  'Chưa có dữ liệu': '#334155'
}

import { toast } from 'react-hot-toast'

function formatRevenue(revenue: number): string {
  if (revenue === 0) return '0';
  if (revenue < 1000000) {
    return revenue.toLocaleString('vi-VN');
  } else if (revenue < 1000000000) {
    return (revenue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' triệu';
  } else {
    return (revenue / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';
  }
}

function formatFullCurrency(revenue: number): string {
  return revenue.toLocaleString('vi-VN') + ' ₫';
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [pieChartMode, setPieChartMode] = useState<'all' | 'domestic' | 'international'>('all')
  const [timeFilter, setTimeFilter] = useState('month')

  useEffect(() => {
    setIsLoading(true)
    fetchApi(`/admin/stats?time=${timeFilter}`)
      .then(data => {
        setStats(data)
      })
      .catch(err => {
        console.error('Lỗi lấy thống kê:', err)
      })
      .finally(() => setIsLoading(false))
  }, [timeFilter])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] text-slate-400">
        Không thể tải dữ liệu thống kê.
      </div>
    )
  }

  // --- Chuyển đổi dữ liệu từ API cho Charts ---
  
  // 1. Doanh thu 6 tháng (Bar Chart)
  const revenueData = stats.monthly_analytics?.map((m: any) => ({
    name: m.month,
    total: Number(m.revenue)
  })) || []

  // 2. Tỷ trọng tour (Pie Chart)
  const allTourData = [
    { name: 'Trong nước', value: stats.region_analytics?.filter((r: any) => r.calc_category === 'Trong nước').reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0) || 0 },
    { name: 'Quốc tế', value: stats.region_analytics?.filter((r: any) => r.calc_category === 'Quốc tế').reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0) || 0 },
  ]
  
  const domesticTourData = stats.region_analytics?.filter((r: any) => r.calc_category === 'Trong nước').map((r: any) => ({
    name: r.region_name,
    value: Number(r.count || 0)
  })) || []
  
  const internationalTourData = stats.region_analytics?.filter((r: any) => r.calc_category === 'Quốc tế').map((r: any) => ({
    name: r.region_name,
    value: Number(r.count || 0)
  })) || []

  let activePieData = allTourData
  if (pieChartMode === 'domestic') activePieData = domesticTourData
  else if (pieChartMode === 'international') activePieData = internationalTourData
  
  // Tính tổng để lọc các mục có giá trị 0
  activePieData = activePieData.filter((item: any) => item.value > 0)
  if (activePieData.length === 0) {
    activePieData = [{ name: 'Chưa có dữ liệu', value: 1 }]
  }

  // 3. Phương thức thanh toán phổ biến
  const paymentTotal = stats.payment_analytics?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 1;
  
  const aggregatedPayments: Record<string, number> = {};
  stats.payment_analytics?.forEach((p: any) => {
    let methodName = p.method || 'Khác';
    if (methodName === 'Thanh toán tại văn phòng') methodName = 'Thanh toán trực tiếp';
    else if (methodName === 'Thanh toán qua VNPay' || methodName === 'VNPAY') methodName = 'VNPay';
    
    aggregatedPayments[methodName] = (aggregatedPayments[methodName] || 0) + p.count;
  });

  const topPayments = Object.entries(aggregatedPayments)
    .sort((a, b) => b[1] - a[1]) // Sort by count desc
    .map(([name, count], index) => ({
      name,
      count,
      percent: Math.round((count / paymentTotal) * 100),
      color: COLORS[index % COLORS.length]
    }))

  const handleExportReport = async () => {
    try {
      let token = '';
      const authStorage = localStorage.getItem('admin-auth-storage');
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        token = state?.token || '';
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/admin/reports/dashboard-summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Lỗi tải file");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bao_Cao_Tong_Quan_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi xuất báo cáo:", error);
      toast.error("Đã xảy ra lỗi khi xuất báo cáo!");
    }
  }

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-slate-400">Theo dõi các chỉ số quan trọng và hoạt động gần đây.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="appearance-none bg-[#1e293b] border border-slate-700 text-slate-200 py-2.5 pl-10 pr-8 rounded-xl font-medium focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors shadow-sm cursor-pointer">
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
              <option value="all">12 tháng gần nhất</option>
            </select>
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button onClick={handleExportReport} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 font-medium mb-1">Tổng doanh thu</p>
            <h3 
              className="text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-black text-white flex items-baseline gap-1 min-w-0 cursor-help"
              title={`Doanh thu\n${formatFullCurrency(Number(stats.kpi?.total_revenue) || 0)}`}
            >
              <span className="truncate">{formatRevenue(Number(stats.kpi?.total_revenue) || 0)}</span>
              <span className="text-sm font-medium text-slate-500 shrink-0">₫</span>
            </h3>
            {timeFilter !== 'all' && stats.kpi_trends && (
              <div className={`mt-2 text-sm font-medium flex items-center gap-1 ${stats.kpi_trends.total_revenue >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {stats.kpi_trends.total_revenue >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(stats.kpi_trends.total_revenue)}% so với kỳ trước</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 font-medium mb-1">Tổng lượt đặt</p>
            <h3 className="text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-black text-white min-w-0 truncate">{stats.kpi?.total_bookings || 0}</h3>
            {timeFilter !== 'all' && stats.kpi_trends && (
              <div className={`mt-2 text-sm font-medium flex items-center gap-1 ${stats.kpi_trends.total_bookings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {stats.kpi_trends.total_bookings >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(stats.kpi_trends.total_bookings)}% so với kỳ trước</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <UserPlus className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 font-medium mb-1">Người dùng hệ thống</p>
            <h3 className="text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-black text-white min-w-0 truncate">{stats.kpi?.total_users || 0}</h3>
            {timeFilter !== 'all' && stats.kpi_trends && (
              <div className={`mt-2 text-sm font-medium flex items-center gap-1 ${stats.kpi_trends.total_users >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {stats.kpi_trends.total_users >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(stats.kpi_trends.total_users)}% so với kỳ trước</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Map className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 font-medium mb-1">Tour đang hoạt động</p>
            <h3 className="text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-black text-white min-w-0 truncate">{stats.kpi?.active_tours || 0}</h3>
            {timeFilter !== 'all' && stats.kpi_trends && (
              <div className={`mt-2 text-sm font-medium flex items-center gap-1 ${stats.kpi_trends.active_tours >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {stats.kpi_trends.active_tours >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(stats.kpi_trends.active_tours)}% so với kỳ trước</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Lượt đặt theo khu vực</h2>
            <div className="relative">
              <select 
                value={pieChartMode}
                onChange={(e) => setPieChartMode(e.target.value as any)}
                className="appearance-none bg-[#0f172a] border border-slate-700 text-slate-300 py-1.5 pl-3 pr-8 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors cursor-pointer"
              >
                <option value="all">Tất cả</option>
                <option value="domestic">Trong nước</option>
                <option value="international">Quốc tế</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {activePieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={REGION_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
                  itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-4 pt-4 border-t border-slate-800">
            {activePieData.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REGION_COLORS[entry.name] || COLORS[index % COLORS.length] }}></div>
                <span className="text-sm font-medium text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm col-span-1 lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6">
            {timeFilter === 'year' 
              ? `Doanh thu theo tháng năm ${new Date().getFullYear()}` 
              : timeFilter === 'all' 
                ? 'Doanh thu 12 tháng gần nhất' 
                : 'Doanh thu theo tháng'
            }
          </h2>
          <div className="flex-1 min-h-[250px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}tr`} dx={-10} />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
                    cursor={{ fill: '#334155', opacity: 0.2 }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 font-medium">Chưa có dữ liệu doanh thu</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Tables Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Methods */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-white mb-6">Phương thức thanh toán phổ biến</h2>
          <div className="space-y-6">
            {topPayments.length > 0 ? topPayments.map((p: any) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-medium text-slate-300">{p.name}</span>
                  <span className="text-slate-400 font-medium">{p.count} lượt <span style={{ color: p.color }}>({p.percent}%)</span></span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.percent}%`, backgroundColor: p.color }}></div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500 font-medium">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Top Tours */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Tour được đặt nhiều nhất</h2>
            <Link href="/admin/tours" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group">
              Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-[#0f172a]/50">
                <tr>
                  <th className="px-4 py-3.5 rounded-l-lg font-semibold">Tên Tour</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Đã đặt</th>
                  <th className="px-4 py-3.5 rounded-r-lg font-semibold text-center">Còn trống</th>
                </tr>
              </thead>
              <tbody>
                {stats.capacity_analytics?.slice(0, 5).map((t: any) => (
                  <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-white truncate max-w-[250px]" title={t.name}>{t.name}</td>
                    <td className="px-4 py-4 text-emerald-400 font-bold text-center">{t.booked_spots}</td>
                    <td className="px-4 py-4 text-center">{t.available_spots}</td>
                  </tr>
                ))}
                {!stats.capacity_analytics?.length && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">Chưa có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Latest Bookings Table */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Đơn đặt mới chờ xác nhận</h2>
          <Link href="/admin/bookings" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group">
            Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-[#0f172a]">
              <tr>
                <th className="px-6 py-4 rounded-l-xl font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Tên Tour</th>
                <th className="px-6 py-4 font-semibold text-right">Tổng tiền</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-6 py-4 rounded-r-xl font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {stats.pending_bookings_list?.length > 0 ? stats.pending_bookings_list.map((b: any) => (
                <tr key={b.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-white">{b.user_name || 'Khách hàng ẩn danh'}</div>
                  </td>
                  <td className="px-6 py-5 font-medium text-slate-200 truncate max-w-[200px]" title={b.tour_name}>{b.tour_name}</td>
                  <td className="px-6 py-5 font-bold text-blue-400 text-right">{(Number(b.total_price) || 0).toLocaleString('vi-VN')}đ</td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1.5 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/20">{b.status}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link href={`/admin/bookings?id=${b.id}`} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-xs inline-flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4" /> Xử lý
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Không có đơn đặt nào đang chờ xác nhận</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
