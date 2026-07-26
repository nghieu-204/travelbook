import { Expand } from 'lucide-react'

export default function TourGallery({ images = [] }: { images?: string[] }) {
  // Dùng ảnh mặc định nếu không có
  const displayImages = images.length >= 7 ? images : [
    images[0] || "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
    images[1] || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80",
    images[2] || "https://images.unsplash.com/photo-1620959407303-3631cc9bbab4?auto=format&fit=crop&w=600&q=80",
    images[3] || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
    images[4] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
    images[5] || "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=600&q=80",
    images[6] || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80",
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Ảnh chính to */}
      <div className="relative w-full h-[350px] md:h-[480px] rounded-3xl overflow-hidden group cursor-pointer shadow-sm border border-slate-100">
        <img src={displayImages[0]} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <button className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-slate-700 p-2.5 rounded-full shadow-lg transition-all hover:scale-110">
          <Expand className="w-5 h-5" />
        </button>
      </div>
      
      {/* Danh sách ảnh nhỏ ngang */}
      <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 snap-x">
        {displayImages.map((img, idx) => (
          <div key={idx} className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all snap-start shadow-sm">
            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}
