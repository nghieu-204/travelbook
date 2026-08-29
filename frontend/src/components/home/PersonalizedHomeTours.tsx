"use client"

import { useState, useEffect } from 'react'
import { Tour } from '@/components/tours/TourCard'
import TourCarousel from '@/components/tours/TourCarousel'
import { Sparkles } from 'lucide-react'

import { recommendService } from '@/services/recommendService'
import { useAuthStore } from '@/store/useAuthStore'

export default function PersonalizedHomeTours() {
  const { user } = useAuthStore()
  const [tours, setTours] = useState<Tour[]>([])
  const [reason, setReason] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        
        const userId = user?.id ? Number(user.id) : undefined

        const data = await recommendService.getRecommendations(userId)
        // Limit to 8 tours max for the carousel
        setTours((data.tours || []).slice(0, 8))
        setReason(data.matchReason || '')
      } catch (error) {
        console.error("Lỗi lấy tour gợi ý trang chủ:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user?.id])

  if (loading || tours.length === 0) {
    return null
  }

  const isPersonalized = reason.includes('AI')

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-emerald-500" />
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dành riêng cho bạn</h2>
          </div>
          <p className="text-slate-600">Dựa trên những tour bạn đã quan tâm</p>
        </div>

        <div className="mt-4">
          <TourCarousel tours={tours} />
        </div>
      </div>
    </section>
  )
}
