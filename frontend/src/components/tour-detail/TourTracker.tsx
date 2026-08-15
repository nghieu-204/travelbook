'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { recommendService } from '@/services/recommendService'

export default function TourTracker({ tourId }: { tourId: number }) {
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.id) {
      const trackView = async () => {
        try {
          await recommendService.trackTourView(tourId, user.id)
        } catch (err) {
          console.error("Lỗi tracking:", err)
        }
      }
      trackView()
    }
  }, [user, tourId])

  return null
}
