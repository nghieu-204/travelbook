'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Search } from 'lucide-react'
import Link from 'next/link'
import { fetchApi } from '@/lib/api'

export default function AdminTours() {
  const [tours, setTours] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLocation, setFilterLocation] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    const loadTours = async () => {
      try {
        const data = await fetchApi('/tours?isAdmin=true')
        setTours(data || [])
      } catch (error) {
        console.error("Failed to load tours", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTours()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa tour này?')) return;
    try {
      await fetchApi(`/tours/${id}`, { method: 'DELETE' });
      setTours(tours.filter(t => t.id !== id));
      alert('Đã xóa tour thành công!');
    } catch (error) {
      alert('Lỗi xóa tour');
    }
  }

  const handleToggleStatus = async (tourId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    // Optimistic update
    setTours(tours.map(t => t.id === tourId ? { ...t, status: newStatus } : t));
    try {
      await fetchApi(`/tours/${tourId}/status`, { 
        method: 'PUT', 
        body: JSON.stringify({ status: newStatus }) 
      });
    } catch (error) {
      // Revert on error
      setTours(tours.map(t => t.id === tourId ? { ...t, status: currentStatus } : t));
      alert('Lỗi cập nhật trạng thái');
    }
  }

  // Derive unique locations for filter dropdown
  const locations = Array.from(new Set(tours.map(t => t.location || 'Chưa cập nhật').filter(Boolean)))

  // Apply Filters
  const filteredTours = tours.filter(tour => {
    const tourName = (tour.name || tour.title || '').toLowerCase()
    const tourId = String(tour.id)
    const tourCode = (tour.tour_code || '').toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = tourName.includes(searchLower) || tourId.includes(searchTerm) || tourCode.includes(searchLower)
    
    const location = tour.location || 'Chưa cập nhật'
    const matchesLocation = filterLocation === 'All' || location === filterLocation

    const status = tour.status || 'Active'
    const matchesStatus = filterStatus === 'All' || status === filterStatus

    return matchesSearch && matchesLocation && matchesStatus
  })

  const getStatusDisplay = (status: string) => {
    if (status === 'Active') return { label: 'Hoạt động', className: 'bg-emerald-500/20 text-emerald-500' }
    if (status === 'Inactive' || status === 'Hidden') return { label: 'Tạm dừng', className: 'bg-slate-700 text-slate-300' }
    return { label: status, className: 'bg-slate-700 text-slate-300' }
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Quản lý Tour</h1>
          <p className="text-slate-400">Xem, tìm kiếm, bộ lọc và chỉnh sửa danh sách tour.</p>
        </div>
        <Link href="/admin/tours/create" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap">
          <Plus className="w-5 h-5" /> Thêm Tour Mới
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc mã tour..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e293b] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="All">Tất cả Địa điểm</option>
          {locations.map((loc, idx) => (
            <option key={idx} value={loc}>{loc}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="All">Tất cả Trạng thái</option>
          <option value="Active">Hoạt động</option>
          <option value="Inactive">Tạm dừng</option>
        </select>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#0f172a] text-slate-400 border-b border-slate-800 uppercase text-xs">
                <th className="p-4 font-semibold min-w-[120px]">Mã Tour</th>
                <th className="p-4 font-semibold min-w-[250px] max-w-[300px]">Tên Tour</th>
                <th className="p-4 font-semibold">Địa điểm</th>
                <th className="p-4 font-semibold">Lịch trình</th>
                <th className="p-4 font-semibold">Giá</th>
                <th className="p-4 font-semibold text-center">Số chỗ</th>
                <th className="p-4 font-semibold text-center">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTours.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">Không tìm thấy tour nào phù hợp.</td>
                </tr>
              ) : filteredTours.map((tour, index) => {
                const isActive = (tour.status || 'Active') === 'Active'
                
                const startDateStr = tour.start_date || tour.departure_date;
                let startDate = 'Chưa xếp';
                let endDate = 'lịch';
                
                if (startDateStr) {
                  const s = new Date(startDateStr);
                  if (!isNaN(s.getTime())) {
                    startDate = s.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const dString = tour.duration || '';
                    const days = parseInt(dString.split(' ')[0]) || 1;
                    s.setDate(s.getDate() + (days - 1));
                    endDate = s.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  }
                }

                const spots = tour.available_spots || tour.max_seats || 0
                const booked = tour.booked_spots || 0
                
                const adultPrice = (tour.price || tour.price_adult || 0).toLocaleString('vi-VN')
                const childPrice = (tour.price_child || (tour.price || 0) * 0.7).toLocaleString('vi-VN')
                
                return (
                  <tr key={tour.id} className={`border-b border-slate-800/50 hover:bg-slate-700/50 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#0f172a]/40'}`}>
                    <td className="p-4 text-blue-400 font-medium whitespace-nowrap">{tour.tour_code || `#${tour.id}`}</td>
                    <td className="p-4 font-medium text-white max-w-[300px] truncate" title={tour.name || tour.title}>
                      {tour.name || tour.title}
                    </td>
                    <td className="p-4">{tour.location || 'Chưa cập nhật'}</td>
                    <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                      {startDate} - {endDate}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-emerald-500 font-semibold text-[15px]">{adultPrice}đ</div>
                      <div className="text-slate-400 text-xs mt-0.5">Trẻ em: {childPrice}đ</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-white font-medium">{booked}</span> / <span className="text-slate-500">{spots}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleStatus(tour.id, tour.status || 'Active')}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        title={isActive ? 'Tạm dừng' : 'Kích hoạt'}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-4.5' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Link href={`/admin/tours/edit/${tour.id}`} className="p-1.5 inline-block text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors align-middle" title="Sửa"><Edit className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(tour.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors ml-1 align-middle" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
