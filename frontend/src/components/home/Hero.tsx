'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

export default function Hero() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const { isListening, startListening, stopListening } = useSpeechRecognition()

  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening((text) => {
        setDestination(text)
      })
    }
  }

  return (
    <div className="relative h-[600px] flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
          Khám Phá Thế Giới Theo Cách Của Bạn
        </h1>
        <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto drop-shadow">
          Hàng ngàn điểm đến tuyệt vời đang chờ đón bạn. Trải nghiệm dịch vụ đặt tour đẳng cấp và an toàn nhất.
        </p>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-full shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2">

          {/* Destination with Voice Search */}
          <div className="relative flex-1 w-full md:w-auto">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Bạn muốn đi đâu?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-full outline-none text-slate-700 bg-transparent"
            />
            <button
              onClick={handleVoiceSearch}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300",
                isListening ? "bg-red-100 text-red-500 animate-pulse" : "hover:bg-slate-100 text-blue-500"
              )}
            >
              <Mic className="w-5 h-5" />
              {isListening && (
                <span className="absolute -bottom-8 right-0 text-xs font-bold text-red-500 whitespace-nowrap bg-white px-2 py-1 rounded shadow-lg border border-red-100 before:absolute before:-top-1 before:right-3 before:w-2 before:h-2 before:bg-white before:border-t before:border-l before:border-red-100 before:rotate-45">
                  Đang nghe...
                </span>
              )}
            </button>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200"></div>

          {/* Start Date */}
          <div className="relative flex-1 w-full md:w-auto">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="date"
              className="w-full pl-12 pr-4 py-3 rounded-full outline-none text-slate-700 bg-transparent"
            />
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200"></div>

          {/* End Date */}
          <div className="relative flex-1 w-full md:w-auto">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="date"
              className="w-full pl-12 pr-4 py-3 rounded-full outline-none text-slate-700 bg-transparent"
            />
          </div>

          <button 
            onClick={() => router.push(`/tours${destination ? `?q=${encodeURIComponent(destination)}` : ''}`)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Tìm Kiếm
          </button>
        </div>
      </div>
    </div>
  )
}
