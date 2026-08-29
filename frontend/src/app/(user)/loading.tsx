import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50 w-full">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
    </div>
  )
}
