export default function TableSkeleton({ rows = 5, darkMode = false }: { rows?: number, darkMode?: boolean }) {
  const bg = darkMode ? 'bg-[#0f172a]' : 'bg-white'
  const border = darkMode ? 'border-slate-800' : 'border-slate-100'
  const pulse = darkMode ? 'bg-slate-800' : 'bg-slate-200'
  const headerBg = darkMode ? 'bg-slate-900' : 'bg-slate-50'

  return (
    <div className={`w-full ${bg} rounded-2xl shadow-sm border ${border} overflow-hidden animate-pulse`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b ${border} ${headerBg}`}>
        <div className={`h-6 ${pulse} rounded w-1/4`}></div>
        <div className={`h-10 ${pulse} rounded-lg w-1/3`}></div>
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Table Head */}
          <div className={`grid grid-cols-6 gap-4 py-4 px-6 ${headerBg} border-b ${border}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-4 ${pulse} rounded w-1/2`}></div>
            ))}
          </div>

          {/* Table Body */}
          <div className={`divide-y ${darkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
            {[...Array(rows)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-4 px-6 items-center">
                <div className={`h-4 ${pulse} rounded w-3/4`}></div>
                <div className={`h-4 ${pulse} rounded w-1/2`}></div>
                <div className={`h-4 ${pulse} rounded w-full`}></div>
                <div className={`h-6 ${pulse} rounded-full w-20`}></div>
                <div className={`h-4 ${pulse} rounded w-1/2`}></div>
                <div className={`h-8 ${pulse} rounded-lg w-8`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer / Pagination */}
      <div className={`flex items-center justify-between p-4 border-t ${border}`}>
        <div className={`h-4 ${pulse} rounded w-32`}></div>
        <div className="flex gap-2">
          <div className={`h-8 w-8 ${pulse} rounded-lg`}></div>
          <div className={`h-8 w-8 ${pulse} rounded-lg`}></div>
          <div className={`h-8 w-8 ${pulse} rounded-lg`}></div>
        </div>
      </div>
    </div>
  )
}
