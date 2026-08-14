export default function TourCardSkeleton() {
  return (
    <div className="flex justify-center w-full h-full">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full w-full max-w-[320px]">
        {/* Image Skeleton */}
        <div className="relative h-[270px] shrink-0 w-full bg-slate-200 animate-pulse"></div>
        {/* Content Skeleton */}
        <div className="flex-1 bg-white rounded-t-xl -mt-5 relative z-10 flex flex-col p-3 pb-3">
          <div className="h-6 bg-slate-200 rounded animate-pulse mb-2"></div>
          <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4 mb-4"></div>
          
          <div className="space-y-2 mt-auto mb-4">
             <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
             <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
          </div>
          
          <div className="border-t border-slate-100 pt-3 flex justify-between items-end mt-auto">
             <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3"></div>
             <div className="h-8 bg-slate-200 rounded animate-pulse w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
