"use client"

import { useState, useEffect } from 'react'
import { Tour } from '@/components/tours/TourCard'
import TourCarousel from '@/components/tours/TourCarousel'
import { History } from 'lucide-react'

import { recommendService } from '@/services/recommendService'
import { useAuthStore } from '@/store/useAuthStore'

export default function RecentlyViewedTours() {
  const { user } = useAuthStore()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        setLoading(true)
        
        // Chỉ lấy user id khi đã đăng nhập
        const userId = user?.id ? Number(user.id) : undefined
        if (!userId) {
          setTours([])
          return
        }

        const data = await recommendService.getRecentlyViewed(userId)
        setTours(Array.isArray(data) ? data.slice(0, 4) : [])
      } catch (error) {
        console.error("Lỗi lấy tour đã xem gần đây:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentlyViewed()
  }, [user?.id])

  if (loading || tours.length === 0) {
    return null
  }

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-2 sm:px-4 max-w-[1380px]">
        <div className="mb-8 px-2">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Đã xem gần đây</h2>
          </div>
          <p className="text-slate-500 mt-2 text-lg">Các tour bạn vừa xem qua</p>
        </div>

        <TourCarousel tours={tours} />
      </div>
    </section>
  )
}
