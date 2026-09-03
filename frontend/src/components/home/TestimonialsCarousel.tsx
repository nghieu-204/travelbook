'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'
import FallbackImage from '@/components/ui/FallbackImage'

interface TestimonialsCarouselProps {
  testimonials: any[]
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(checkScroll, 100)
    window.addEventListener('resize', checkScroll)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', checkScroll)
    }
  }, [testimonials])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative group">
      {/* Scroll Buttons */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-6 z-10 transition-opacity duration-300 hidden sm:block ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => scroll('left')}
          className="w-12 h-12 bg-white hover:bg-slate-50 text-slate-900 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all focus:outline-none border border-slate-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-6 z-10 transition-opacity duration-300 hidden sm:block ${canScrollRight && testimonials.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => scroll('right')}
          className="w-12 h-12 bg-white hover:bg-slate-50 text-slate-900 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all focus:outline-none border border-slate-100"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-1 custom-scrollbar hide-scrollbar-mobile [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((testimonial: any) => (
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
  )
}
