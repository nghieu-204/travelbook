/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import TourGallery from '@/components/tour-detail/TourGallery'
import TourInfo from '@/components/tour-detail/TourInfo'
import BookingWidget from '@/components/tour-detail/BookingWidget'
import TourCard, { Tour } from '@/components/tours/TourCard'
import TourTracker from '@/components/tour-detail/TourTracker'
import RelatedTours from '@/components/tour-detail/RelatedTours'
import { fetchApi } from '@/lib/api'
import { generateSlug } from '@/lib/utils'

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  let tour: any = null;
  try {
    const response = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/tours/${resolvedParams.id}`, { cache: 'no-store' });
    if (response.ok) {
      tour = await response.json();
    }
  } catch (error) {
    console.error("Lỗi lấy thông tin tour:", error);
  }

  if (!tour) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-50 min-h-screen">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Tour không tồn tại</h1>
        <Link href="/tours" className="text-blue-600 font-medium hover:underline">Quay lại danh sách tour</Link>
      </div>
    )
  }

  let parsedGallery = [];
  if (typeof tour.gallery === 'string') {
    try { parsedGallery = JSON.parse(tour.gallery) } catch (e) {}
  } else if (Array.isArray(tour.gallery)) {
    parsedGallery = tour.gallery;
  }
  const galleryImages = [tour.image, ...parsedGallery].filter(Boolean);

  return (
    <div className="bg-slate-50 pb-20">
      <TourTracker tourId={Number(resolvedParams.id)} />
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 px-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          
          {tour.category && (
            <>
              <span>/</span>
              <Link href={`/${generateSlug(tour.category)}`} className="hover:text-blue-600 transition-colors">{tour.category}</Link>
            </>
          )}
          
          {tour.category && tour.region && (
            <>
              <span>/</span>
              <Link href={`/${generateSlug(tour.category)}/${generateSlug(tour.region)}`} className="hover:text-blue-600 transition-colors">{tour.region}</Link>
            </>
          )}

          {tour.category && tour.region && tour.country && (
            <>
              <span>/</span>
              <Link href={`/${generateSlug(tour.category)}/${generateSlug(tour.region)}/${generateSlug(tour.country)}`} className="hover:text-blue-600 transition-colors">{tour.country}</Link>
            </>
          )}

          {tour.category && tour.region && tour.province && (
            <>
              <span>/</span>
              <Link href={`/${generateSlug(tour.category)}/${generateSlug(tour.region)}${tour.country ? `/${generateSlug(tour.country)}` : ''}/${generateSlug(tour.province)}`} className="hover:text-blue-600 transition-colors">{tour.province}</Link>
            </>
          )}

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

      {/* Related Tours (Personalized via Client Component) */}
      <RelatedTours tourId={resolvedParams.id} />
    </div>
  )
}
