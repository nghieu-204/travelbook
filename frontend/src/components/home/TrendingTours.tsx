import TourCard from '@/components/tours/TourCard'
import type { Tour } from '@/components/tours/TourCard'
import TourCarousel from '@/components/tours/TourCarousel'

export default async function TrendingTours() {
  let tours = [];
  try {
    const res = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/tours?limit=8&sort=latest`, { cache: 'no-store' });
    if (res.ok) {
      tours = await res.json();
    }
  } catch (e) {
    console.error("Lỗi lấy TrendingTours:", e);
  }

  if (tours.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-2 sm:px-4 max-w-[1380px]">
        <div className="mb-8 px-2">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Tour mới nhất</h2>
          <p className="text-slate-500 mt-2 text-lg">Khám phá những hành trình du lịch thú vị vừa được chúng tôi cập nhật.</p>
        </div>

        <TourCarousel tours={tours} />
      </div>
    </section>
  )
}
