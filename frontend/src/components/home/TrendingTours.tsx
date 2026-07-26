import Link from 'next/link'
import { Star, MapPin, Clock } from 'lucide-react'

export default async function TrendingTours() {
  let tours = [];
  try {
    const res = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/tours?limit=4`, { next: { revalidate: 3600 } });
    if (res.ok) {
      tours = await res.json();
      tours = tours.slice(0, 4); // Lấy 4 tour đầu tiên
    }
  } catch (e) {
    console.error("Lỗi lấy TrendingTours:", e);
  }

  if (tours.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Tour Nổi Bật Nhất</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Những điểm đến được yêu thích nhất trong tháng này. Hãy đặt ngay để không bỏ lỡ cơ hội trải nghiệm tuyệt vời.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tours.map((tour: any) => (
            <Link href={`/tours/${tour.id}`} key={tour.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={tour.image} alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {tour.rating || "5.0"} ({tour.reviews_count || 120})
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
                  <span className="text-lg font-black text-red-600">{Number(tour.price).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
