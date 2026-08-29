export default function LoadingTourDetail() {
  return (
    <div className="bg-slate-50 pb-20 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs Skeleton */}
        <div className="w-64 h-5 bg-slate-200 rounded animate-pulse mb-6"></div>

        {/* Title Box Skeleton */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8 h-24 animate-pulse">
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Main Content (60%) */}
          <div className="lg:w-[60%] w-full flex flex-col gap-8">
            {/* Gallery Skeleton */}
            <div className="w-full aspect-video bg-slate-200 rounded-3xl animate-pulse"></div>
            
            {/* Info Skeleton */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-96 animate-pulse">
               <div className="w-1/3 h-8 bg-slate-200 rounded mb-6"></div>
               <div className="space-y-4">
                 <div className="w-full h-4 bg-slate-200 rounded"></div>
                 <div className="w-full h-4 bg-slate-200 rounded"></div>
                 <div className="w-5/6 h-4 bg-slate-200 rounded"></div>
               </div>
            </div>
          </div>

          {/* Sidebar Booking (40%) */}
          <div className="lg:w-[40%] w-full">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[500px] sticky top-24 animate-pulse">
               <div className="w-1/2 h-8 bg-slate-200 rounded mb-8"></div>
               <div className="space-y-6">
                 <div className="w-full h-12 bg-slate-200 rounded"></div>
                 <div className="w-full h-12 bg-slate-200 rounded"></div>
                 <div className="w-full h-14 bg-blue-100 rounded"></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
