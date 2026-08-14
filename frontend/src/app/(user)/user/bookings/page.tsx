/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Users, Download, ChevronRight, Ticket, Loader2, MessageSquare, Star, X, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { fetchApi } from '@/lib/api'

export default function UserBookingsPage() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Review states
  const [reviewBooking, setReviewBooking] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [showThanksModal, setShowThanksModal] = useState(false)

  // Cancel states
  const [cancelBookingItem, setCancelBookingItem] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false)
  const [cancelWarning, setCancelWarning] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchBookings = async () => {
      try {
        const data = await fetchApi(`/bookings/user/${user.id}`)
        setBookings(data)
      } catch (err) {
        console.error('Lỗi khi lấy đơn đặt:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewBooking) return
    setIsSubmittingReview(true)
    try {
      await fetchApi('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          tour_id: reviewBooking.tour_id,
          user_id: user?.id,
          user_email: user?.email,
          user_name: user?.name,
          user_avatar: user?.avatar,
          rating,
          comment
        })
      })
      
      // Update local state to hide the button immediately
      setBookings(prev => prev.map(b => b.id === reviewBooking.id ? { ...b, is_reviewed: true } : b))
      
      setShowThanksModal(true)
      setReviewBooking(null)
      setRating(5)
      setComment('')
    } catch (err: any) {
      alert(err.message || "Lỗi khi gửi đánh giá, vui lòng thử lại sau.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleOpenCancelModal = (booking: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const departureDate = new Date(booking.departure_date);
    departureDate.setHours(0, 0, 0, 0);

    const diffTime = departureDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 3) {
      alert("Sắp đến giờ khởi hành (dưới 3 ngày). Vui lòng liên hệ Hotline 1900 8888 để được hỗ trợ hủy tour.");
      return;
    }

    const isPending = booking.payment_status === 'Chưa thanh toán' || booking.status === 'Đang chờ xác nhận' || booking.status === 'Đang chờ thanh toán';
    if (!isPending && diffDays >= 3 && diffDays <= 7) {
      setCancelWarning("Lưu ý: Bạn sẽ mất 50% cọc nếu hủy vào lúc này do đã sát ngày khởi hành.");
    } else {
      setCancelWarning("");
    }
    
    setCancelBookingItem(booking);
  }

  const submitCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancelBookingItem) return
    if (!cancelReason) {
      alert("Vui lòng chọn lý do hủy tour.");
      return;
    }

    setIsSubmittingCancel(true)
    try {
      const res = await fetchApi(`/bookings/cancel/${cancelBookingItem.id}`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id,
          cancel_reason: cancelReason
        })
      })
      
      alert(res.message || "Đã gửi yêu cầu hủy thành công.");
      
      // Update local state based on payment status
      const isPending = cancelBookingItem.payment_status === 'Chưa thanh toán' || cancelBookingItem.status === 'Đang chờ xác nhận' || cancelBookingItem.status === 'Đang chờ thanh toán';
      const newStatus = isPending ? 'Hủy' : 'Yêu cầu hủy';
      
      setBookings(prev => prev.map(b => b.id === cancelBookingItem.id ? { ...b, status: newStatus } : b))
      
      setCancelBookingItem(null)
      setCancelReason('')
    } catch (err: any) {
      alert(err.message || "Lỗi khi hủy, vui lòng thử lại sau.")
    } finally {
      setIsSubmittingCancel(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đã hoàn thành':
        return <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">Đã hoàn thành</span>
      case 'Đã xác nhận':
        return <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">Đã xác nhận</span>
      case 'Đang chờ xác nhận':
        return <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">Đang chờ xác nhận</span>
      case 'Đang diễn ra':
        return <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">Đang diễn ra</span>
      case 'Hủy':
        return <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">Đã hủy</span>
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">{status}</span>
    }
  }

  const handlePrintTicket = (booking: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Vé Điện Tử - ${booking.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #0369a1; }
            .subtitle { color: #666; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .info-table th, .info-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .info-table th { background-color: #f8f9fa; font-weight: bold; width: 30%; }
            .footer { text-align: center; margin-top: 50px; font-size: 14px; color: #777; border-top: 1px dashed #ccc; padding-top: 20px; }
            .qr-code { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">✈️ VÉ ĐIỆN TỬ TRAVELBOOK</div>
            <div class="subtitle">Mã đơn: TB-${booking.id} | Ngày đặt: ${new Date(booking.created_at || new Date()).toLocaleDateString('vi-VN')}</div>
          </div>
          <div class="qr-code">
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TB-${booking.id}" alt="QR Code" />
          </div>
          <table class="info-table">
            <tr><th>Tên Tour</th><td>${booking.tour_name}</td></tr>
            <tr><th>Điện thoại</th><td>${booking.user_phone}</td></tr>
            <tr><th>Ngày khởi hành</th><td>${new Date(booking.departure_date).toLocaleDateString('vi-VN')}</td></tr>
            <tr><th>Số lượng</th><td>${booking.adults} Người lớn, ${booking.children || 0} Trẻ em</td></tr>
            <tr><th>Phương thức thanh toán</th><td>${booking.payment_method}</td></tr>
            <tr><th>Tổng tiền</th><td><strong style="color: #e11d48; font-size: 18px;">${formatCurrency(booking.total_price)} VNĐ</strong></td></tr>
          </table>
          <div class="footer">
            Vui lòng xuất trình mã QR này hoặc vé in tại điểm khởi hành.<br/>
            Cảm ơn quý khách đã sử dụng dịch vụ của TravelBook!
          </div>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  if (loading) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-500 relative">
      {/* Cancel Modal */}
      {cancelBookingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Hủy đặt tour
              </h3>
              <button onClick={() => setCancelBookingItem(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={submitCancel} className="p-6 space-y-6">
              <div>
                <p className="font-semibold text-slate-800 mb-2">Bạn có chắc chắn muốn hủy đơn hàng: <span className="text-blue-600">{cancelBookingItem.tour_name}</span>?</p>
                <p className="text-sm text-slate-500 mb-4">Quá trình này không thể hoàn tác.</p>
                
                {cancelWarning && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-3 mb-4 rounded-r-lg">
                    <p className="text-orange-700 text-sm font-medium">{cancelWarning}</p>
                  </div>
                )}
                
                <label className="block text-sm font-medium text-slate-700 mb-2">Vui lòng chọn lý do hủy (Bắt buộc):</label>
                <div className="space-y-2">
                  {[
                    "Tôi có việc đột xuất",
                    "Đổi ý không muốn đi nữa",
                    "Tìm thấy giá rẻ hơn",
                    "Lý do khác"
                  ].map(reason => (
                    <label key={reason} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <input 
                        type="radio" 
                        name="cancelReason" 
                        value={reason} 
                        checked={cancelReason === reason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-slate-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setCancelBookingItem(null)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Giữ lại đơn</button>
                <button type="submit" disabled={isSubmittingCancel} className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-70">
                  {isSubmittingCancel ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đồng ý Hủy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thanks Modal */}
      {showThanksModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Cảm ơn bạn!</h3>
            <p className="text-slate-600 mb-6">Đánh giá của bạn đã được ghi nhận và sẽ giúp ích rất nhiều cho các du khách khác.</p>
            <button onClick={() => setShowThanksModal(false)} className="w-full px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Đánh giá chuyến đi</h3>
              <button onClick={() => setReviewBooking(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={submitReview} className="p-6 space-y-6">
              <div>
                <p className="font-semibold text-slate-800 mb-2">{reviewBooking.tour_name}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 transition-all ${star <= rating ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Chia sẻ trải nghiệm của bạn</label>
                <textarea 
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chuyến đi rất tuyệt vời..."
                  className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setReviewBooking(null)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Hủy</button>
                <button type="submit" disabled={isSubmittingReview} className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-70">
                  {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi Đánh Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-slate-900 mb-8">Đơn đặt của tôi</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có chuyến đi nào</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Bạn chưa đặt chuyến đi nào trên hệ thống. Hãy khám phá các tour hấp dẫn của chúng tôi!</p>
          <Link href="/tours" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Khám phá Tour <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="flex flex-col md:flex-row gap-6 p-4 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
              <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 bg-slate-100 group relative">
                <img src={booking.tour_image || "https://images.unsplash.com/photo-1596422846543-74c6e271abb1?auto=format&fit=crop&w=400&q=80"} alt={booking.tour_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2">
                    <Link href={`/tours/${booking.tour_id}`} className="hover:text-blue-600 transition-colors">{booking.tour_name}</Link>
                  </h3>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5"><Ticket className="w-4 h-4 text-slate-400" /> Mã đơn: <span className="font-mono font-medium text-slate-900">TB-{booking.id}</span></div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Khởi hành: <span className="font-medium text-slate-900">{new Date(booking.departure_date).toLocaleDateString('vi-VN')}</span></div>
                  <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> Khách: <span className="font-medium text-slate-900">{booking.adults} Lớn{booking.children > 0 ? `, ${booking.children} Trẻ em` : ''}</span></div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="font-black text-red-600 text-lg">{formatCurrency(booking.total_price)}</div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {booking.status === 'Đã hoàn thành' && (
                      booking.is_reviewed ? (
                        <Link 
                          href={`/tours/${booking.tour_id}`}
                          className="text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5 border border-amber-200"
                        >
                          <Star className="w-4 h-4" /> Xem đánh giá của bạn
                        </Link>
                      ) : (
                        <button 
                          onClick={() => setReviewBooking(booking)}
                          className="text-sm font-bold text-white bg-amber-500 px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-200"
                        >
                          <MessageSquare className="w-4 h-4" /> Đánh giá
                        </button>
                      )
                    )}
                    {(booking.status === 'Đã xác nhận' || booking.status === 'Đã hoàn thành' || booking.status === 'Đang diễn ra') && (
                      <button onClick={() => handlePrintTicket(booking)} className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                        <Download className="w-4 h-4" /> Xem vé
                      </button>
                    )}
                    {(booking.status === 'Đang chờ xác nhận' || booking.status === 'Đang chờ thanh toán' || booking.status === 'Đã xác nhận') && (
                      <button onClick={() => handleOpenCancelModal(booking)} className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5 border border-red-200">
                        <X className="w-4 h-4" /> Hủy Tour
                      </button>
                    )}
                    <Link href={`/tours/${booking.tour_id}`} className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                      Chi tiết <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
