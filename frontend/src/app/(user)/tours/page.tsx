import TourFilter from '@/components/tours/TourFilter'
import TourCard, { Tour } from '@/components/tours/TourCard'
import { tourService } from '@/services/tourService'
import TourSection from '@/components/home/TourSection'
import PopularDestinations from '@/components/home/PopularDestinations'
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import Link from 'next/link'
import TourSort from '@/components/tours/TourSort'

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;

  // Trích xuất các query parameter từ URL
  const query = typeof params.q === 'string' ? params.q : ''
  const regions = Array.isArray(params.region) ? params.region : params.region ? [params.region] : []
  const ratingStr = typeof params.rating === 'string' ? params.rating : ''
  const rating = ratingStr ? Number(ratingStr) : 0
  const durations = Array.isArray(params.duration) ? params.duration : params.duration ? [params.duration] : []
  const maxPriceStr = typeof params.maxPrice === 'string' ? params.maxPrice : ''
  const maxPrice = maxPriceStr ? Math.min(Number(maxPriceStr), 20000000) : 20000000
  const minPriceStr = typeof params.minPrice === 'string' ? params.minPrice : ''
  const minPrice = minPriceStr ? Number(minPriceStr) : 0
  const locationParams = Array.isArray(params.location) ? params.location : params.location ? [params.location] : []
  const destinationParams = Array.isArray(params.destination) ? params.destination : params.destination ? [params.destination] : []
  const destinations = [...locationParams, ...destinationParams]
  const tourTypes = Array.isArray(params.tourType) ? params.tourType : params.tourType ? [params.tourType] : []
  const departureLocations = Array.isArray(params.departureLocation) ? params.departureLocation : params.departureLocation ? [params.departureLocation] : []

  const categoryStr = typeof params.category === 'string' ? params.category : ''
  const sort = typeof params.sort === 'string' ? params.sort : 'popular'

  // Xây dựng chuỗi query gửi lên backend
  const apiParams = new URLSearchParams();
  if (query) apiParams.append('keyword', query);
  if (categoryStr) apiParams.append('category', categoryStr);
  if (maxPrice > 0 && maxPrice < 20000000) apiParams.append('maxPrice', maxPrice.toString());

  // Backend chỉ hỗ trợ 1 region tại 1 thời điểm trong controller hiện tại
  if (regions.length > 0) {
    const regionMap: Record<string, string> = { 'Bắc': 'Miền Bắc', 'Trung': 'Miền Trung', 'Nam': 'Miền Nam' }
    regions.forEach(r => apiParams.append('region', regionMap[r] || r));
  }
  
  if (destinations.length > 0) {
    destinations.forEach(d => apiParams.append('location', d));
  }

  if (tourTypes.length > 0) {
    tourTypes.forEach(t => apiParams.append('tourtype', t));
  }

  if (departureLocations.length > 0) {
    departureLocations.forEach(dl => apiParams.append('departureLocation', dl));
  }

  if (minPrice > 0) {
    apiParams.append('minPrice', minPrice.toString());
  }

  if (durations.length > 0) {
    if (durations.includes('1-2')) apiParams.append('duration', '1-3');
    else if (durations.includes('3-4')) apiParams.append('duration', '4-5');
    else if (durations.includes('5+')) apiParams.append('duration', 'Trên 5');
  }

  // Gọi API lấy danh sách tours
  let filteredTours: Tour[] = [];
  try {
    filteredTours = await tourService.getTours(apiParams.toString());
  } catch (error) {
    console.error("Lỗi gọi API tours:", error);
  }
  if (rating > 0) {
    filteredTours = filteredTours.filter(tour => tour.rating >= rating)
  }

  // Sắp xếp
  if (sort === 'price_asc') {
    filteredTours.sort((a, b) => a.price - b.price)
  } else if (sort === 'price_desc') {
    filteredTours.sort((a, b) => b.price - a.price)
  }

  // Luôn lấy gợi ý (ví dụ top 4 tours)
  let recommendedTours: Tour[] = [];
  try {
    const all = await tourService.getTours({ limit: '4' });
    recommendedTours = all.slice(0, 4);
  } catch (error) {
    console.error("Lỗi gọi API recommend:", error);
  }

  // --- LOGIC: IS LANDING MODE? ---
  // Nếu người dùng chỉ vào `/tours` mà chưa chọn bất kỳ bộ lọc nào thì hiển thị Landing Page
  const isLandingMode = Object.keys(params).length === 0;

  let domesticTours: Tour[] = [];
  let internationalTours: Tour[] = [];

  if (isLandingMode) {
    try {
      domesticTours = await tourService.getTours({ category: 'Trong nước', limit: '50' });
      internationalTours = await tourService.getTours({ category: 'Quốc tế', limit: '50' });
    } catch (error) {
      console.error("Lỗi lấy danh sách landing tour:", error);
    }
  }

  const domesticPills = ['Hà Nội', 'Đà Nẵng', 'Đà Lạt', 'Phú Quốc', 'Cần Thơ', 'TP. Hồ Chí Minh'];
  const intlPills = ['Trung Quốc', 'Thái Lan', 'Singapore', 'Hàn Quốc', 'Mỹ', 'Nhật Bản', 'Đài Loan'];

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Banner / Header bằng hình ảnh */}
      <div className="relative w-full h-[250px] mb-8 bg-slate-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80"
          alt="Travel Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          suppressHydrationWarning
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-10">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-md">
              {query ? `Kết quả tìm kiếm cho: "${params.q}"` : 'Thế Giới Trong Tầm Tay'}
            </h1>
            <p className="text-white/90 text-lg font-medium drop-shadow max-w-xl">
              Khám phá hàng ngàn điểm đến tuyệt vời, dịch vụ đẳng cấp và giá cả hợp lý nhất.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {isLandingMode ? (
          <div className="flex flex-col gap-12">
            {/* 1. Tour Nội Địa */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
              <TourSection
                title="Các tour trong nước"
                category="Trong nước"
                pills={domesticPills}
                tours={domesticTours}
              />
            </div>

            {/* 2. Tour Quốc Tế */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
              <TourSection
                title="Các tour quốc tế"
                category="Quốc tế"
                pills={intlPills}
                tours={internationalTours}
              />
            </div>

            {/* 3. Tour Nổi Bật */}
            {recommendedTours.length > 0 && (
              <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 pt-12 pb-20 px-4 md:px-8">
                <div className="mb-6">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Tour nổi bật nhất</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[10px] container mx-auto">
                  {recommendedTours.map(tour => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>
              </div>
            )}

            {/* 4. Điểm đến nổi bật */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
              <PopularDestinations />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filter (25%) */}
            <aside className="lg:w-1/4 w-full">
              <TourFilter 
                initialCategory={categoryStr}
                initialRegions={regions}
                initialDestinations={destinations}
                initialTourTypes={tourTypes}
                initialDepartureLocations={departureLocations}
                initialDurations={durations}
                initialMinPrice={minPrice}
                initialMaxPrice={maxPrice}
                initialRating={rating}
              />
            </aside>

            {/* Content (75%) */}
            <div className="lg:w-3/4 w-full">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-semibold text-slate-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                  Hiển thị <span className="text-blue-600 font-bold">{filteredTours.length}</span> tour phù hợp
                </span>
                <TourSort />
              </div>

              {filteredTours.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                    {filteredTours.map(tour => (
                      <TourCard key={tour.id} tour={tour} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center w-full mb-16">
                    <div className="flex justify-center items-center gap-2 bg-white py-3 px-6 rounded-full shadow-sm border border-slate-100 inline-flex w-max">
                      <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-30" disabled={true}>
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-md">1</button>
                      {filteredTours.length > 6 && (
                        <button className="w-10 h-10 rounded-full hover:bg-slate-100 font-medium text-slate-700 flex items-center justify-center transition-colors">2</button>
                      )}
                      <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm text-center mb-16">
                  <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                    <SearchX className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-3">Không tìm thấy tour nào!</h2>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Rất tiếc, không có tour nào thỏa mãn bộ lọc hiện tại của bạn. Vui lòng thử xóa bộ lọc hoặc tìm với từ khóa khác.
                  </p>
                  <Link href="/tours" className="px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-full hover:bg-blue-100 transition-colors">
                    Xóa tất cả bộ lọc
                  </Link>
                </div>
              )}

              {/* Mục Gợi ý: Các tour nổi bật */}
              {recommendedTours.length > 0 && (
                <div className="mt-12">
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Các tour nổi bật nhất tuần</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recommendedTours.map((tour, index) => (
                      <TourCard key={`rec-${tour.id || index}`} tour={tour} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
