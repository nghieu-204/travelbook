import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import TourGallery from '@/components/tour-detail/TourGallery'
import TourInfo from '@/components/tour-detail/TourInfo'
import BookingWidget from '@/components/tour-detail/BookingWidget'
import TourCard, { Tour } from '@/components/tours/TourCard'
import { fetchApi } from '@/lib/api'

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  let tour: any = null;
  let relatedTours: Tour[] = [];
  
  try {
    const response = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/tours/${resolvedParams.id}`, { cache: 'no-store' });
    if (response.ok) {
      tour = await response.json();
    }
  } catch (error) {
    console.error("Lỗi lấy thông tin tour:", error);
  }

  try {
    const response = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/tours?limit=5`, { next: { revalidate: 3600 } });
    if (response.ok) {
      const all: Tour[] = await response.json();
      relatedTours = all.filter(t => t.id !== Number(resolvedParams.id)).slice(0, 4);
    }
  } catch (error) {
    console.error("Lỗi lấy tour tương tự:", error);
  }

  if (!tour) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-50 min-h-screen">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Tour không tồn tại</h1>
        <Link href="/tours" className="text-blue-600 font-medium hover:underline">Quay lại danh sách tour</Link>
      </div>
    )
  }

  const galleryImages = typeof tour.gallery === 'string' ? JSON.parse(tour.gallery) : (tour.gallery || [tour.image]);

  return (
    <div className="bg-slate-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 px-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href={`/tours`} className="hover:text-blue-600 transition-colors">Trong nước</Link>
          <span>/</span>
          <Link href={`/tours?region=${tour.region}`} className="hover:text-blue-600 transition-colors">{tour.region}</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-xs">{tour.name}</span>
        </div>

        {/* Title Box */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <h1 className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 leading-tight">{tour.name}</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Main Content (60%) */}
          <div className="lg:w-[60%] w-full flex flex-col gap-8">
            <TourGallery images={galleryImages} />
            <TourInfo tour={tour} />
          </div>

          {/* Sidebar Booking (40%) */}
          <div className="lg:w-[40%] w-full">
            <BookingWidget tour={tour} />
          </div>
        </div>
      </div>

      {/* Related Tours */}
      {relatedTours.length > 0 && (
        <div className="bg-slate-50 py-16 mt-16 border-t border-slate-100">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Các tour tương tự có thể bạn quan tâm</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTours.map(t => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
