'use client'

import { useState, useEffect } from 'react'
import { Map, ShoppingBag, DollarSign, CheckCircle2, MoreHorizontal, Calendar, Download, UserPlus, TrendingDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const revenueData = [
  { name: 'Tháng 1', total: 120000000 },
  { name: 'Tháng 2', total: 150000000 },
  { name: 'Tháng 3', total: 180000000 },
  { name: 'Tháng 4', total: 220000000 },
  { name: 'Tháng 5', total: 190000000 },
  { name: 'Tháng 6', total: 310000000 },
]

const allTourData = [
  { name: 'Trong nước', value: 65 },
  { name: 'Quốc tế', value: 35 },
]

const domesticTourData = [
  { name: 'Miền Bắc', value: 30 },
  { name: 'Miền Trung', value: 20 },
  { name: 'Miền Nam', value: 15 },
]

const internationalTourData = [
  { name: 'Châu Á', value: 20 },
  { name: 'Châu Âu', value: 10 },
  { name: 'Châu Mỹ', value: 5 },
]
const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b']

export default function AdminDashboard() {
  const [pieChartMode, setPieChartMode] = useState<'all' | 'domestic' | 'international'>('all')

  let activePieData = allTourData
  if (pieChartMode === 'domestic') activePieData = domesticTourData
  else if (pieChartMode === 'international') activePieData = internationalTourData

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-slate-400">Theo dõi các chỉ số quan trọng và hoạt động gần đây.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select defaultValue="month" className="appearance-none bg-[#1e293b] border border-slate-700 text-slate-200 py-2.5 pl-10 pr-8 rounded-xl font-medium focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors shadow-sm cursor-pointer">
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
              <option value="custom">Tùy chỉnh...</option>
            </select>
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
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
            <h3 className="text-3xl font-black text-white">450tr <span className="text-sm font-medium text-slate-500">VND</span></h3>
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
            <h3 className="text-3xl font-black text-white">128</h3>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <UserPlus className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 font-medium mb-1">Khách hàng mới</p>
            <h3 className="text-3xl font-black text-white">42</h3>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 font-medium mb-1">Tỷ lệ hủy tour</p>
            <h3 className="text-3xl font-black text-white">2.4%</h3>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Tỷ trọng tour</h2>
            <div className="relative">
              <select 
                value={pieChartMode}
                onChange={(e) => setPieChartMode(e.target.value as any)}
                className="appearance-none bg-[#0f172a] border border-slate-700 text-slate-300 py-1.5 pl-3 pr-8 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors cursor-pointer"
              >
                <option value="all">Phân loại: Tất cả</option>
                <option value="domestic">Phân loại: Trong nước</option>
                <option value="international">Phân loại: Quốc tế</option>
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
                  {activePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            {activePieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-sm font-medium text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm col-span-1 lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6">Doanh thu 6 tháng gần nhất</h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}tr`} dx={-10} />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Tables Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Methods */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-white mb-6">Phương thức thanh toán phổ biến</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium text-slate-300">Tiền mặt / Tại quầy</span>
                <span className="text-slate-400 font-medium">65 lượt <span className="text-blue-400">(50%)</span></span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium text-slate-300">Ví MoMo</span>
                <span className="text-slate-400 font-medium">40 lượt <span className="text-pink-400">(31%)</span></span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full" style={{ width: '31%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium text-slate-300">PayPal</span>
                <span className="text-slate-400 font-medium">23 lượt <span className="text-[#00457C]">(19%)</span></span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#00457C] h-full rounded-full" style={{ width: '19%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Tours */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Tour được đặt nhiều nhất</h2>
            <Link href="/admin/tours" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group">
              Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-[#0f172a]/50">
                <tr>
                  <th className="px-4 py-3.5 rounded-l-lg font-semibold">Tên Tour</th>
                  <th className="px-4 py-3.5 font-semibold">Đã đặt</th>
                  <th className="px-4 py-3.5 rounded-r-lg font-semibold">Còn trống</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4 font-medium text-white truncate max-w-[200px]">Hà Nội 36 Phố Phường</td>
                  <td className="px-4 py-4 text-emerald-400 font-bold">45</td>
                  <td className="px-4 py-4">5</td>
                </tr>
                <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4 font-medium text-white truncate max-w-[200px]">Đà Nẵng - Hội An</td>
                  <td className="px-4 py-4 text-emerald-400 font-bold">38</td>
                  <td className="px-4 py-4">12</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4 font-medium text-white truncate max-w-[200px]">Khám phá Sapa</td>
                  <td className="px-4 py-4 text-emerald-400 font-bold">29</td>
                  <td className="px-4 py-4 text-amber-500 font-bold">0</td>
                </tr>
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
                <th className="px-6 py-4 font-semibold">Tổng tiền</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 rounded-r-xl font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-white">Nguyễn Văn A</div>
                  <div className="text-xs text-slate-500 mt-0.5">nguyenvana@gmail.com</div>
                </td>
                <td className="px-6 py-5 font-medium text-slate-200">Tour Đà Lạt mộng mơ 3N2Đ</td>
                <td className="px-6 py-5 font-bold text-blue-400">4,500,000đ</td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1.5 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/20">Chờ xử lý</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-xs flex items-center gap-1.5 ml-auto shadow-sm">
                    <CheckCircle2 className="w-4 h-4" /> Xác nhận
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-white">Trần Thị B</div>
                  <div className="text-xs text-slate-500 mt-0.5">tranb99@gmail.com</div>
                </td>
                <td className="px-6 py-5 font-medium text-slate-200">Du thuyền Hạ Long 5 sao</td>
                <td className="px-6 py-5 font-bold text-blue-400">12,400,000đ</td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1.5 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/20">Chờ xử lý</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-xs flex items-center gap-1.5 ml-auto shadow-sm">
                    <CheckCircle2 className="w-4 h-4" /> Xác nhận
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
