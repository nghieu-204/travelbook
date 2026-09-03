export default function TourDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
      {/* Title & Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
        </div>
        <div className="h-10 bg-slate-200 rounded-xl w-32 shrink-0"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="w-full h-[350px] md:h-[480px] bg-slate-200 rounded-3xl"></div>
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-24 h-24 md:w-28 md:h-28 bg-slate-200 rounded-2xl shrink-0"></div>
              ))}
            </div>
          </div>
          
          {/* Overview Info */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-12"></div>
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Checkout */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="h-10 bg-slate-200 rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="h-14 bg-slate-200 rounded-xl w-full"></div>
              <div className="h-14 bg-slate-200 rounded-xl w-full"></div>
              <div className="h-14 bg-slate-200 rounded-xl w-full"></div>
            </div>
            <div className="h-12 bg-slate-200 rounded-xl w-full mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
