'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { fetchApi } from '@/lib/api'

export default function TourTracker({ tourId }: { tourId: number }) {
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.id) {
      // Gọi API tracking ghi nhận hành vi "view"
      fetchApi('/recommendations/tracking', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          tourId,
          interactionType: 'view'
        })
      }).catch(err => console.error("Lỗi tracking:", err))
    }
  }, [user, tourId])

  return null
}
