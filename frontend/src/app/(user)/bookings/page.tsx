/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect, @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, MapPin, Calendar, Users, ChevronRight, Download, Ticket, ArrowRight, Loader2, MessageSquare, Star, X, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { fetchApi } from '@/lib/api'

export default function BookingsPage() {
  const { user, isLoginModalOpen, setLoginModalOpen } = useAuthStore()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Review states
  const [reviewBooking, setReviewBooking] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [showThanksModal, setShowThanksModal] = useState(false)

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
      case 'Đang thực hiện':
        return <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">Đang thực hiện</span>
      case 'Hủy':
        return <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">Đã hủy</span>
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-slate-50 min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
          <Ticket className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Bạn chưa đăng nhập</h2>
          <p className="text-slate-500 mb-6">Vui lòng đăng nhập để quản lý và xem các chuyến đi của bạn.</p>
          <button onClick={() => setLoginModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors w-full">
            Đăng nhập ngay
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 pb-32 relative">
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

      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 animate-in slide-in-from-left-4 duration-500">Chuyến đi của bạn</h2>
        
        {bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
            <Ticket className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có chuyến đi nào</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Bạn chưa đặt chuyến đi nào trên hệ thống. Hãy khám phá các tour hấp dẫn của chúng tôi!</p>
            <Link href="/tours" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
              Khám phá Tour <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: any, index: number) => (
              <div key={booking.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 border-b border-slate-100 pb-8 mb-8">
                    <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden shrink-0 bg-slate-100 group relative">
                      <img src={booking.tour_image || "https://images.unsplash.com/photo-1596422846543-74c6e271abb1?auto=format&fit=crop&w=600&q=80"} alt={booking.tour_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
                        <h3 className="text-xl font-bold text-slate-900 line-clamp-2 pr-4"><Link href={`/tours/${booking.tour_id}`} className="hover:text-blue-600 transition-colors">{booking.tour_name}</Link></h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex items-start gap-3 text-sm text-slate-600">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Khởi hành</p>
                            <p>{new Date(booking.departure_date).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 text-sm text-slate-600">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Khách</p>
                            <p>{booking.adults} Người lớn{booking.children > 0 ? `, ${booking.children} Trẻ em` : ''}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
                      <div className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-slate-500 font-medium">Mã đặt chỗ:</span>
                        <span className="text-slate-900 font-bold">TB-{booking.id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500 font-medium">Tổng tiền:</span>
                        <span className="text-blue-600 font-bold text-lg">{formatCurrency(booking.total_price)}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0 flex-wrap justify-end">
                      {booking.status === 'Đã hoàn thành' && (
                        booking.is_reviewed ? (
                          <Link 
                            href={`/tours/${booking.tour_id}`}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200 shadow-sm"
                          >
                            <Star className="w-4 h-4" /> Xem đánh giá của bạn
                          </Link>
                        ) : (
                          <button 
                            onClick={() => setReviewBooking(booking)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-amber-50 hover:bg-amber-600 transition-colors shadow-sm shadow-amber-200"
                          >
                            <MessageSquare className="w-4 h-4" /> Đánh giá
                          </button>
                        )
                      )}
                      {(booking.status === 'Đã xác nhận' || booking.status === 'Đã hoàn thành' || booking.status === 'Đang thực hiện') && (
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                          <Download className="w-4 h-4" /> Tải vé
                        </button>
                      )}
                      <Link href={`/tours/${booking.tour_id}`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                        Chi tiết tour <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
