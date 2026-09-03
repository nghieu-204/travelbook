export default function Loading() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="w-64 h-6 bg-slate-200 rounded animate-pulse mb-8"></div>
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-pulse min-h-[400px]">
          <div className="h-8 w-1/3 bg-slate-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-slate-200 rounded"></div>
            <div className="h-4 w-full bg-slate-200 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
