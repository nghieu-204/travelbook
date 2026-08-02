import Hero from '@/components/home/Hero'
import TrendingTours from '@/components/home/TrendingTours'
import BestSellingTours from '@/components/home/BestSellingTours'
import Testimonials from '@/components/home/Testimonials'
import CTABanner from '@/components/home/CTABanner'
import PopularDestinations from '@/components/home/PopularDestinations'

export default function Home() {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Hero />
      
      <div className="container mx-auto px-4 mt-16 flex flex-col gap-12">
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
