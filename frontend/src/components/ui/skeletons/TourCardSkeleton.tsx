export default function TourCardSkeleton() {
  return (
    <div className="flex justify-center w-full h-full">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 relative flex flex-col h-full w-full max-w-[320px] animate-pulse">
        
        {/* Image Section */}
        <div className="relative h-[270px] shrink-0 w-full bg-slate-200">
          <div className="absolute bottom-6 right-3 bg-slate-300 w-24 h-7 rounded-full"></div>
        </div>

        {/* Content Section */}
        <div className="flex-1 bg-white rounded-t-xl -mt-5 relative z-10 flex flex-col p-3 pb-3">
          
          {/* Reason Label */}
          <div className="mb-1.5 w-3/4 h-5 bg-slate-200 rounded-md self-start"></div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <div className="w-12 h-4 bg-slate-200 rounded"></div>
            <div className="w-16 h-4 bg-slate-200 rounded"></div>
          </div>

          {/* Title */}
          <div className="flex items-start gap-1.5 mb-2">
            <div className="shrink-0 mt-0.5 rounded-full bg-slate-200 w-5 h-5"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>

          {/* Info Columns */}
          <div className="flex items-center justify-between mb-3 px-0.5 mt-2">
            <div className="w-24 h-3 bg-slate-200 rounded"></div>
            <div className="w-16 h-3 bg-slate-200 rounded"></div>
          </div>

          {/* Price Section */}
          <div className="mt-auto pt-2">
            <div className="w-12 h-3 bg-slate-200 rounded mb-1"></div>
            <div className="w-24 h-5 bg-slate-200 rounded"></div>
          </div>
        </div>

        {/* Button */}
        <div className="absolute bottom-0 right-0 z-20">
          <div className="bg-slate-200 w-24 h-9 rounded-tl-2xl"></div>
        </div>
      </div>
    </div>
  )
}
