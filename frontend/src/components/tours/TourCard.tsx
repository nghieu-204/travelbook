import Link from 'next/link'
import { Star, MapPin, Clock } from 'lucide-react'

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
    <Link href={`/tours/${tour.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img src={tour.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'} alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-700 flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {tour.rating} ({tour.reviews})
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2">
          <MapPin className="w-3 h-3" /> {tour.location}
        </div>
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{tour.name}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Clock className="w-3 h-3" /> {tour.duration}
        </div>
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Giá từ</span>
          <span className="text-lg font-black text-red-600">{tour.price.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>
    </Link>
  )
}
