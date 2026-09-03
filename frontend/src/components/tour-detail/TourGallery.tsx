/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { Expand, X, ChevronLeft, ChevronRight } from 'lucide-react'
import FallbackImage from '@/components/ui/FallbackImage'

export default function TourGallery({ images = [] }: { images?: string[] }) {
  // Chỉ dùng ảnh thật được truyền vào, hoặc 1 ảnh mặc định nếu không có ảnh nào
  const displayImages = images && images.length > 0 ? images : [
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"
  ];

  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Xử lý phím ESC để đóng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
      if (e.key === 'ArrowRight') setMainImageIndex(prev => (prev + 1) % displayImages.length);
      if (e.key === 'ArrowLeft') setMainImageIndex(prev => (prev - 1 + displayImages.length) % displayImages.length);
    }
    if (isFullScreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Chống scroll khi mở modal
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }
  }, [isFullScreen, displayImages.length]);

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Ảnh chính to */}
        <div 
          onClick={() => setIsFullScreen(true)}
          className="relative w-full h-[350px] md:h-[480px] rounded-3xl overflow-hidden group cursor-pointer shadow-sm border border-slate-100"
        >
          <FallbackImage src={displayImages[mainImageIndex]} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <button aria-label="Phóng to ảnh" className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-slate-700 p-2.5 rounded-full shadow-lg transition-all hover:scale-110">
            <Expand className="w-5 h-5" />
          </button>
        </div>
        
        {/* Danh sách ảnh nhỏ ngang */}
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 snap-x">
          {displayImages.map((img, idx) => (
            <div 
              key={idx} 
              onClick={() => setMainImageIndex(idx)}
              className={`shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all snap-start shadow-sm ${
                mainImageIndex === idx 
                  ? 'border-blue-500 opacity-100' 
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <FallbackImage src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Modal Phóng to Ảnh */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm">
          {/* Nút đóng */}
          <button 
            aria-label="Đóng"
            onClick={() => setIsFullScreen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Nút lùi */}
          {displayImages.length > 1 && (
            <button 
              aria-label="Ảnh trước"
              onClick={(e) => { e.stopPropagation(); setMainImageIndex(prev => (prev - 1 + displayImages.length) % displayImages.length); }}
              className="absolute left-4 md:left-12 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all z-50"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Ảnh chính trong modal */}
          <div 
            className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 md:p-12 flex items-center justify-center cursor-default"
            onClick={() => setIsFullScreen(false)} // Bấm ra ngoài để đóng
          >
            <FallbackImage 
              src={displayImages[mainImageIndex]} 
              alt="Fullscreen" 
              className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg"
              onClick={(e) => e.stopPropagation()} // Chống đóng khi bấm vào ảnh
            />
          </div>

          {/* Nút tiến */}
          {displayImages.length > 1 && (
            <button 
              aria-label="Ảnh tiếp theo"
              onClick={(e) => { e.stopPropagation(); setMainImageIndex(prev => (prev + 1) % displayImages.length); }}
              className="absolute right-4 md:right-12 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all z-50"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          
          {/* Counter */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 font-medium tracking-widest text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
            {mainImageIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  )
}
