'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Tour } from '@/components/tours/TourCard'
import TourCarousel from '@/components/tours/TourCarousel'

interface TourSectionProps {
  title: string
  category: 'Trong nước' | 'Quốc tế'
  pills: string[]
  tours: Tour[]
}

export default function TourSection({ title, category, pills, tours }: TourSectionProps) {
  const allPills = ['Tất cả', ...pills];
  const [activeTab, setActiveTab] = useState('Tất cả');

  // Filter tours by active tab
  let displayTours = tours;
  if (activeTab !== 'Tất cả') {
    displayTours = tours.filter(t => {
      const tabStr = activeTab.toLowerCase();
      const matchName = t.name?.toLowerCase().includes(tabStr);
      const matchDest = t.destinations?.some(d => d.name?.toLowerCase().includes(tabStr));
      const matchCountry = t.country?.toLowerCase().includes(tabStr);
      const matchRegion = t.region?.toLowerCase().includes(tabStr);
      return matchName || matchDest || matchCountry || matchRegion;
    });
  }
  
  // Take max 8
  displayTours = displayTours.slice(0, 8);

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-2 sm:px-4 max-w-[1380px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
          <Link 
            href={`/tours?category=${encodeURIComponent(category)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-colors group self-start md:self-auto"
          >
            Xem thêm 
            <div className="w-6 h-6 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 mb-8 px-2">
          {allPills.map((pill) => {
            const isActive = activeTab === pill;
            return (
              <button 
                key={pill}
                onClick={() => setActiveTab(pill)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-gray-200 hover:border-slate-400 hover:bg-slate-50'}`}
              >
                {pill}
              </button>
            )
          })}
        </div>

        {/* Tour Carousel */}
        {displayTours.length > 0 ? (
          <TourCarousel tours={displayTours} />
        ) : (
          <div className="text-center py-16 text-slate-500 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
            <span className="text-4xl mb-3">🗺️</span>
            <span>Chưa có tour nào ở <strong className="text-slate-700">{activeTab}</strong> được mở bán...</span>
            <button 
              onClick={() => setActiveTab('Tất cả')} 
              className="mt-4 text-blue-600 font-semibold hover:underline"
            >
              Xem tất cả tour {category.toLowerCase()}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
