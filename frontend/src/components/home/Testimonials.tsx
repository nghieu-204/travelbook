import { Star } from 'lucide-react'
import FallbackImage from '@/components/ui/FallbackImage'

// Testimonials now fetched dynamically from database

import Link from 'next/link'

export default async function Testimonials() {
  let testimonials = [];
  try {
    const res = await fetch(`${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/reviews/testimonials`, { cache: 'no-store' });
    if (res.ok) {
      testimonials = await res.json();
    }
  } catch (e) {
    console.error("Lỗi lấy Testimonials:", e);
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Khách hàng nói gì về chúng tôi?</h2>
          <p className="text-slate-500 mt-2 text-lg">Hàng ngàn du khách đã tin tưởng và trải nghiệm dịch vụ tuyệt vời cùng TravelBook.</p>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar">
          {testimonials.map((testimonial: { id: number; name: string; avatar: string; role: string; rating: number; content: string; tour_id: number; user_avatar: string; user_name: string; comment: string; tour_name: string }) => (
            <div key={testimonial.id} className="min-w-[85vw] sm:min-w-[380px] md:min-w-[400px] flex-shrink-0 snap-center">
              <Link href={`/tours/${testimonial.tour_id}`} className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col h-full hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all group">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed flex-1 mb-6 italic group-hover:text-slate-900 transition-colors line-clamp-6">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                
                <div className="bg-slate-50 p-3 rounded-xl mb-6 text-sm text-slate-500 font-medium border border-slate-100 flex-shrink-0">
                  Chuyến đi: <span className="text-teal-600 group-hover:text-teal-700">{testimonial.tour_name}</span>
                </div>

                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                    <FallbackImage 
                      src={testimonial.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'} 
                      alt={testimonial.user_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{testimonial.user_name}</h4>
                    <div className="text-sm text-slate-500">Khách hàng TravelBook</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
