import { Star } from 'lucide-react'
import FallbackImage from '@/components/ui/FallbackImage'

const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Văn Nam',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    role: 'Khách hàng thân thiết',
    rating: 5,
    content: 'Dịch vụ thật sự tuyệt vời! Hướng dẫn viên rất nhiệt tình, lịch trình hợp lý và giá cả cực kỳ phải chăng. Tôi sẽ tiếp tục ủng hộ TravelBook.'
  },
  {
    id: 2,
    name: 'Trần Thị Mai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    role: 'Nhân viên văn phòng',
    rating: 5,
    content: 'Trải nghiệm book tour cực nhanh và tiện. Mọi thông tin đều rõ ràng minh bạch. Chuyến đi Phú Quốc tuần trước của gia đình tôi rất hoàn hảo!'
  },
  {
    id: 3,
    name: 'Lê Hoàng Phong',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'Travel Blogger',
    rating: 5,
    content: 'Tôi đã đi rất nhiều nơi, nhưng chất lượng dịch vụ ở đây làm tôi bất ngờ. Từ khâu chăm sóc khách hàng đến trải nghiệm thực tế đều đạt chuẩn 5 sao.'
  }
]

export default function Testimonials() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Khách hàng nói gì về chúng tôi?</h2>
          <p className="text-slate-500 mt-2 text-lg">Hàng ngàn du khách đã tin tưởng và trải nghiệm dịch vụ tuyệt vời cùng TravelBook.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col h-full">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed flex-1 mb-8 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                  <FallbackImage 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
