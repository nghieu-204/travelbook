import Link from 'next/link'
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react'
import TourCard, { Tour } from '@/components/tours/TourCard'

interface TourSectionProps {
  title: string
  category: 'Trong nước' | 'Ngoài nước'
  pills: string[]
  tours: Tour[]
}

export default function TourSection({ title, category, pills, tours }: TourSectionProps) {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
          <Link 
            href={`/tours?category=${encodeURIComponent(category)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-colors group self-start md:self-auto"
          >
            Xem thêm 
            <div className="w-6 h-6 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {pills.map((pill, index) => (
            <Link 
              key={pill}
              href={`/tours?category=${encodeURIComponent(category)}&destination=${encodeURIComponent(pill)}`}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border ${index === 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:border-slate-400 hover:bg-slate-50'}`}
            >
              {pill}
            </Link>
          ))}
        </div>

        {/* Tour Grid */}
        {tours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tours.slice(0, 4).map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            Đang cập nhật các tour {category.toLowerCase()} mới nhất...
          </div>
        )}
      </div>
    </section>
  )
}
