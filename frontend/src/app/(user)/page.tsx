import Hero from '@/components/home/Hero'
import TrendingTours from '@/components/home/TrendingTours'
import BestSellingTours from '@/components/home/BestSellingTours'
import Testimonials from '@/components/home/Testimonials'
import CTABanner from '@/components/home/CTABanner'
import PopularDestinations from '@/components/home/PopularDestinations'
import PersonalizedHomeTours from '@/components/home/PersonalizedHomeTours'
import RecentlyViewedTours from '@/components/home/RecentlyViewedTours'

export default function Home() {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Hero />
      
      <div className="container mx-auto px-4 mt-16 flex flex-col gap-12">
        {/* Khối Tour đã xem gần đây */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <RecentlyViewedTours />
        </div>

        {/* Khối Tour dành riêng cho bạn (AI Cá nhân hóa) */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <PersonalizedHomeTours />
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <TrendingTours />
        </div>
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <BestSellingTours />
        </div>
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <PopularDestinations />
        </div>
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <Testimonials />
        </div>
        
        <div className="rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <CTABanner />
        </div>
      </div>
    </div>
  );
}
