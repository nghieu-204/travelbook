'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, ArrowUpDown, Copy, FileText, FileSpreadsheet, FileIcon, Printer, Eye, CheckCircle2, XCircle, Phone, Mail, Filter, CalendarDays, Banknote, RefreshCw, Edit3, Rocket, Flag } from 'lucide-react'
import { fetchApi } from '@/lib/api'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function BookingsPage() {
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  
  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    adults: 0,
    children: 0,
    total_price: 0
  })

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const data = await fetchApi('/bookings')
      const mappedData = data.map((b: any) => ({
        id: b.id,
        tourCode: `T-${b.tour_id}`,
        tourName: b.tour_name,
        customerName: b.user_name,
        email: b.user_email,
        phone: b.user_phone,
        address: '', 
        bookingDate: new Date(b.created_at || Date.now()).toISOString().split('T')[0],
        adults: b.adults,
        children: b.children,
        totalPrice: b.total_price,
        bookingStatus: b.status,
        paymentMethod: b.payment_method,
        paymentStatus: b.payment_status || 'Chưa thanh toán'
      }))
      setAllBookings(mappedData)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Filter effect
  useEffect(() => {
    let filtered = [...allBookings]

    // 1. Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(b =>
        (b.id && b.id.toLowerCase().includes(lowerSearch)) ||
        (b.tourCode && b.tourCode.toLowerCase().includes(lowerSearch)) ||
        (b.tourName && b.tourName.toLowerCase().includes(lowerSearch)) ||
        (b.customerName && b.customerName.toLowerCase().includes(lowerSearch)) ||
        (b.email && b.email.toLowerCase().includes(lowerSearch)) ||
        (b.phone && b.phone.includes(searchTerm))
      )
    }

    // 2. Status filter
    if (statusFilter !== 'all') {
      const statusMap: Record<string, string> = {
        'completed': 'Đã hoàn thành',
        'confirmed': 'Đã xác nhận',
        'pending': 'Đang chờ xác nhận',
        'cancelled': 'Hủy'
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
  }, [searchTerm, statusFilter, startDate, endDate, allBookings])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-dropdown-container')) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleActionClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpenDropdownId(prev => prev === id ? null : id)
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetchApi(`/bookings/${id}/status`, {
        method: 'PUT',
        data: { status }
      })
      // Cập nhật state nội bộ
      setAllBookings(prev => prev.map(b => b.id === id ? { ...b, bookingStatus: status } : b))
      setOpenDropdownId(null)
      alert(`Đã cập nhật đơn hàng thành: ${status}`)
    } catch (err: any) {
      alert('Có lỗi xảy ra: ' + err.message)
    }
  }

  const handleUpdatePaymentStatus = async (id: string, payment_status: string) => {
    try {
      await fetchApi(`/bookings/${id}/payment-status`, {
        method: 'PUT',
        data: { payment_status }
      })
      // Cập nhật state nội bộ
      setAllBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: payment_status } : b))
      setOpenDropdownId(null)
      alert(`Đã xác nhận thanh toán thành công!`)
    } catch (err: any) {
      alert('Có lỗi xảy ra: ' + err.message)
    }
  }

  const handleOpenViewModal = (booking: any) => {
    setSelectedBooking(booking)
    setViewModalOpen(true)
    setOpenDropdownId(null)
  }

  const handleOpenEditModal = (booking: any) => {
    setSelectedBooking(booking)
    setEditForm({
      user_name: booking.customerName,
      user_email: booking.email,
      user_phone: booking.phone,
      adults: booking.adults,
      children: booking.children,
      total_price: booking.totalPrice
    })
    setEditModalOpen(true)
    setOpenDropdownId(null)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
    try {
      await fetchApi(`/bookings/${selectedBooking.id}`, {
        method: 'PUT',
        data: editForm
      })
      alert('Cập nhật thành công!')
      setEditModalOpen(false)
      fetchBookings() // refresh data
    } catch (err: any) {
      alert('Lỗi: ' + err.message)
    }
  }

  const handlePrintInvoice = (booking: any) => {
    setOpenDropdownId(null)
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>In Hóa Đơn - ${booking.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { color: #666; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .info-table th, .info-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .info-table th { background-color: #f8f9fa; font-weight: bold; width: 30%; }
            .footer { text-align: center; margin-top: 50px; font-size: 14px; color: #777; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">HÓA ĐƠN ĐẶT TOUR</div>
            <div class="subtitle">Mã đơn: TB-${booking.id} | Ngày in: ${new Date().toLocaleDateString('vi-VN')}</div>
          </div>
          <table class="info-table">
            <tr><th>Tên Tour</th><td>${booking.tourName}</td></tr>
            <tr><th>Khách hàng</th><td>${booking.customerName}</td></tr>
            <tr><th>Email</th><td>${booking.email}</td></tr>
            <tr><th>Điện thoại</th><td>${booking.phone}</td></tr>
            <tr><th>Ngày khởi hành</th><td>${booking.bookingDate}</td></tr>
            <tr><th>Số lượng</th><td>${booking.adults} Người lớn, ${booking.children} Trẻ em</td></tr>
            <tr><th>Phương thức thanh toán</th><td>${booking.paymentMethod}</td></tr>
            <tr><th>Trạng thái thanh toán</th><td>${booking.paymentStatus}</td></tr>
            <tr><th>Tổng tiền</th><td><strong style="color: #0369a1; font-size: 18px;">${formatCurrency(booking.totalPrice)} VNĐ</strong></td></tr>
          </table>
          <div class="footer">
            Cảm ơn quý khách đã sử dụng dịch vụ của TravelBook!
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
      case 'Đang thực hiện':
        return <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đang thực hiện</span>
      case 'Đang chờ xác nhận':
        return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đang chờ xác nhận</span>
      case 'Hủy':
        return <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đã hủy</span>
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

  const exportColumns = ['Mã đơn', 'Mã Tour', 'Tên Tour', 'Khách hàng', 'SĐT', 'Email', 'Ngày đặt', 'Người lớn', 'Trẻ em', 'Tổng tiền', 'Thanh toán', 'Trạng thái'];

  const getExportData = () => {
    return bookings.map(b => [
      `TB-${b.id}`,
      b.tourCode,
      b.tourName,
      b.customerName,
      b.phone,
      b.email,
      b.bookingDate,
      b.adults,
      b.children,
      b.totalPrice,
      `${b.paymentStatus} (${b.paymentMethod})`,
      b.bookingStatus
    ]);
  };

  const handleCopy = () => {
    const data = getExportData();
    const text = [exportColumns.join('\t'), ...data.map(row => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(text).then(() => alert('Đã sao chép vào khay nhớ tạm!'));
  };

  const handleCSV = () => {
    const data = getExportData();
    const csvContent = [
      exportColumns.join(','), 
      ...data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Add BOM for UTF-8 Excel support
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExcel = () => {
    const data = [exportColumns, ...getExportData()];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "bookings.xlsx");
  };

  const removeVietnameseTones = (str: string) => {
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
      str = str.replace(/đ/g, "d");
      str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
      str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
      str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
      str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
      str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
      str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
      str = str.replace(/Đ/g, "D");
      return str;
  }

  const handlePDF = () => {
    const doc = new jsPDF('landscape');
    const safeData = getExportData().map(row => row.map(cell => removeVietnameseTones(String(cell))));
    const safeColumns = exportColumns.map(c => removeVietnameseTones(c));
    
    doc.text("Danh sach don dat (Bookings)", 14, 15);
    autoTable(doc, {
      head: [safeColumns],
      body: safeData,
      startY: 20,
      styles: { font: 'helvetica', fontSize: 8 },
    });
    doc.save("bookings.pdf");
  };

  const handlePrintTable = () => {
    const data = getExportData();
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>In danh sách đơn hàng</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Danh sách Đơn hàng (Bookings)</h2>
          <table>
            <thead>
              <tr>${exportColumns.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

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
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors shadow-sm">
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button onClick={handleCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors shadow-sm">
                <FileText className="w-4 h-4" /> CSV
              </button>
              <button onClick={handleExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors shadow-sm">
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
              <button onClick={handlePDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors shadow-sm">
                <FileIcon className="w-4 h-4" /> PDF
              </button>
              <button onClick={handlePrintTable} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors shadow-sm">
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
                <option value="pending">Đang chờ xác nhận</option>
                <option value="cancelled">Đã hủy</option>
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
        <div className="overflow-x-auto w-full custom-scrollbar min-h-[350px]">
          <table className="w-full text-sm text-left text-slate-300 border-collapse">
            <thead className="text-[11px] text-slate-400 uppercase bg-[#0f172a] border-b border-slate-800">
              <tr>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 min-w-[100px]">Mã đơn <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 min-w-[200px]">Tên Tours <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 min-w-[200px]">Khách hàng <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50">Ngày đặt <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-center">Số lượng <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-right">Tổng tiền <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-center">Thanh toán <SortIcon /></th>
                <th className="px-2 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-center">Trạng thái <SortIcon /></th>
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
                    <td className="px-2 py-3 font-bold text-amber-500 border-r border-slate-800/50 text-[13px] whitespace-nowrap">
                      TB-{booking.id}
                    </td>
                    <td className="px-2 py-3 font-medium max-w-[220px] border-r border-slate-800/50 text-[13px]" title={booking.tourName}>
                      <div className="inline-block px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] font-bold mb-1.5 tracking-wide border border-slate-600 shadow-sm">{booking.tourCode}</div>
                      <div className="text-white line-clamp-2 leading-snug">{booking.tourName}</div>
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
                    <td className="px-2 py-3 text-center border-r border-slate-800/50">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {getPaymentStatusBadge(booking.paymentStatus)}
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {booking.paymentMethod === 'Thanh toán tại văn phòng' ? 'Thanh toán trực tiếp' : booking.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center border-r border-slate-800/50">{getBookingStatusBadge(booking.bookingStatus)}</td>

                    {/* Action Column - Sticky Right */}
                    <td
                      className={`px-2 py-3 text-center sticky right-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.3)] transition-colors ${openDropdownId === booking.id ? 'bg-slate-700/50 z-50' : isEven ? 'bg-[#1e293b] z-10' : 'bg-[#182132] z-10'}`}
                    >
                      <div className="relative inline-block text-left action-dropdown-container">
                        <button
                          onClick={(e) => handleActionClick(e, booking.id)}
                          className="bg-slate-700 hover:bg-slate-600 w-8 h-8 rounded flex items-center justify-center transition-colors group shadow-sm mx-auto"
                          title="Thao tác"
                        >
                          <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${openDropdownId === booking.id ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdownId === booking.id && (
                          <div className={`absolute right-full mr-2 w-56 rounded-md shadow-xl bg-slate-800 ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-200 ${index >= bookings.length - 2 && bookings.length > 2 ? 'bottom-0' : 'top-0'}`}>
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              {/* 1. Nhóm hành động CHUNG */}
                              <button onClick={() => handleOpenViewModal(booking)} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors">
                                <Eye className="w-4 h-4" /> Xem chi tiết
                              </button>
                              <button onClick={() => handleOpenEditModal(booking)} disabled={booking.bookingStatus === 'Đã hoàn thành' || booking.bookingStatus === 'Hủy'} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <Edit3 className="w-4 h-4" /> Chỉnh sửa
                              </button>
                              <button onClick={() => handlePrintInvoice(booking)} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors">
                                <Printer className="w-4 h-4" /> In / Xuất PDF
                              </button>

                              {/* Separator */}
                              {(booking.bookingStatus === 'Đang chờ xác nhận' || booking.bookingStatus === 'Đã xác nhận' || booking.bookingStatus === 'Đang thực hiện' || booking.bookingStatus === 'Hủy' || (booking.paymentMethod === 'Thanh toán trực tiếp' && booking.paymentStatus !== 'Đã thanh toán')) && (
                                <div className="border-t border-slate-700 my-1"></div>
                              )}

                              {/* 2. Nhóm hành động ĐỘNG */}
                              {(booking.paymentMethod === 'Thanh toán trực tiếp' && booking.paymentStatus !== 'Đã thanh toán') && (
                                <button onClick={() => { if(window.confirm('Xác nhận đã nhận tiền mặt từ khách hàng?')) handleUpdatePaymentStatus(booking.id, 'Đã thanh toán') }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:bg-slate-700 transition-colors">
                                  <Banknote className="w-4 h-4" /> Xác nhận thanh toán
                                </button>
                              )}
                              {booking.bookingStatus === 'Đang chờ xác nhận' && (
                                <>
                                  <button onClick={() => handleUpdateStatus(booking.id, 'Đã xác nhận')} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-400 hover:bg-slate-700 transition-colors">
                                    <CheckCircle2 className="w-4 h-4" /> Xác nhận đơn
                                  </button>
                                  <button onClick={() => { if(window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) handleUpdateStatus(booking.id, 'Hủy') }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-slate-700 transition-colors">
                                    <XCircle className="w-4 h-4" /> Hủy đơn
                                  </button>
                                </>
                              )}

                              {booking.bookingStatus === 'Đã xác nhận' && (
                                <>
                                  <button onClick={() => handleUpdateStatus(booking.id, 'Đang thực hiện')} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-400 hover:bg-slate-700 transition-colors">
                                    <Rocket className="w-4 h-4" /> Bắt đầu Tour
                                  </button>
                                  <button onClick={() => { if(window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) handleUpdateStatus(booking.id, 'Hủy') }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-slate-700 transition-colors">
                                    <XCircle className="w-4 h-4" /> Hủy đơn
                                  </button>
                                </>
                              )}

                              {booking.bookingStatus === 'Đang thực hiện' && (
                                <button onClick={() => handleUpdateStatus(booking.id, 'Đã hoàn thành')} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:bg-slate-700 transition-colors">
                                  <Flag className="w-4 h-4" /> Hoàn thành Tour
                                </button>
                              )}

                              {booking.bookingStatus === 'Hủy' && (
                                <button onClick={() => handleUpdateStatus(booking.id, 'Đang chờ xác nhận')} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-orange-400 hover:bg-slate-700 transition-colors">
                                  <RefreshCw className="w-4 h-4" /> Khôi phục đơn
                                </button>
                              )}
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
          <div>Showing 1 to {bookings.length} of {bookings.length} entries</div>
          <div className="flex gap-1 shadow-sm">
            <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-l-md hover:bg-slate-700 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-4 py-1.5 bg-blue-600 text-white border border-blue-600">1</button>
            <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-r-md hover:bg-slate-700 transition-colors disabled:opacity-50">Next</button>
          </div>
        </div>

      </div>

      {/* View Modal */}
      {viewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-2xl border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Chi tiết đơn hàng TB-{selectedBooking.id}</h3>
              <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4 text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-500 block mb-1">Khách hàng</span><strong className="text-white">{selectedBooking.customerName}</strong></div>
                <div><span className="text-slate-500 block mb-1">Email</span><strong className="text-white">{selectedBooking.email}</strong></div>
                <div><span className="text-slate-500 block mb-1">Số điện thoại</span><strong className="text-white">{selectedBooking.phone}</strong></div>
                <div><span className="text-slate-500 block mb-1">Ngày khởi hành</span><strong className="text-white">{new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN')}</strong></div>
                <div><span className="text-slate-500 block mb-1">Số lượng khách</span><strong className="text-white">{selectedBooking.adults} Người lớn, {selectedBooking.children} Trẻ em</strong></div>
                <div><span className="text-slate-500 block mb-1">Tổng tiền</span><strong className="text-amber-400 text-lg">{formatCurrency(selectedBooking.totalPrice)} VNĐ</strong></div>
                <div className="col-span-2"><span className="text-slate-500 block mb-1">Tên Tour</span><strong className="text-white">{selectedBooking.tourName}</strong></div>
                <div><span className="text-slate-500 block mb-1">Phương thức thanh toán</span><strong className="text-white">{selectedBooking.paymentMethod}</strong></div>
                <div><span className="text-slate-500 block mb-1">Trạng thái thanh toán</span><strong className="text-white">{selectedBooking.paymentStatus}</strong></div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end">
              <button onClick={() => setViewModalOpen(false)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Chỉnh sửa TB-{selectedBooking.id}</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tên khách hàng</label>
                <input type="text" required value={editForm.user_name} onChange={(e) => setEditForm({...editForm, user_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                <input type="email" required value={editForm.user_email} onChange={(e) => setEditForm({...editForm, user_email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Số điện thoại</label>
                <input type="text" required value={editForm.user_phone} onChange={(e) => setEditForm({...editForm, user_phone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Người lớn</label>
                  <input type="number" min="1" required value={editForm.adults} onChange={(e) => setEditForm({...editForm, adults: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Trẻ em</label>
                  <input type="number" min="0" required value={editForm.children} onChange={(e) => setEditForm({...editForm, children: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tổng tiền (VNĐ)</label>
                <input type="number" min="0" required value={editForm.total_price} onChange={(e) => setEditForm({...editForm, total_price: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-700">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}