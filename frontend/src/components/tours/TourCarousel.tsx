'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TourCard, { Tour } from './TourCard'

interface TourCarouselProps {
  tours: Tour[]
}

export default function TourCarousel({ tours }: TourCarouselProps) {
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
    // Need a slight timeout to ensure DOM is fully rendered before checking scroll
    const timeout = setTimeout(checkScroll, 100)
    window.addEventListener('resize', checkScroll)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', checkScroll)
    }
  }, [tours])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Cuộn bằng chiều dài của khung nhìn trừ đi một chút để người dùng nhận thấy phần tử tiếp theo
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      // Cập nhật state sau khi scroll xong (kết hợp với onScroll)
    }
  }

  return (
    <div className="relative group">
      {/* Scroll Buttons */}
      <div className={`absolute left-0 top-[40%] -translate-y-1/2 -translate-x-1 sm:-translate-x-4 z-10 transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => scroll('left')}
          className="w-10 h-10 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      
      <div className={`absolute right-0 top-[40%] -translate-y-1/2 translate-x-1 sm:translate-x-4 z-10 transition-opacity duration-300 ${canScrollRight && tours.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => scroll('right')}
          className="w-10 h-10 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all focus:outline-none"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-[10px] snap-x snap-mandatory pb-6 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tours.map(tour => (
          <div key={tour.id} className="min-w-[280px] w-[85vw] sm:w-[calc(50%-5px)] lg:w-[calc(25%-7.5px)] flex-shrink-0 snap-start">
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </div>
  )
}
