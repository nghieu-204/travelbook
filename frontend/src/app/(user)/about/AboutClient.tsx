'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Star, Globe } from 'lucide-react'
import CountUp from '@/components/ui/CountUp'

export default function AboutClient() {
  const [showSection1, setShowSection1] = useState(false)
  const [showSection2, setShowSection2] = useState(false)
  const [showSection3, setShowSection3] = useState(false)
  
  const section1Ref = useRef<HTMLElement>(null)
  const section2Ref = useRef<HTMLElement>(null)
  const section3Ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (entry.target === section1Ref.current) setShowSection1(true)
            if (entry.target === section2Ref.current) setShowSection2(true)
            if (entry.target === section3Ref.current) setShowSection3(true)
          }
        })
      },
      { threshold: 0.1 }
    )
    
    if (section1Ref.current) observer.observe(section1Ref.current)
    if (section2Ref.current) observer.observe(section2Ref.current)
    if (section3Ref.current) observer.observe(section3Ref.current)
    
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-white min-h-screen">
      {/* Khối 1: Kinh Nghiệm Và Công Ty (Được đưa lên đầu) */}
      <section ref={section1Ref} className="py-24 bg-[#F4F5F4] overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Upper section */}
          <div className={`transition-all duration-1000 transform ${showSection1 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16`}>
            
            {/* Left Spacer & Badge */}
            <div className="lg:col-span-4 relative flex items-start">
              <div className="inline-flex items-center px-6 py-2 bg-[#F1F8F1] text-[#64A346] border border-[#D5E9D1] font-bold rounded-full text-sm">
                Về chúng tôi
              </div>
              
              {/* Circle Badge (Desktop Only) */}
              <div className="hidden lg:flex absolute top-32 right-0 translate-x-1/2 items-center justify-center w-[160px] h-[160px] rounded-full border-[6px] border-slate-50 bg-white shadow-xl z-10">
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Chúng tôi có</span>
                  <h3 className="text-5xl font-black text-slate-800">5+</h3>
                </div>
                <div className="absolute -top-1 right-0 bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full transform rotate-[15deg] shadow-md">
                  Năm kinh nghiệm
                </div>
              </div>
            </div>
            
            {/* Right Content */}
            <div className="lg:col-span-8 pl-0 lg:pl-16">
              <h2 className="text-3xl md:text-[42px] font-bold text-slate-800 leading-[1.2] mb-6">
                Kinh Nghiệm Và Công Ty Du Lịch Chuyên Nghiệp Ở Việt Nam
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-[15px]">
                Chúng tôi chuyên tạo ra những trải nghiệm thành phố khó quên cho du khách muốn khám phá trái tim và tâm hồn của cảnh quan đô thị. Các tour du lịch có hướng dẫn viên chuyên nghiệp của chúng tôi sẽ đưa du khách qua những con phố sôi động, các địa danh lịch sử và những viên ngọc ẩn giấu của mỗi thành phố.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <span className="text-[15px] font-bold text-slate-700">Cơ quan Trải nghiệm</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <span className="text-[15px] font-bold text-slate-700">Đội ngũ Chuyên nghiệp</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <span className="text-[15px] font-bold text-slate-700">Du lịch Chi phí Thấp</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <span className="text-[15px] font-bold text-slate-700">Hỗ trợ Trực tuyến 24/7</span>
                </div>
              </div>
              
              <Link href="/tours" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-slate-300 text-slate-700 font-bold rounded-full hover:border-slate-800 hover:text-slate-900 transition-colors">
                Khám Phá Tours <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Lower section images */}
          <div className={`transition-all duration-1000 delay-300 transform ${showSection1 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[350px]`}>
            {/* Image 1 */}
            <div className="relative rounded-3xl overflow-hidden h-[250px] md:h-full">
              <Image 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" 
                alt="Traveler" 
                fill 
                className="object-cover" 
              />
            </div>
            
            {/* Image 2 */}
            <div className="relative rounded-3xl overflow-hidden h-[250px] md:h-full">
              <Image 
                src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80" 
                alt="Traveler" 
                fill 
                className="object-cover" 
              />
            </div>
            
            {/* Stats Cards */}
            <div className="flex flex-col gap-6 h-full">
              {/* Orange Card */}
              <div className="bg-[#F0932B] flex-1 rounded-3xl p-8 flex flex-col justify-center text-white relative overflow-hidden shadow-lg shadow-orange-500/20">
                <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center mb-5">
                  <Star className="w-6 h-6 text-white fill-white" />
                </div>
                <h4 className="text-[17px] font-bold mb-3">Chúng tôi là công ty đạt giải thưởng</h4>
                <p className="text-[13px] opacity-90 leading-relaxed text-white/90">
                  Tại Pinnacle Business Solutions cam kết về sự xuất sắc và đổi mới đã đạt được
                </p>
              </div>
              
              {/* Green Card */}
              <div className="bg-[#64A346] h-[110px] rounded-3xl p-6 flex items-center gap-5 text-white shadow-lg shadow-green-600/20">
                <Globe className="w-11 h-11 opacity-90" />
                <div>
                  <h4 className="text-[28px] font-black leading-none mb-1">5000+</h4>
                  <p className="text-[13px] font-semibold text-white/90">Điểm đến du lịch phổ biến</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Khối 2: Du Lịch Với Sự Tự Tin (Bố cục chia 2 cột như trong ảnh) */}
      <section ref={section2Ref} className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Khối chữ (trượt từ trái sang) */}
            <div className={`transition-all duration-1000 transform ${showSection2 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <h2 className="text-3xl md:text-[42px] font-bold text-slate-800 leading-[1.2] mb-6">
                Du Lịch Với Sự Tự Tin Lý Do Hàng Đầu Để Chọn Công Ty Của Chúng Tôi
              </h2>
              <p className="text-slate-500 mb-10 leading-relaxed text-[15px]">
                Chúng tôi hợp tác chặt chẽ với khách hàng để hiểu rõ những thách thức và mục tiêu, cung cấp các giải pháp tùy chỉnh để nâng cao hiệu quả, tăng lợi nhuận và thúc đẩy tăng trưởng bền vững.
              </p>
              
              <div className="flex gap-12 mb-10">
                <div>
                  <h3 className="text-4xl font-bold text-slate-800 mb-2"><CountUp end={150} suffix="+" /></h3>
                  <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide">Điểm đến phổ biến</p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-slate-800 mb-2"><CountUp end={35} suffix="k+" /></h3>
                  <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide">Khách hàng hài lòng</p>
                </div>
              </div>
              
              <Link href="/tours" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#64A346] text-white font-bold rounded-full hover:bg-green-700 transition-colors">
                Khám Phá Các Điểm Đến <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Khối hình ảnh (trượt từ phải sang với độ trễ) */}
            <div className={`transition-all duration-1000 delay-300 transform ${showSection2 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'} relative h-[450px] md:h-[500px] rounded-[32px] overflow-hidden shadow-2xl`}>
              <Image 
                src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1920&q=80" 
                alt="Camper Van" 
                fill
                className="object-cover"
              />
            </div>
            
          </div>
        </div>
      </section>
    </div>
  )
}
