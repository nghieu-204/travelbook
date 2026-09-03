import TourDetailSkeleton from '@/components/ui/skeletons/TourDetailSkeleton'

export default function LoadingTourDetail() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm h-[56px] w-full"></div>
      <TourDetailSkeleton />
    </div>
  )
}
