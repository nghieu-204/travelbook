'use client'

import { useRouter } from 'next/navigation'
import { Clock, MapPin, Ticket, Users, Award, Edit3, Phone } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function BookingWidget({ tour }: { tour: any }) {
  const router = useRouter()
  const { user, setLoginModalOpen } = useAuthStore()
  
  const pricePerAdult = tour?.price || 4990000

  const handleBook = () => {
    if (!user) {
      setLoginModalOpen(true)
    } else {
      router.push(`/tours/${tour.id}/checkout`)
    }
  }

  if (!tour) return null;

  const tourCode = `NDSGN846-132-${tour.id?.toString().padStart(6, '0')}XE-V`
  const availableSpots = tour.available_spots || 2
  const departureDate = tour.departure_date ? new Date(tour.departure_date).toLocaleDateString('vi-VN') : '23/07/2026'

  return (
    <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
      {/* Price & Date */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-slate-500 font-medium text-xs">Giá:</span>
          <span className="text-2xl lg:text-3xl font-bold text-blue-600 tracking-tight">{pricePerAdult.toLocaleString('vi-VN')}đ</span>
        </div>
        <button className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
          <span className="font-bold text-xs">{departureDate}</span>
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info List */}
      <div className="space-y-3.5 mb-6">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Ticket className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Mã tour:</span>
          </div>
          <span className="text-blue-600 font-bold truncate max-w-[55%] text-right">{tourCode}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Khởi hành:</span>
          </div>
          <span className="text-blue-600 font-bold text-right">TP. Hồ Chí Minh</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Thời gian:</span>
          </div>
          <span className="text-blue-600 font-bold text-right">{tour.duration || "4 ngày 3 đêm"}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Số chỗ còn:</span>
          </div>
          <span className="text-blue-600 font-bold text-right">Còn {availableSpots} chỗ</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Award className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Chỉ số:</span>
          </div>
          <span className="text-blue-600 font-bold text-right">LEI: 74/100 | ESG: 82/100</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="w-12 h-12 shrink-0 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition-colors shadow-md">
          <Phone className="w-5 h-5 fill-current" />
        </button>
        <button 
          onClick={handleBook}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-base font-bold rounded-full transition-colors shadow-md flex items-center justify-center"
        >
          Đặt ngay
        </button>
      </div>
    </div>
  )
}
