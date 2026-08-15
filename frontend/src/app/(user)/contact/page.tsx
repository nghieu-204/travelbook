/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Phone, Mail, Send, CheckCircle, ChevronRight, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { contactService } from '@/services/contactService'
import Image from 'next/image'
import Link from 'next/link'

export default function ContactPage() {
  const { user } = useAuthStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    subject: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  
  // Animation states
  const [showSection2, setShowSection2] = useState(false)
  const section2Ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowSection2(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (section2Ref.current) observer.observe(section2Ref.current)
    return () => observer.disconnect()
  }, [])

  // Auto-fill user info if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Định dạng email không hợp lệ. Vui lòng kiểm tra lại!");
      return;
    }
    setIsSubmitting(true)
    try {
      await contactService.createContact({
        user_name: formData.name,
        user_email: formData.email,
        user_phone: formData.phone,
        contact_date: formData.date || null,
        subject: formData.subject || 'Liên hệ từ khách hàng',
        message: formData.message
      })
      setShowToast(true)
      setFormData({ name: user?.name || '', email: user?.email || '', phone: '', date: '', subject: '', message: '' })
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      alert("Có lỗi xảy ra khi gửi liên hệ, vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-6 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle className="w-6 h-6" />
          <span className="font-bold">Gửi yêu cầu thành công, quản trị viên sẽ liên hệ với bạn qua email.</span>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative h-[250px] bg-slate-900 flex items-center">
        <div className="absolute inset-0 z-0">
           <Image 
             src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80" 
             alt="Contact Banner" 
             fill
             className="object-cover opacity-30"
             priority
           />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-between mt-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Liên hệ</h1>
        </div>
      </section>

      {/* Khối 1: Header / Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left side text */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-[42px] font-bold text-slate-800 leading-[1.2]">
                Hãy Nói Chuyện Với Các Hướng Dẫn Viên Du Lịch Chuyên Nghiệp Của Chúng Tôi
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Đội ngũ hỗ trợ tận tâm của chúng tôi luôn sẵn sàng hỗ trợ bạn giải
                đáp mọi thắc mắc hoặc vấn đề, cung cấp các giải pháp nhanh chóng
                và được cá nhân hóa để đáp ứng nhu cầu của bạn.
              </p>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-sm">
                <h4 className="font-bold text-slate-800 mb-4 text-sm">85+ Thành viên nhóm chuyên gia</h4>
                <div className="flex items-center -space-x-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://ui-avatars.com/api/?name=John&background=random" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://ui-avatars.com/api/?name=Jane&background=random" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://ui-avatars.com/api/?name=Alex&background=random" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://ui-avatars.com/api/?name=Sarah&background=random" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://ui-avatars.com/api/?name=Mike&background=random" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-amber-500 text-white flex items-center justify-center text-sm font-bold relative z-10">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right side grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="bg-[#F9FAFB] p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2 text-[15px]">Cần trợ giúp và hỗ trợ</h4>
                <p className="text-slate-500 font-medium flex items-center gap-2 text-[13px]">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> travelbook.cskh@gmail.com
                </p>
              </div>
              
              {/* Card 2 */}
              <div className="bg-[#F9FAFB] p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2 text-[15px]">Cần bất kỳ việc khẩn cấp nào</h4>
                <p className="text-slate-500 font-medium flex items-center gap-2 text-[13px]">
                  <Phone className="w-3.5 h-3.5 shrink-0" /> 0397 694 225
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#F9FAFB] p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2 text-[15px]">Văn phòng chính</h4>
                <p className="text-slate-500 font-medium flex items-start gap-2 text-[13px]">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> 180 Ỷ La, Dương Nội, Hà Đông
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-[#F9FAFB] p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2 text-[15px]">Đại học Phenikaa</h4>
                <p className="text-slate-500 font-medium flex items-start gap-2 text-[13px]">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Phường Yên Nghĩa, Hà Đông, Hà Nội
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Khối 2: Form & Image Collage */}
      <section ref={section2Ref} className="py-20 bg-[#F4F5F4] overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Form */}
            <div className={`transition-all duration-1000 transform ${showSection2 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Liên Hệ</h2>
              <p className="text-slate-500 mb-8 font-medium text-sm">Địa chỉ email của bạn sẽ không được công bố. Các trường bắt buộc được đánh dấu <span className="text-red-500">*</span></p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập họ tên của bạn" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@gmail.com" 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0988..." 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Chủ đề (Subject) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Vấn đề bạn quan tâm..." 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày dự kiến (nếu có)</label>
                    <input 
                      type="date" 
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nội dung tư vấn <span className="text-red-500">*</span></label>
                  <textarea 
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tôi cần tư vấn tour đi Đà Nẵng..." 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all min-h-[120px] resize-none" 
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi thông tin'} <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Images Collage */}
            <div className={`relative h-[600px] transition-all duration-1000 delay-300 transform ${showSection2 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'}`}>
              <div className="absolute top-0 left-0 w-full h-[280px] rounded-3xl overflow-hidden shadow-lg">
                <Image src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80" alt="Travel 1" fill className="object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute bottom-0 left-0 w-[48%] h-[300px] rounded-3xl overflow-hidden shadow-lg">
                <Image src="https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=400&q=80" alt="Travel 2" fill className="object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute bottom-0 right-0 w-[48%] h-[300px] rounded-3xl overflow-hidden shadow-lg">
                <Image src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80" alt="Travel 3" fill className="object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              
              {/* Center Circle Logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white rounded-full flex flex-col items-center justify-center shadow-2xl border-[6px] border-amber-500 z-10 transition-transform duration-1000 delay-500 hover:rotate-12">
                <div className="w-20 h-20 relative mb-1 mt-3">
                  <div className="absolute inset-0 bg-blue-50 rounded-full flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-rose-500 absolute -top-1 right-2 z-10" />
                    <MapPin className="w-8 h-8 text-blue-500 absolute bottom-1 left-2 z-10" />
                    <div className="w-14 h-14 bg-sky-200 rounded-full"></div>
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-800">TravelBook</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Khối 3: Google Map */}
      <section className="h-[500px] w-full">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.7483660601445!2d105.74618777598124!3d20.96261548067083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313452efff394ce3%3A0x391a39d4325be464!2sPhenikaa%20University!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </div>
  )
}
