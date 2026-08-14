import TourCardSkeleton from '@/components/tours/TourCardSkeleton'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function LoadingTours() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />
          <span className="font-semibold text-slate-900">Danh sách Tour</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Filter Skeleton */}
          <div className="w-full lg:w-72 shrink-0">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[600px] animate-pulse">
                <div className="h-6 w-1/2 bg-slate-200 rounded mb-8"></div>
                <div className="space-y-6">
                  {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-5 w-1/3 bg-slate-200 rounded"></div>
                      <div className="h-4 w-full bg-slate-200 rounded"></div>
                      <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 w-full min-w-0">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex justify-between h-[64px] animate-pulse"></div>
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
               {Array.from({length: 9}).map((_, i) => (
                 <TourCardSkeleton key={i} />
               ))}
             </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
