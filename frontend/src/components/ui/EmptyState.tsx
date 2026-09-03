import { SearchX, PackageOpen, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  type?: 'search' | 'data' | 'error'
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export default function EmptyState({ 
  type = 'data', 
  title, 
  description, 
  actionLabel, 
  actionHref, 
  onAction 
}: EmptyStateProps) {
  const Icon = type === 'search' ? SearchX : type === 'error' ? AlertCircle : PackageOpen
  const colorClass = type === 'error' ? 'text-red-500 bg-red-50 border-red-100' : 'text-slate-400 bg-slate-50 border-slate-100'
  const actionColorClass = type === 'error' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm text-center w-full">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border ${colorClass}`}>
        <Icon className="w-10 h-10" />
      </div>
      <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">{title}</h2>
      {description && (
        <p className="text-slate-500 max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
          {description}
        </p>
      )}
      
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link href={actionHref} className={`px-6 py-2.5 font-bold rounded-full transition-colors ${actionColorClass}`}>
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className={`px-6 py-2.5 font-bold rounded-full transition-colors ${actionColorClass}`}>
            {actionLabel}
          </button>
        )
      )}
    </div>
  )
}
