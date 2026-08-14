/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Clock, MapPin, Ticket, Users, Edit3, Phone } from 'lucide-react'
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

  const tourCode = tour.tour_code || `TB-${tour.id}`
  const availableSpots = tour.available_spots !== undefined && tour.available_spots !== null ? tour.available_spots : 2
  const departureDate = tour.departure_date ? new Date(tour.departure_date).toLocaleDateString('vi-VN') : '23/07/2026'

  let endDate = '';
  if (tour.departure_date && tour.duration) {
    const daysMatch = tour.duration.match(/(\d+)\s*ngày/i);
    if (daysMatch && daysMatch[1]) {
      const days = parseInt(daysMatch[1]);
      const date = new Date(tour.departure_date);
      date.setDate(date.getDate() + days - 1);
      endDate = date.toLocaleDateString('vi-VN');
    }
  }

  return (
    <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
      {/* Price & Date */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-slate-500 font-medium text-xs">Giá:</span>
          <span className="text-2xl lg:text-3xl font-bold text-blue-600 tracking-tight">{pricePerAdult.toLocaleString('vi-VN')}đ</span>
        </div>
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
            <span className="font-medium">Xuất phát:</span>
          </div>
          <span className="text-blue-600 font-bold text-right">{tour.departure_location || "TP. Hồ Chí Minh"}</span>
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
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Ngày đi:</span>
          </div>
          <span className="text-blue-600 font-bold text-right">{departureDate}</span>
        </div>

        {endDate && (
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Ngày về:</span>
            </div>
            <span className="text-blue-600 font-bold text-right">{endDate}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Số chỗ còn:</span>
          </div>
          <span className="text-blue-600 font-bold text-right">Còn {availableSpots} chỗ</span>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <div className="relative group shrink-0">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg border border-slate-200 whitespace-nowrap pointer-events-none z-10">
            Gửi yêu cầu hỗ trợ ngay
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-slate-200 transform rotate-45"></div>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new Event('openChatbot'))}
            className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all shadow-md overflow-hidden hover:scale-105 border-2 border-slate-100 hover:border-blue-400 focus:outline-none"
          >
            <Image src="/images/chatbot-avatar.png" alt="Chatbot Hỗ Trợ" width={48} height={48} className="object-cover w-full h-full" />
          </button>
        </div>
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
