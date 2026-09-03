import { Star } from 'lucide-react'
import FallbackImage from '@/components/ui/FallbackImage'

// Testimonials now fetched dynamically from database

import TestimonialsCarousel from './TestimonialsCarousel'

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
    <section className="py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Khách hàng nói gì về chúng tôi?</h2>
          <p className="text-slate-500 mt-2 text-lg">Hàng ngàn du khách đã tin tưởng và trải nghiệm dịch vụ tuyệt vời cùng TravelBook.</p>
        </div>

        <TestimonialsCarousel testimonials={testimonials} />
      </div>
    </section>
  )
}
