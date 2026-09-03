"use client"

import { useState, useEffect } from 'react'
import type { Tour } from '@/components/tours/TourCard'
import TourCarousel from '@/components/tours/TourCarousel'
import { Sparkles, Flame } from 'lucide-react'

interface RelatedToursProps {
  tourId: number | string
}

export default function RelatedTours({ tourId }: RelatedToursProps) {
  const [tours, setTours] = useState<Tour[]>([])
  const [method, setMethod] = useState<string>('content-based')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        // Get userId from localStorage
        const userStr = localStorage.getItem('user')
        let userId = ''
        if (userStr) {
          const user = JSON.parse(userStr)
          userId = user.id ? `?userId=${user.id}` : ''
        }

        const apiUrl = typeof window !== 'undefined'
            ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api')
            : (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api');
        const response = await fetch(`${apiUrl}/suggestions/related/${tourId}`)
        
        if (response.ok) {
          const data = await response.json()
          setTours((data.tours || []).slice(0, 8))
          setMethod(data.method || 'content-based')
        }
      } catch (error) {
        console.error("Lỗi lấy tour tương tự:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [tourId])

  if (loading || tours.length === 0) {
    return null
  }

  const isPersonalized = method === 'collaborative-filtering' || method === 'personalized'

  return (
    <div className="bg-slate-50 py-16 mt-16 border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
            <Flame className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-black text-slate-900">🌄 Các tour tương tự</h2>
        </div>
        <div className="mt-4">
          <TourCarousel tours={tours} />
        </div>
      </div>
    </div>
  )
}
