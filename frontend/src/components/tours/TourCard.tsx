import Link from 'next/link'
import { MapPin, Clock, Award, Eye } from 'lucide-react'
import FallbackImage from '@/components/ui/FallbackImage'

export interface Tour {
  id: number
  name: string
  destinations?: Array<{ id: number, name: string, is_primary: number }>
  price: number
  rating: number
  reviews: number
  duration: string
  image: string
  category?: string
  region?: string
  province?: string
  country?: string
  reason?: string
  tags?: string
  badge?: string
}

import { generateSlug } from '@/lib/utils'

export default function TourCard({ tour }: { tour: Tour }) {

  // Generate SEO URL
  let href = `/tours/${tour.id}`
  if (tour.category && tour.region && tour.country && tour.province) {
    href = `/${generateSlug(tour.category)}/${generateSlug(tour.region)}/${generateSlug(tour.country)}/${generateSlug(tour.province)}/${generateSlug(tour.name)}-${tour.id}`
  } else if (tour.category && tour.region && tour.province) {
    href = `/${generateSlug(tour.category)}/${generateSlug(tour.region)}/${generateSlug(tour.province)}/${generateSlug(tour.name)}-${tour.id}`
  } else if (tour.category && tour.region) {
    href = `/${generateSlug(tour.category)}/${generateSlug(tour.region)}/${generateSlug(tour.name)}-${tour.id}`
  }
  
  return (
    <div className="flex justify-center w-full h-full">
      <Link href={href}
        className="group bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 border border-slate-200 relative flex flex-col h-full w-full max-w-[320px]"
      >

        {/* Image Section */}
        <div className="relative h-[270px] shrink-0 w-full bg-slate-100">
          <FallbackImage
            src={tour.image}
            alt={tour.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />


          {/* Xem nhanh badge placed dynamically above the info box overlap */}
          <div className="absolute bottom-6 right-3 z-30">
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[12px] font-medium text-amber-400 flex items-center gap-1.5 shadow-md hover:bg-black transition-colors">
              <Eye className="w-3.5 h-3.5" />
              <span>Xem nhanh</span>
            </div>
          </div>
        </div>

        {/* Content Section - natural height, overlapping image with negative margin */}
        <div className="flex-1 bg-white rounded-t-xl -mt-5 relative z-10 flex flex-col p-3 pb-3">
          {/* Reason Label */}
          {tour.reason && (
            <div className="mb-1.5 text-[11px] font-medium text-[#0046b8] bg-blue-50 px-2 py-1 rounded-md self-start border border-blue-100/50">
              {tour.reason === 'content_based' ? '✨ Tương tự tour bạn đã xem' :
               tour.reason === 'collaborative' ? '🤝 Người có chung sở thích cũng chọn' :
               tour.reason === 'popular' ? '🔥 Tour được nhiều người quan tâm' : ''}
            </div>
          )}

          {/* Tags */}
          {tour.tags && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tour.tags.split(',').slice(0, 3).map((tag, idx) => {
                const t = tag.trim();
                if (!t) return null;
                return (
                  <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                    {t}
                  </span>
                );
              })}
            </div>
          )}

          {/* Title */}
          <div className="flex items-start gap-1.5 mb-2">
            <div className="shrink-0 mt-0.5 rounded-full bg-amber-50 p-1">
              <Award className="w-3.5 h-3.5 text-amber-600 fill-amber-100" />
            </div>
            <h3 className="font-bold text-slate-800 text-[14px] line-clamp-2 leading-snug group-hover:text-[#0046b8] transition-colors">
              {tour.name}
            </h3>
          </div>

          {/* Info Columns */}
          <div className="flex items-center justify-between mb-3 px-0.5">
            <div className="flex items-center gap-1 text-[12px] text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.5} />
              <span className="truncate max-w-[120px]" title={tour.destinations?.map(d => d.name).join(' - ')}>
                {tour.destinations && tour.destinations.length > 2 
                  ? `${tour.destinations[0].name} - ${tour.destinations[1].name} và ${tour.destinations.length - 2} điểm khác`
                  : tour.destinations?.map(d => d.name).join(' - ') || 'Nhiều điểm đến'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[12px] text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.5} />
              <span>{tour.duration}</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="mt-auto pt-2">
            <div className="text-[11px] text-slate-500 mb-0.5">Giá từ:</div>
            <div className="text-[18px] font-black text-[#0046b8] leading-none mb-1">
              {tour.price.toLocaleString('vi-VN')}đ
            </div>
          </div>
        </div>

        {/* Huge absolute button flush to bottom right */}
        <div className="absolute bottom-0 right-0 z-20">
          <div className="bg-[#0046b8] hover:bg-blue-800 text-white text-[13px] font-semibold px-4 pt-2 pb-2.5 rounded-tl-2xl transition-colors flex items-center justify-center">
            Xem chi tiết
          </div>
        </div>
      </Link>
    </div>
  )
}
