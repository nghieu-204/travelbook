import Link from 'next/link'
import { MapPin, Clock, Award } from 'lucide-react'
import FallbackImage from '@/components/ui/FallbackImage'

export interface Tour {
  id: number
  name: string
  location: string
  price: number
  rating: number
  reviews: number
  duration: string
  image: string
}

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <div className="flex justify-center w-full h-full">
      <Link href={`/tours/${tour.id}`} 
        className="group relative flex flex-col h-full w-full max-w-[320px] mx-auto"
      >
        
        {/* Image Section - Takes ~80% of visual weight */}
        <div className="relative h-[320px] shrink-0 w-full rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 bg-slate-100">
          <FallbackImage 
            src={tour.image} 
            alt={tour.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Content Section - 2 blocks design, slightly narrower (1px margin each side = 2px smaller) */}
        <div className="flex-1 bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative z-10 flex flex-col p-3 pb-3 mx-[1px] -mt-10 group-hover:-translate-y-1 transition-transform duration-300">
          {/* Title */}
          <div className="flex items-start gap-1.5 mb-2">
            <div className="shrink-0 mt-0.5 rounded-full bg-amber-50 p-1">
              <Award className="w-3.5 h-3.5 text-amber-600 fill-amber-100" />
            </div>
            <h3 className="font-bold text-slate-800 text-[14px] line-clamp-2 leading-snug group-hover:text-[#0046c1] transition-colors">
              {tour.name}
            </h3>
          </div>

          {/* Info Columns */}
          <div className="flex items-center justify-between mb-3 px-0.5">
            <div className="flex items-center gap-1 text-[12px] text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.5} /> 
              <span className="truncate max-w-[120px]">{tour.location}</span>
            </div>
            <div className="flex items-center gap-1 text-[12px] text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.5} /> 
              <span>{tour.duration}</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="mt-auto pt-2 border-t border-slate-50 relative">
            <div className="text-[11px] text-slate-500 mb-0.5">Giá từ:</div>
            <div className="text-[18px] font-black text-[#0046c1] leading-none mb-1">
              {tour.price.toLocaleString('vi-VN')}đ
            </div>
          </div>
          
          {/* Huge absolute button flush to bottom right of the info block */}
          <div className="absolute bottom-0 right-0 z-20 overflow-hidden rounded-br-xl rounded-tl-2xl">
            <div className="bg-[#0046c1] hover:bg-blue-800 text-white text-[13px] font-semibold px-4 pt-2 pb-2.5 transition-colors flex items-center justify-center">
              Xem chi tiết
            </div>
          </div>
        </div>

      </Link>
    </div>
  )
}
