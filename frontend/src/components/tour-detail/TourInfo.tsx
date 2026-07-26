'use client'

import { Check, X, MapPin, ChevronRight, ChevronDown, Info, ShieldAlert, Banknote, Utensils } from 'lucide-react'
import { useState, useEffect } from 'react'

const ITINERARY_IMAGES = [
  "https://images.unsplash.com/photo-1596422846543-74c6e271abb1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1506461883276-594a12b11dc3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1547448415-e9f5b28e570d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80"
];

const defaultItineraryData = [
  {
    day: 1,
    date: 'Thứ 2, 26 thg 10',
    title: 'Hà Nội - Vịnh Hạ Long',
    fullDetails: `08:00 - Xe đón quý khách tại điểm hẹn, khởi hành đi Hạ Long.

12:00 - Đến bến cảng, lên du thuyền và thưởng thức bữa trưa chào mừng.

14:30 - Thăm quan Hang Sửng Sốt, chèo Kayak tại khu vực Hang Luồn.

19:00 - Thưởng thức bữa tối sang trọng trên boong tàu. Tham gia các hoạt động câu mực đêm.`
  },
  {
    day: 2,
    date: 'Thứ 3, 27 thg 10',
    title: 'Hạ Long - Hà Nội',
    fullDetails: `06:30 - Tập Thái Cực Quyền trên Sundeck, ngắm bình minh tuyệt đẹp.

07:30 - Bữa sáng nhẹ nhàng phục vụ tại nhà hàng.

08:30 - Thăm quan Đảo Ti Tốp, tắm biển hoặc leo núi ngắm toàn cảnh Vịnh.

11:00 - Trả phòng và ăn trưa sớm. 

12:30 - Tàu cập bến, quý khách lên xe trở về Hà Nội.`
  }
]

export default function TourInfo({ tour }: { tour?: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [openPolicy, setOpenPolicy] = useState<number | null>(0)

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isModalOpen])

  if (!tour) return null;

  const itinerary = tour.itinerary ? (typeof tour.itinerary === 'string' ? JSON.parse(tour.itinerary) : tour.itinerary) : defaultItineraryData;
  const included = tour.included ? (typeof tour.included === 'string' ? JSON.parse(tour.included) : tour.included) : ["Xe đưa đón khứ hồi", "Khách sạn tiêu chuẩn", "Các bữa ăn theo chương trình"];
  const excluded = tour.excluded ? (typeof tour.excluded === 'string' ? JSON.parse(tour.excluded) : tour.excluded) : ["Chi phí cá nhân", "Tiền tip cho HDV"];

  const tabs = [
    { id: 'gioi-thieu', label: 'Giới thiệu', icon: Info },
    { id: 'bao-gom', label: 'Giá bao gồm', icon: Check },
    { id: 'khong-bao-gom', label: 'Không bao gồm', icon: X },
    { id: 'phu-thu', label: 'Phụ thu', icon: Banknote },
    { id: 'huy-tour', label: 'Hủy tour', icon: ShieldAlert },
  ]

  return (
    <div className="space-y-10">
      {/* Tour Highlights */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Những địa điểm tham quan nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-100 p-1 rounded-full mt-0.5"><Check className="w-4 h-4 text-emerald-600" /></div>
            <span className="text-slate-700 font-medium">Khám phá các di tích lịch sử và văn hóa đặc sắc</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-emerald-100 p-1 rounded-full mt-0.5"><Check className="w-4 h-4 text-emerald-600" /></div>
            <span className="text-slate-700 font-medium">Trải nghiệm ẩm thực địa phương phong phú</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-emerald-100 p-1 rounded-full mt-0.5"><Check className="w-4 h-4 text-emerald-600" /></div>
            <span className="text-slate-700 font-medium">Lưu trú tại khách sạn cao cấp, dịch vụ chu đáo</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-emerald-100 p-1 rounded-full mt-0.5"><Check className="w-4 h-4 text-emerald-600" /></div>
            <span className="text-slate-700 font-medium">Hướng dẫn viên nhiệt tình, chuyên nghiệp suốt tuyến</span>
          </div>
        </div>
      </section>

      {/* Itinerary Accordion / Vertical Timeline */}
      <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Lịch trình</h2>
        <div className="flex flex-col">
          {itinerary.map((item: any, idx: number) => (
            <div key={idx} className={`border-b border-slate-100 last:border-b-0`}>
              <div 
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center justify-between py-5 cursor-pointer select-none group`}
              >
                <div className="flex flex-col gap-1.5 pr-4">
                  <h3 className={`font-bold text-base md:text-[17px] transition-colors group-hover:text-blue-600 text-slate-900`}>
                    {String(item.day).toLowerCase().startsWith('ngày') ? item.day : `Ngày ${item.day}`}: {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Utensils className="w-4 h-4" />
                    <span>Ăn sáng, trưa, tối</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tour Description */}
      {tour.description && (
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4">Giới thiệu tour</h2>
          <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-line">
            {tour.description}
          </p>
        </section>
      )}

      {/* Policies Accordion */}
      <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6">Những thông tin cần lưu ý</h2>
        <div className="flex flex-col">
          {[
            {
              title: 'Giá tour bao gồm',
              content: (
                <ul className="space-y-3">
                  {included.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="bg-emerald-100 p-1 rounded-full mt-0.5"><Check className="w-4 h-4 text-emerald-600" /></div>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              )
            },
            {
              title: 'Giá tour không bao gồm',
              content: (
                <ul className="space-y-3">
                  {excluded.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="bg-red-100 p-1 rounded-full mt-0.5"><X className="w-4 h-4 text-red-600" /></div>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              )
            },
            {
              title: 'Thông tin Visa',
              content: <p className="text-slate-700 leading-relaxed">- Khách mang quốc tịch Việt Nam không cần xin Visa.<br/>- Khách mang quốc tịch nước ngoài cần kiểm tra lại với tư vấn viên.</p>
            },
            {
              title: 'Lưu ý giá trẻ em',
              content: <p className="text-slate-700 leading-relaxed">- Trẻ em dưới 2 tuổi: Miễn phí (ngủ chung giường với người lớn).<br/>- Trẻ em từ 2 đến dưới 11 tuổi: 75% giá tour người lớn.<br/>- Trẻ em từ 11 tuổi trở lên: Tính bằng giá tour người lớn.</p>
            },
            {
              title: 'Điều kiện thanh toán',
              content: <p className="text-slate-700 leading-relaxed">- Đặt cọc 50% tổng giá trị tour khi đăng ký.<br/>- Thanh toán phần còn lại trước 15 ngày khởi hành.</p>
            },
            {
              title: 'Điều kiện đăng ký',
              content: <p className="text-slate-700 leading-relaxed">- Cung cấp danh sách đoàn gồm đầy đủ các thông tin cá nhân.<br/>- Hộ chiếu hoặc CCCD còn hạn sử dụng ít nhất 6 tháng.</p>
            },
            {
              title: 'Lưu ý về chuyển hoặc hủy tour',
              content: <p className="text-slate-700 leading-relaxed">- Quý khách vui lòng thông báo bằng văn bản hoặc email và được công ty xác nhận.<br/>- Các yêu cầu chuyển/hủy qua điện thoại sẽ không được giải quyết.</p>
            },
            {
              title: 'Các điều kiện hủy tour đối với ngày thường',
              content: <ul className="space-y-2 text-slate-700"><li>- Hủy trước 15 ngày khởi hành: Hoàn 100% tiền cọc.</li><li>- Hủy từ 08 - 14 ngày trước khởi hành: Phạt 50% giá tour.</li><li>- Hủy từ 04 - 07 ngày trước khởi hành: Phạt 70% giá tour.</li><li>- Hủy trong vòng 03 ngày trước khởi hành: Phạt 100% giá tour.</li></ul>
            },
            {
              title: 'Các điều kiện hủy tour đối với ngày lễ, Tết',
              content: <p className="text-slate-700 leading-relaxed">- Các tour Lễ/Tết là các tour có thời gian diễn ra rơi vào một trong các ngày nghỉ Lễ/Tết theo quy định.<br/>- Phạt 100% giá trị tour nếu hủy chuyến với mọi lý do.</p>
            },
            {
              title: 'Trường hợp bất khả kháng',
              content: <p className="text-slate-700 leading-relaxed">- Trong những trường hợp bất khả kháng như đình công, khủng bố, thiên tai... công ty sẽ giữ quyền thay đổi lộ trình để đảm bảo sự thuận tiện và an toàn cho du khách, và không chịu trách nhiệm bồi thường những thiệt hại phát sinh.</p>
            }
          ].map((policy, idx) => (
            <div key={idx} className="border-b border-slate-100 last:border-b-0">
              <div 
                onClick={() => setOpenPolicy(openPolicy === idx ? null : idx)}
                className="flex items-center justify-between py-5 cursor-pointer select-none group"
              >
                <h3 className={`font-bold text-base transition-colors group-hover:text-blue-600 ${openPolicy === idx ? 'text-blue-600' : 'text-slate-800'}`}>
                  {policy.title}
                </h3>
                <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${openPolicy === idx ? 'rotate-180 text-blue-600' : ''}`} />
              </div>
              {openPolicy === idx && (
                <div className="pb-6 animate-in slide-in-from-top-2">
                  {policy.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Itinerary Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm p-4 pt-16 md:py-12 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl flex flex-col shadow-2xl max-h-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 md:p-8 pb-4 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-900">Lịch trình</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors absolute top-6 right-6 md:top-8 md:right-8 bg-white shadow-sm border border-slate-100"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
              <div className="absolute left-[39px] md:left-[55px] top-10 bottom-10 w-0.5 bg-slate-200"></div>
              
              <div className="space-y-12 relative">
                {itinerary.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-6 md:gap-8">
                    <div className="relative z-10 shrink-0 mt-6">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-sm">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5 text-blue-500 fill-blue-500/20" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="rounded-3xl border border-slate-100 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                        {/* Card Top */}
                        <div className="flex flex-col-reverse md:flex-row bg-blue-50">
                          <div className="flex-1 p-6 flex flex-col justify-center">
                            <h3 className="text-blue-600 font-black text-lg md:text-xl mb-1">
                              {String(item.day).toLowerCase().startsWith('ngày') ? item.day : `Ngày ${item.day}`}
                            </h3>
                            <h4 className="text-slate-900 font-bold text-lg md:text-xl mb-2">{item.title}</h4>
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                              <Utensils className="w-4 h-4" />
                              <span>Ăn sáng, trưa, tối</span>
                            </div>
                          </div>
                          <div className="h-48 md:h-auto md:w-5/12 shrink-0">
                            <img 
                              src={item.image || ITINERARY_IMAGES[idx % ITINERARY_IMAGES.length]} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        {/* Card Bottom */}
                        <div className="p-6 md:p-8 bg-white text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line border-t border-blue-100/50">
                          <p className="font-semibold text-slate-800 mb-3 text-base">Hoạt động chính:</p>
                          {item.fullDetails || item.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
