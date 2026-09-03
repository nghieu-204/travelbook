/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/static-components */
'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, ArrowUpDown, Copy, FileText, FileSpreadsheet, FileIcon, Printer, Eye, CheckCircle2, XCircle, Phone, Mail, Filter, Banknote, RefreshCw, Edit3, Rocket, Flag } from 'lucide-react'
import { bookingService } from '@/services/bookingService'
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/status'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'
import { useConfirm } from '@/providers/ConfirmProvider'

export default function BookingsPage() {
  const { confirm } = useConfirm()
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [isExportOpen, setIsExportOpen] = useState(false)
  
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

  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'} | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const data = await bookingService.getAdminBookings()
      const mappedData = data.map((b: any) => ({
        id: b.id,
        tourCode: b.tour_code || `TB-${b.tour_id}`,
        tourName: b.tour_name,
        customerName: b.user_name,
        email: b.user_email,
        phone: b.user_phone,
        address: '', 
        bookingDate: new Date(b.created_at || Date.now()).toISOString().split('T')[0],
        rawDate: b.created_at || Date.now(),
        adults: b.adults,
        children: b.children,
        totalPrice: b.total_price,
        bookingStatus: b.status,
        paymentMethod: b.payment_method,
        paymentStatus: b.payment_status || PAYMENT_STATUS.UNPAID
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
        (b.id && b.id.toString().toLowerCase().includes(lowerSearch)) ||
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
        'completed': BOOKING_STATUS.COMPLETED,
        'confirmed': BOOKING_STATUS.CONFIRMED,
        'pending': BOOKING_STATUS.PENDING,
        'in_progress': BOOKING_STATUS.ONGOING,
        'cancelled': BOOKING_STATUS.CANCELLED
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

    // 4. Custom sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Priority sort
      const statusPriority: Record<string, number> = {
        [BOOKING_STATUS.PENDING]: 1,
        [BOOKING_STATUS.CONFIRMED]: 2,
        [BOOKING_STATUS.ONGOING]: 3,
        [BOOKING_STATUS.COMPLETED]: 4,
        [BOOKING_STATUS.CANCELLED]: 5
      };
      filtered.sort((a, b) => {
        const pA = statusPriority[a.bookingStatus] || 99;
        const pB = statusPriority[b.bookingStatus] || 99;
        if (pA !== pB) return pA - pB;
        return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
      });
    }

    setBookings(filtered)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, startDate, endDate, allBookings, sortConfig])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-dropdown-container')) {
        setOpenDropdownId(null);
      }
      if (!target.closest('.export-dropdown-container')) {
        setIsExportOpen(false);
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
      setOpenDropdownId(null) // Đóng ngay lập tức để phản hồi click và tránh click đúp
      await bookingService.updateBookingStatus(Number(id), status)
      // Cập nhật state nội bộ
      setAllBookings(prev => prev.map(b => b.id === id ? { ...b, bookingStatus: status } : b))
      toast.success(`Đã cập nhật đơn hàng thành: ${status}`, { id: 'admin-booking-update-success' })
    } catch (err: any) {
      toast.error('Có lỗi xảy ra: ' + err.message, { id: 'admin-booking-update-error' })
    }
  }

  const handleUpdatePaymentStatus = async (id: string, payment_status: string) => {
    try {
      setOpenDropdownId(null) // Đóng ngay lập tức để phản hồi click và tránh click đúp
      await bookingService.updatePaymentStatus(Number(id), payment_status)
      // Cập nhật state nội bộ
      setAllBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: payment_status } : b))
      toast.success(`Đã xác nhận thanh toán thành công!`, { id: 'admin-payment-success' })
    } catch (err: any) {
      toast.error('Có lỗi xảy ra: ' + err.message, { id: 'admin-payment-error' })
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
      await bookingService.updateBooking(Number(selectedBooking.id), editForm)
      toast.success('Cập nhật thành công!', { id: 'admin-edit-success' })
      setEditModalOpen(false)
      fetchBookings() // refresh data
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message, { id: 'admin-edit-error' })
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
      case BOOKING_STATUS.COMPLETED:
        return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đã hoàn thành</span>
      case BOOKING_STATUS.CONFIRMED:
        return <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đã xác nhận</span>
      case BOOKING_STATUS.ONGOING:
        return <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đang diễn ra</span>
      case BOOKING_STATUS.PENDING:
        return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đang chờ xác nhận</span>
      case BOOKING_STATUS.CANCELLED:
        return <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">Đã hủy</span>
      default:
        return <span className="px-2 py-0.5 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-[11px] font-bold whitespace-nowrap block w-max mx-auto">{status}</span>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    if (status === PAYMENT_STATUS.PAID) {
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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const SortIcon = ({ sortKey }: { sortKey: string }) => (
    <ArrowUpDown className={`w-3.5 h-3.5 inline-block ml-1 transition-opacity ${sortConfig?.key === sortKey ? 'text-blue-400 opacity-100' : 'text-slate-600 opacity-50 group-hover:opacity-100'}`} />
  )

  const pendingCount = allBookings.filter(b => b.bookingStatus === BOOKING_STATUS.PENDING).length;
  const totalPages = Math.ceil(bookings.length / pageSize) || 1;
  const paginatedBookings = bookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    navigator.clipboard.writeText(text).then(() => toast.success('Đã sao chép vào khay nhớ tạm!', { id: 'copy-success' }));
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

        {/* Toolbar & Filters */}
        <div className="p-5 border-b border-slate-800 flex flex-col gap-4">
          
          {/* Row 1: Export */}
          <div className="flex justify-end">
            <div className="relative inline-block text-left export-dropdown-container">
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors shadow-sm"
              >
                Xuất dữ liệu <ChevronDown className={`w-4 h-4 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-slate-800 border border-slate-700 ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="py-1">
                    <button onClick={() => { handleCopy(); setIsExportOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                    <button onClick={() => { handleCSV(); setIsExportOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                      <FileText className="w-4 h-4" /> CSV
                    </button>
                    <button onClick={() => { handleExcel(); setIsExportOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                      <FileSpreadsheet className="w-4 h-4" /> Excel
                    </button>
                    <button onClick={() => { handlePDF(); setIsExportOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                      <FileIcon className="w-4 h-4" /> PDF
                    </button>
                    <button onClick={() => { handlePrintTable(); setIsExportOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                      <Printer className="w-4 h-4" /> Print
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Filters */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto flex-wrap">
              {/* Date Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0f172a] border border-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full sm:w-36 transition-colors"
                  title="Từ ngày"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0f172a] border border-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full sm:w-36 transition-colors"
                  title="Đến ngày"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${statusFilter === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-[#0f172a] text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}`}
                >
                  Cần xử lý <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${statusFilter === 'pending' ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-700 text-slate-300'}`}>{pendingCount}</span>
                </button>

                <div className="relative min-w-[160px] flex-1 sm:flex-none">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-[#0f172a] border border-slate-700 text-slate-300 pl-9 pr-8 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full transition-colors cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="in_progress">Đang diễn ra</option>
                    <option value="pending">Đang chờ xác nhận</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                  <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full xl:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 text-slate-200 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full transition-colors"
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
                <th onClick={() => handleSort('id')} className="px-3 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 w-[90px]">Mã đơn <SortIcon sortKey="id" /></th>
                <th onClick={() => handleSort('tourName')} className="px-3 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 min-w-[240px]">Tên Tour <SortIcon sortKey="tourName" /></th>
                <th onClick={() => handleSort('customerName')} className="px-3 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 w-[220px]">Khách hàng <SortIcon sortKey="customerName" /></th>
                <th onClick={() => handleSort('rawDate')} className="px-3 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 w-[100px]">Ngày đặt <SortIcon sortKey="rawDate" /></th>
                <th onClick={() => handleSort('adults')} className="px-3 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-center w-[80px]">Số lượng <SortIcon sortKey="adults" /></th>
                <th onClick={() => handleSort('totalPrice')} className="px-3 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-right w-[120px]">Tổng tiền <SortIcon sortKey="totalPrice" /></th>
                <th onClick={() => handleSort('paymentStatus')} className="px-3 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-center w-[140px]">Thanh toán <SortIcon sortKey="paymentStatus" /></th>
                <th onClick={() => handleSort('bookingStatus')} className="px-3 py-3 font-semibold cursor-pointer group hover:text-white transition-colors border-r border-slate-800/50 text-center w-[140px]">Trạng thái <SortIcon sortKey="bookingStatus" /></th>
                <th className="px-3 py-3 font-semibold text-center sticky right-0 bg-[#0f172a] shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.3)] z-20 w-[70px]">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.map((booking, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={booking.id}
                    className={`border-b border-slate-800/50 hover:bg-slate-700/50 transition-colors ${isEven ? 'bg-transparent' : 'bg-[#0f172a]/40'}`}
                  >
                    <td className="px-3 py-4 font-bold text-amber-500 border-r border-slate-800/50 text-[13px] whitespace-nowrap align-top">
                      TB-{booking.id}
                    </td>
                    <td className="px-3 py-4 font-medium border-r border-slate-800/50 text-[13px] align-top" title={booking.tourName}>
                      <div className="inline-block px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] font-bold mb-1.5 tracking-wide border border-slate-600 shadow-sm">{booking.tourCode}</div>
                      <div className="text-white line-clamp-2 leading-snug">{booking.tourName}</div>
                    </td>
                    <td className="px-3 py-4 border-r border-slate-800/50 align-top">
                      <div className="font-bold text-white text-[13px] mb-1">{booking.customerName}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" /> {booking.phone}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5"><Mail className="w-3 h-3" /> <span className="truncate">{booking.email}</span></div>
                    </td>
                    <td className="px-3 py-4 border-r border-slate-800/50 text-[12px] whitespace-nowrap align-top">{booking.bookingDate}</td>
                    <td className="px-3 py-4 text-center font-medium border-r border-slate-800/50 text-[12px] text-slate-300 align-top">
                      {booking.adults + booking.children} <br/><span className="text-[10px] text-slate-500">({booking.adults}L, {booking.children}T)</span>
                    </td>
                    <td className="px-3 py-4 text-right font-bold text-amber-400 border-r border-slate-800/50 text-[13px] whitespace-nowrap align-top">{formatCurrency(booking.totalPrice)}</td>
                    <td className="px-3 py-4 text-center border-r border-slate-800/50 align-top">
                      <div className="flex flex-col items-center gap-1.5">
                        {getPaymentStatusBadge(booking.paymentStatus)}
                        <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                          {booking.paymentMethod === 'Thanh toán tại văn phòng' ? 'Trực tiếp' : (booking.paymentMethod === 'Thanh toán qua VNPay' || booking.paymentMethod === 'VNPAY' ? 'VNPay' : booking.paymentMethod)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center border-r border-slate-800/50 align-top">{getBookingStatusBadge(booking.bookingStatus)}</td>

                    {/* Action Column - Sticky Right */}
                    <td
                      className={`px-3 py-4 text-center sticky right-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.3)] transition-colors align-top ${openDropdownId === booking.id ? 'bg-slate-700/50 z-50' : isEven ? 'bg-[#1e293b] z-10' : 'bg-[#182132] z-10'}`}
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
                              <button onClick={() => handleOpenEditModal(booking)} disabled={booking.bookingStatus === BOOKING_STATUS.COMPLETED || booking.bookingStatus === BOOKING_STATUS.CANCELLED} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <Edit3 className="w-4 h-4" /> Chỉnh sửa
                              </button>
                              <button onClick={() => handlePrintInvoice(booking)} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors">
                                <Printer className="w-4 h-4" /> In / Xuất PDF
                              </button>

                              {/* Separator */}
                              {(booking.bookingStatus === BOOKING_STATUS.PENDING || booking.bookingStatus === BOOKING_STATUS.CONFIRMED || booking.bookingStatus === BOOKING_STATUS.ONGOING || booking.bookingStatus === BOOKING_STATUS.CANCELLED || (booking.paymentMethod === 'Thanh toán trực tiếp' && booking.paymentStatus !== PAYMENT_STATUS.PAID)) && (
                                <div className="border-t border-slate-700 my-1"></div>
                              )}

                              {/* 2. Nhóm hành động ĐỘNG */}
                              {(booking.paymentMethod === 'Thanh toán trực tiếp' && booking.paymentStatus !== PAYMENT_STATUS.PAID) && (
                                <button onClick={async () => { if(await confirm({ title: 'Xác nhận thanh toán', description: 'Xác nhận đã nhận tiền mặt từ khách hàng?' })) handleUpdatePaymentStatus(booking.id, PAYMENT_STATUS.PAID) }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:bg-slate-700 transition-colors">
                                  <Banknote className="w-4 h-4" /> Xác nhận thanh toán
                                </button>
                              )}
                              {booking.bookingStatus === BOOKING_STATUS.PENDING && (
                                <>
                                  <button onClick={() => handleUpdateStatus(booking.id, BOOKING_STATUS.CONFIRMED)} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-400 hover:bg-slate-700 transition-colors">
                                    <CheckCircle2 className="w-4 h-4" /> Xác nhận đơn
                                  </button>
                                  <button onClick={async () => { if(await confirm({ title: 'Hủy đơn hàng', description: 'Bạn có chắc chắn muốn hủy đơn hàng này không?', type: 'danger' })) handleUpdateStatus(booking.id, BOOKING_STATUS.CANCELLED) }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-slate-700 transition-colors">
                                    <XCircle className="w-4 h-4" /> Hủy đơn
                                  </button>
                                </>
                              )}

                              {(booking.bookingStatus === BOOKING_STATUS.CONFIRMED || booking.bookingStatus === BOOKING_STATUS.ONGOING) && (
                                <>
                                  <button onClick={async () => { if(await confirm({ title: 'Hoàn thành đơn', description: 'Đánh dấu đơn đặt tour này là đã hoàn thành (khách đã đi xong)?' })) handleUpdateStatus(booking.id, BOOKING_STATUS.COMPLETED) }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:bg-slate-700 transition-colors">
                                    <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành
                                  </button>
                                  <button onClick={async () => { if(await confirm({ title: 'Hủy đơn hàng', description: 'Bạn có chắc chắn muốn hủy đơn hàng này không?', type: 'danger' })) handleUpdateStatus(booking.id, BOOKING_STATUS.CANCELLED) }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-slate-700 transition-colors">
                                    <XCircle className="w-4 h-4" /> Hủy đơn
                                  </button>
                                </>
                              )}

                              {booking.bookingStatus === BOOKING_STATUS.CANCELLED && (
                                <button onClick={() => handleUpdateStatus(booking.id, BOOKING_STATUS.PENDING)} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-orange-400 hover:bg-slate-700 transition-colors">
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
        <div className="p-5 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              Hiển thị
              <select 
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-slate-800 border border-slate-700 text-white px-2 py-1.5 rounded-md focus:outline-none focus:border-blue-500 text-xs shadow-inner"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              đơn
            </div>
            <div className="hidden sm:block w-px h-4 bg-slate-700"></div>
            <div>
              Đang xem <strong className="text-white">{bookings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, bookings.length)}</strong> / {bookings.length}
            </div>
          </div>

          <div className="flex gap-1 shadow-sm overflow-x-auto max-w-full">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-l-md hover:bg-slate-700 transition-colors disabled:opacity-50"
            >Trước</button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 border ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
                  >
                    {pageNum}
                  </button>
                )
              }
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="px-2 py-1.5 text-slate-500">...</span>
              }
              return null;
            })}
            
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-r-md hover:bg-slate-700 transition-colors disabled:opacity-50"
            >Tiếp</button>
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
                <div><span className="text-slate-500 block mb-1">Phương thức thanh toán</span><strong className="text-white">{selectedBooking.paymentMethod === 'Thanh toán tại văn phòng' ? 'Thanh toán trực tiếp' : (selectedBooking.paymentMethod === 'Thanh toán qua VNPay' || selectedBooking.paymentMethod === 'VNPAY' ? 'VNPay' : selectedBooking.paymentMethod)}</strong></div>
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