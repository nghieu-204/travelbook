'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { MapPin, Users, Calendar, ShieldCheck, CheckCircle2, CreditCard, Wallet, Banknote, ChevronLeft, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import { fetchApi } from '@/lib/api'

export default function CheckoutClient({ tour }: { tour: any }) {
  const router = useRouter()
  const { user } = useAuthStore()

  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  })
  
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const [paymentMethod, setPaymentMethod] = useState('office')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const priceAdult = tour?.price || 4990000
  const priceChild = priceAdult * 0.75
  const total = (adults * priceAdult) + (children * priceChild)
  const totalUSD = (total / 25000).toFixed(2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      let paymentLabel = 'Thanh toán trực tiếp';
      if (paymentMethod === 'paypal') paymentLabel = 'PayPal';
      if (paymentMethod === 'momo') paymentLabel = 'MoMo';

      const bookingData = {
        user_id: user?.id || null,
        tour_id: tour.id,
        tour_name: tour.name,
        user_name: formData.fullName,
        user_email: formData.email,
        user_phone: formData.phone,
        departure_date: tour.departure_date,
        adults,
        children,
        total_price: total,
        payment_method: paymentLabel
      }

      await fetchApi('/bookings', {
        method: 'POST',
        data: bookingData
      })
      
      router.push('/bookings')
    } catch (error) {
      console.error("Lỗi đặt tour:", error);
      alert("Đã xảy ra lỗi khi đặt tour. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false)
    }
  }

  const departureDate = tour.departure_date ? new Date(tour.departure_date).toLocaleDateString('vi-VN') : '23/07/2026'

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        <Link href={`/tours/${tour.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Quay lại chi tiết tour
        </Link>
        
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-8">Thanh toán & Đặt tour</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Left Side */}
          <div className="flex-1 space-y-6">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Departure & Guests */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Thông tin chuyến đi
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày khởi hành</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium">
                      {departureDate}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Số lượng khách</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2">
                        <span className="text-sm font-medium text-slate-700">Người lớn</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                            <Minus className="w-4 h-4 text-slate-600" />
                          </button>
                          <span className="w-4 text-center font-bold text-slate-900">{adults}</span>
                          <button type="button" onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                            <Plus className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2">
                        <span className="text-sm font-medium text-slate-700">Trẻ em <span className="text-xs text-slate-400 font-normal">(dưới 11 tuổi)</span></span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                            <Minus className="w-4 h-4 text-slate-600" />
                          </button>
                          <span className="w-4 text-center font-bold text-slate-900">{children}</span>
                          <button type="button" onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                            <Plus className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Thông tin liên hệ
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên *</label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Nhập họ tên của bạn" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Nhập số điện thoại" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Nhập địa chỉ email" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Nhập địa chỉ liên hệ" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  Phương thức thanh toán
                </h2>
                
                <div className="space-y-4">
                  <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'office' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Banknote className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Thanh toán trực tiếp tại văn phòng</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Tiền mặt hoặc quẹt thẻ tại quầy giao dịch</p>
                      </div>
                    </div>
                    <input type="radio" name="payment" value="office" checked={paymentMethod === 'office'} onChange={() => setPaymentMethod('office')} className="w-5 h-5 mt-2 text-blue-600 focus:ring-blue-500" />
                  </label>

                  <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#00457C]/10 flex items-center justify-center shrink-0">
                        <Wallet className="w-5 h-5 text-[#00457C]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Thanh toán qua PayPal</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Thanh toán an toàn bằng tài khoản PayPal hoặc thẻ quốc tế</p>
                        {paymentMethod === 'paypal' && (
                          <div className="mt-2 text-sm font-medium text-blue-700 bg-white inline-block px-3 py-1 rounded-lg border border-blue-100">
                            Tỉ giá ước tính: 1 USD = 25,000 VND
                          </div>
                        )}
                      </div>
                    </div>
                    <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="w-5 h-5 mt-2 text-blue-600 focus:ring-blue-500" />
                  </label>

                  <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'momo' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#A50064]/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-[#A50064]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6H7v6H5V9h2v4h2V9h2v8zm5 0h-2V9h2v8z"/></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Thanh toán qua Ví MoMo</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Quét mã QR tiện lợi qua ứng dụng MoMo</p>
                      </div>
                    </div>
                    <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} className="w-5 h-5 mt-2 text-blue-600 focus:ring-blue-500" />
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar - Right Side */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img src={tour.image || "https://images.unsplash.com/photo-1596422846543-74c6e271abb1?auto=format&fit=crop&w=600&q=80"} alt={tour.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-2 text-sm leading-snug">{tour.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 mt-2 text-xs font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{tour.region || 'Du lịch Việt Nam'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-100 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Người lớn (x{adults})</span>
                  <span className="font-semibold text-slate-900">{(adults * priceAdult).toLocaleString('vi-VN')}đ</span>
                </div>
                {children > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Trẻ em (x{children})</span>
                    <span className="font-semibold text-slate-900">{(children * priceChild).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-emerald-600 font-medium">
                  <span>Giảm giá</span>
                  <span>-0đ</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-slate-900">Tổng cộng</span>
                  <span className="text-2xl font-black text-blue-600 tracking-tight">{total.toLocaleString('vi-VN')}đ</span>
                </div>
                
                {paymentMethod === 'paypal' && (
                  <div className="text-right text-sm font-medium text-slate-500 mt-2 animate-in fade-in">
                    ≈ <span className="text-slate-900">${totalUSD} USD</span>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-sm shadow-blue-200 flex flex-col items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang xử lý...
                  </span>
                ) : (
                  <span>Xác nhận & Thanh toán</span>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Thanh toán bảo mật và mã hóa an toàn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
