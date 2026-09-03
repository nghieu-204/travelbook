import TableSkeleton from '@/components/ui/skeletons/TableSkeleton'

export default function LoadingAdminBookings() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-slate-800 rounded animate-pulse"></div>
        </div>
      </div>
      <TableSkeleton rows={7} darkMode={true} />
    </div>
  )
}
