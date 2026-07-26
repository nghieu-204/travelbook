import TourFilter from '@/components/tours/TourFilter'
import TourCard, { Tour } from '@/components/tours/TourCard'
import TourSection from '@/components/home/TourSection'
import { ChevronLeft, ChevronRight, SearchX, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { fetchApi } from '@/lib/api'

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
  const maxPrice = maxPriceStr ? Number(maxPriceStr) : 20000000
  
  // Xây dựng chuỗi query gửi lên backend
  const apiParams = new URLSearchParams();
  if (query) apiParams.append('keyword', query);
  if (maxPrice > 0) apiParams.append('maxPrice', maxPrice.toString());
  
  // Backend chỉ hỗ trợ 1 region tại 1 thời điểm trong controller hiện tại
  if (regions.length > 0) {
    const regionMap: Record<string, string> = { 'Bắc': 'Miền Bắc', 'Trung': 'Miền Trung', 'Nam': 'Miền Nam' }
    apiParams.append('region', regionMap[regions[0]] || regions[0]);
  }
  
  if (durations.length > 0) {
    if (durations.includes('1-2')) apiParams.append('duration', '1-3');
    else if (durations.includes('3-4')) apiParams.append('duration', '4-5');
    else if (durations.includes('5+')) apiParams.append('duration', 'Trên 5');
  }

  // Gọi API lấy danh sách tours
  let filteredTours: Tour[] = [];
  try {
    const response = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/tours?${apiParams.toString()}`, { cache: 'no-store' });
    if (response.ok) {
      filteredTours = await response.json();
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tour:", error);
  }

  // Lọc thêm theo rating ở client/server component do backend chưa hỗ trợ param rating
  if (rating > 0) {
    filteredTours = filteredTours.filter(tour => tour.rating >= rating)
  }

  let recommendedTours: Tour[] = [];
  try {
    const response = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/tours?limit=4`, { cache: 'no-store' });
    if (response.ok) {
      const all: Tour[] = await response.json();
      recommendedTours = all.slice(0, 4);
    }
  } catch (error) {
    console.error("Lỗi lấy tour nổi bật:", error);
  }

  // --- LOGIC: IS LANDING MODE? ---
  // Nếu người dùng chỉ vào `/tours` mà chưa chọn bất kỳ bộ lọc nào thì hiển thị Landing Page
  const isLandingMode = Object.keys(params).length === 0;

  let domesticTours: Tour[] = [];
  let internationalTours: Tour[] = [];
  
  if (isLandingMode) {
    try {
      const resDom = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/tours?category=Trong+nước`, { cache: 'no-store' });
      if (resDom.ok) domesticTours = await resDom.json();
      
      const resInt = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/tours?category=Ngoài+nước`, { cache: 'no-store' });
      if (resInt.ok) internationalTours = await resInt.json();
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
          <div className="pb-16 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            {/* 1. Tour Nội Địa */}
            <TourSection 
              title="Các tour trọn gói nội địa" 
              category="Trong nước" 
              pills={domesticPills} 
              tours={domesticTours} 
            />
            <div className="w-full h-px bg-gray-100 my-4"></div>
            
            {/* 2. Tour Quốc Tế */}
            <TourSection 
              title="Các tour trọn gói quốc tế" 
              category="Ngoài nước" 
              pills={intlPills} 
              tours={internationalTours} 
            />

            {/* 3. Tour Nổi Bật */}
            {recommendedTours.length > 0 && (
              <div className="pt-8 px-4 pb-8 container mx-auto">
                <div className="w-full h-px bg-gray-100 mb-12"></div>
                <div className="flex items-center gap-3 mb-8 justify-center">
                  <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Tour nổi bật nhất</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {recommendedTours.map(tour => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter (25%) */}
          <aside className="lg:w-1/4 w-full">
            <TourFilter />
          </aside>

          {/* Content (75%) */}
          <div className="lg:w-3/4 w-full">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold text-slate-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                Hiển thị <span className="text-blue-600 font-bold">{filteredTours.length}</span> tour phù hợp
              </span>
              <select className="border-slate-200 rounded-xl px-4 py-2 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer font-medium text-slate-700">
                <option>Sắp xếp: Phổ biến nhất</option>
                <option>Giá: Thấp đến Cao</option>
                <option>Giá: Cao đến Thấp</option>
              </select>
            </div>

            {filteredTours.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {filteredTours.map(tour => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mb-16 bg-white py-3 px-6 rounded-full shadow-sm border border-slate-100 inline-flex w-max mx-auto">
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
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
