'use client'

import { useEffect } from 'react'
import EmptyState from '@/components/ui/EmptyState'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Lỗi ứng dụng:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <EmptyState 
          type="error"
          title="Đã có lỗi xảy ra!"
          description="Hệ thống gặp sự cố không mong muốn. Vui lòng thử lại sau."
          actionLabel="Thử lại ngay"
          onAction={() => reset()}
        />
      </div>
    </div>
  )
}
