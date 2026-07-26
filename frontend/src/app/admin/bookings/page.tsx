'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, ArrowUpDown, Copy, FileText, FileSpreadsheet, FileIcon, Printer, Eye, CheckCircle2, XCircle, Phone, Mail, Filter, CalendarDays } from 'lucide-react'

// Mock Data
const mockBookings = [
  {
    id: 'BK101',
    tourName: 'Khám phá Vịnh Hạ Long 2N1Đ - Ngủ đêm trên du thuyền',
    customerName: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0988123456',
    address: '123 Lê Lợi, Q.1, TP.HCM',
    bookingDate: '2023-11-20',
    adults: 2,
    children: 1,
    totalPrice: 10070000,
    bookingStatus: 'Đã hoàn thành',
    paymentMethod: 'PayPal',
    paymentStatus: 'Đã thanh toán',
  },
  {
    id: 'BK102',
    tourName: 'Đà Nẵng - Hội An - Bà Nà Hills 4N3Đ',
    customerName: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0909888999',
    address: '456 Trần Phú, Đà Nẵng',
    bookingDate: '2023-11-21',
    adults: 2,
    children: 0,
    totalPrice: 8400000,
    bookingStatus: 'Đã xác nhận',
    paymentMethod: 'MoMo',
    paymentStatus: 'Đã thanh toán',
  },
  {
    id: 'BK103',
    tourName: 'Săn mây Tà Xùa - Mộc Châu 3N2Đ',
    customerName: 'Lê Hoàng C',
    email: 'lehoangc@gmail.com',
    phone: '0912345678',
    address: '789 Nguyễn Văn Linh, Hà Nội',
    bookingDate: '2023-11-22',
    adults: 4,
    children: 0,
    totalPrice: 7200000,
    bookingStatus: 'Chưa xác nhận',
    paymentMethod: 'Tiền mặt',
    paymentStatus: 'Chưa thanh toán',
  },
  {
    id: 'BK104',
    tourName: 'Nghỉ dưỡng Vinpearl Phú Quốc 3N2Đ',
    customerName: 'Phạm Văn D',
    email: 'phamvand@gmail.com',
    phone: '0933444555',
    address: '12 Nguyễn Trãi, Q.5, TP.HCM',
    bookingDate: '2023-11-23',
    adults: 2,
    children: 2,
    totalPrice: 15600000,
    bookingStatus: 'Chưa xác nhận',
    paymentMethod: 'Visa',
    paymentStatus: 'Đã thanh toán',
  },
  {
    id: 'BK105',
    tourName: 'Khám phá Sapa - Đỉnh Fansipan 3N2Đ',
    customerName: 'Hoàng Thị E',
    email: 'hoangthie@gmail.com',
    phone: '0977666555',
    address: '99 Lê Duẩn, Hà Nội',
    bookingDate: '2023-11-24',
    adults: 1,
    children: 0,
    totalPrice: 3500000,
    bookingStatus: 'Đã xác nhận',
    paymentMethod: 'MoMo',
    paymentStatus: 'Đã thanh toán',
  }
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Filter effect
  useEffect(() => {
    let filtered = [...mockBookings]

    // 1. Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(b => 
        b.tourName.toLowerCase().includes(lowerSearch) || 
        b.customerName.toLowerCase().includes(lowerSearch) ||
        b.email.toLowerCase().includes(lowerSearch) ||
        b.phone.includes(searchTerm)
      )
    }

    // 2. Status filter
    if (statusFilter !== 'all') {
      const statusMap: Record<string, string> = {
        'completed': 'Đã hoàn thành',
        'confirmed': 'Đã xác nhận',
        'pending': 'Chưa xác nhận'
      }
      if (statusMap[statusFilter]) {
        filtered = filtered.filter(b => b.bookingStatus === statusMap[statusFilter])
      }
    }

    // 3. Date range filter
    if (startDate) {
      filtered = filtered.filter(b => new Date(b.bookingDate) >= new Date(startDate))
    }
    if (endDate) {
      filtered = filtered.filter(b => new Date(b.bookingDate) <= new Date(endDate))
    }

    setBookings(filtered)
  }, [searchTerm, statusFilter, startDate, endDate])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleActionClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'Đã hoàn thành':
        return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đã hoàn thành</span>
      case 'Đã xác nhận':
        return <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đã xác nhận</span>
      case 'Chưa xác nhận':
        return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Chưa xác nhận</span>
      default:
        return <span className="px-2 py-0.5 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">{status}</span>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'Đã thanh toán') {
      return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đã thanh toán</span>
    }
    return <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Chưa thanh toán</span>
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'MoMo': return <span className="font-bold text-pink-500">MoMo</span>
      case 'PayPal': return <span className="font-bold text-blue-400">PayPal</span>
      case 'Visa': return <span className="font-bold text-[#1a1f71]">Visa</span>
      default: return <span className="font-bold text-slate-300">Tiền mặt</span>
    }
  }

  const SortIcon = () => <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 inline-block ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />

  return (
    <div className="p-8 pb-20 max-w-full mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Booking</h1>
        <p className="text-slate-400 text-sm">Chào mừng bạn đến với trang quản lý tour đã đặt. Tại đây, bạn có thể xác nhận, xem chi tiết, và quản lý tất cả các tour đã được đặt hiện có.</p>
      </div>

      {/* Main Container */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Left: Export Buttons & Length Menu */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors shadow-sm">
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors shadow-sm">
                <FileText className="w-4 h-4" /> CSV
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors shadow-sm">
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors shadow-sm">
                <FileIcon className="w-4 h-4" /> PDF
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors shadow-sm">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-400">
              Show 
              <select className="bg-slate-800 border border-slate-700 text-white px-2 py-1 rounded-md focus:outline-none focus:border-blue-500">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              entries
            </div>
          </div>

          {/* Right: Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center w-full lg:w-auto gap-3">
            {/* Filter Date */}
            <div className="relative w-full sm:w-auto">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full transition-colors shadow-inner"
                title="Từ ngày"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full transition-colors shadow-inner"
                title="Đến ngày"
              />
            </div>
            
            {/* Filter Status */}
            <div className="relative w-full sm:w-auto min-w-[140px]">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-[#0f172a] border border-slate-700 text-slate-300 pl-9 pr-8 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full transition-colors shadow-inner cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="pending">Chưa xác nhận</option>
              </select>
              <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 text-slate-200 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full transition-colors shadow-inner"
                placeholder="Tìm kiếm booking..."
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-sm text-left text-slate-300 border-collapse">
            <thead className="text-[11px] text-slate-400 uppercase bg-[#0f172a] border-b border-slate-800">
              <tr>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 min-w-[180px]">Tên Tours <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 min-w-[200px]">Khách hàng <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50">Ngày đặt <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-center">Số lượng <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-right">Tổng tiền <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-center">Trạng thái <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-center">Phương thức <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-center">Thanh toán <SortIcon /></th>
                <th className="px-2 py-3 font-semibold text-center sticky right-0 bg-[#0f172a] shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.3)] z-20">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr 
                    key={booking.id} 
                    className={`border-b border-slate-800/50 hover:bg-slate-700/50 transition-colors ${isEven ? 'bg-transparent' : 'bg-[#0f172a]/40'}`}
                  >
                    <td className="px-2 py-3 font-medium text-white max-w-[220px] border-r border-slate-800/50 text-[13px]" title={booking.tourName}>
                      <div className="line-clamp-2">{booking.tourName}</div>
                    </td>
                    <td className="px-2 py-3 border-r border-slate-800/50">
                      <div className="font-bold text-white text-[13px]">{booking.customerName}</div>
                      <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {booking.phone}</div>
                      <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {booking.email}</div>
                    </td>
                    <td className="px-2 py-3 border-r border-slate-800/50 text-xs whitespace-nowrap">{booking.bookingDate}</td>
                    <td className="px-2 py-3 text-center font-medium border-r border-slate-800/50 text-xs text-slate-300">
                      {booking.adults + booking.children} ({booking.adults}L, {booking.children}T)
                    </td>
                    <td className="px-2 py-3 text-right font-bold text-amber-400 border-r border-slate-800/50 text-[13px] whitespace-nowrap">{formatCurrency(booking.totalPrice)}</td>
                    <td className="px-2 py-3 text-center border-r border-slate-800/50">{getBookingStatusBadge(booking.bookingStatus)}</td>
                    <td className="px-2 py-3 text-center border-r border-slate-800/50 text-xs">{getPaymentMethodText(booking.paymentMethod)}</td>
                    <td className="px-2 py-3 text-center border-r border-slate-800/50">{getPaymentStatusBadge(booking.paymentStatus)}</td>
                    
                    {/* Action Column - Sticky Right */}
                    <td 
                      className={`px-2 py-3 text-center sticky right-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.3)] transition-colors ${openDropdownId === booking.id ? 'bg-slate-700/50' : isEven ? 'bg-[#1e293b]' : 'bg-[#182132]'}`}
                    >
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={(e) => handleActionClick(e, booking.id)}
                          className="bg-slate-700 hover:bg-slate-600 w-8 h-8 rounded flex items-center justify-center transition-colors group shadow-sm mx-auto"
                          title="Thao tác"
                        >
                          <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${openDropdownId === booking.id ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdownId === booking.id && (
                          <div className="absolute right-full mr-2 top-0 w-48 rounded-md shadow-xl bg-slate-800 ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              <button className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors">
                                <Eye className="w-4 h-4" /> Xem chi tiết
                              </button>
                              <button className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:bg-slate-700 transition-colors">
                                <CheckCircle2 className="w-4 h-4" /> Xác nhận Booking
                              </button>
                              <button className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-slate-700 transition-colors">
                                <XCircle className="w-4 h-4" /> Hủy Booking
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div>Showing 1 to 5 of 5 entries</div>
          <div className="flex gap-1 shadow-sm">
            <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-l-md hover:bg-slate-700 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-4 py-1.5 bg-blue-600 text-white border border-blue-600">1</button>
            <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-r-md hover:bg-slate-700 transition-colors disabled:opacity-50">Next</button>
          </div>
        </div>

      </div>
    </div>
  )
}
