import Image from 'next/image'
import Link from 'next/link'
import { Target, Compass, ShieldCheck, HeartHandshake, Lightbulb, ArrowRight } from 'lucide-react'
import CountUp from '@/components/ui/CountUp'

export const metadata = {
  title: 'Giới thiệu | TravelBooking',
  description: 'Câu chuyện thương hiệu và sứ mệnh của TravelBooking',
}

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Khu vực Hero (Banner mở đầu) */}
      <section className="relative h-[45vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80" 
            alt="Hero Background" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-8">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 drop-shadow-lg leading-tight">
            Khai phá giới hạn, chạm đến những miền đất mới
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium">
            Chúng tôi không chỉ bán tour du lịch, chúng tôi mang đến những trải nghiệm để đời.
          </p>
        </div>
      </section>

      {/* 2. Câu chuyện thương hiệu (Our Story) */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                alt="Our Story"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm mb-2">
                Câu chuyện của chúng tôi
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                Hành trình từ một ý tưởng trên giảng đường
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed text-justify">
                TravelBooking bắt nguồn từ một ý tưởng khởi nghiệp đầy táo bạo tại <strong>Phenikaa University</strong>, với mong muốn số hóa và cách mạng hóa trải nghiệm du lịch tại Việt Nam. Chúng tôi nhận ra rằng việc lên kế hoạch cho một chuyến đi hoàn hảo thường mất quá nhiều thời gian và công sức.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed text-justify">
                Hệ thống sau đó được đắp nặn và áp dụng các tiêu chuẩn phát triển phần mềm khắt khe nhất. Bằng việc học hỏi từ các môi trường thực chiến chuẩn doanh nghiệp như kỳ thực tập tại <strong>Rikkeiacademy</strong> hồi mùa hè năm 2026, TravelBooking đã chuyển mình từ một đồ án học thuật trở thành một nền tảng thương mại thực thụ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tầm nhìn & Sứ mệnh (Vision & Mission) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Tầm nhìn</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Trở thành nền tảng đặt tour du lịch trực tuyến số 1 tại Việt Nam, mang đến trải nghiệm liền mạch từ lúc tìm kiếm đến khi kết thúc chuyến đi.
              </p>
            </div>
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Sứ mệnh</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Cung cấp các dịch vụ du lịch an toàn, minh bạch với chi phí tối ưu nhất cho người dùng, giúp mọi người đều có thể khám phá thế giới.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Giá trị cốt lõi (Core Values) */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Giá trị cốt lõi</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Những nguyên tắc định hình mọi quyết định và hành động của chúng tôi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors">
              <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Minh bạch</h3>
              <p className="text-slate-400">Không phí ẩn, thông tin lịch trình rõ ràng. Những gì bạn thấy là những gì bạn sẽ trải nghiệm.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors">
              <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                <HeartHandshake className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Khách hàng là trọng tâm</h3>
              <p className="text-slate-400">Hỗ trợ tận tình mọi lúc mọi nơi. Sự hài lòng của bạn là thước đo thành công của chúng tôi.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors">
              <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Đổi mới liên tục</h3>
              <p className="text-slate-400">Cập nhật công nghệ tiên tiến nhất để mang lại trải nghiệm UI/UX đặt tour mượt mà và tối ưu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Đội ngũ sáng lập (Meet Our Team) */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Đội ngũ sáng lập</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Những con người đam mê du lịch và công nghệ đứng sau sự thành công của TravelBooking.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Founder */}
            <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
              <div className="relative h-80 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80" 
                  alt="Nguyễn Văn Hiếu" 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Nguyễn Văn Hiếu</h3>
                <p className="text-blue-600 font-medium mb-3">Founder & Lead Developer</p>
                <p className="text-slate-500 text-sm">Kiến trúc sư trưởng hệ thống TravelBooking, đam mê tạo ra các giải pháp công nghệ tối ưu.</p>
              </div>
            </div>

            {/* Member 2 */}
            <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
              <div className="relative h-80 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" 
                  alt="Trần Thị Lan" 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Trần Phương Lan</h3>
                <p className="text-blue-600 font-medium mb-3">Giám đốc Marketing</p>
                <p className="text-slate-500 text-sm">Người định hướng chiến lược thương hiệu và mang các điểm đến tuyệt vời tới gần khách hàng.</p>
              </div>
            </div>

            {/* Member 3 */}
            <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
              <div className="relative h-80 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80" 
                  alt="Lê Hoàng Sơn" 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Lê Hoàng Sơn</h3>
                <p className="text-blue-600 font-medium mb-3">Trưởng phòng CSKH</p>
                <p className="text-slate-500 text-sm">Đảm bảo mọi trải nghiệm của khách hàng đều hoàn hảo từ lúc đặt tour đến khi về nhà.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Các con số ấn tượng (Milestones / Stats) */}
      <section className="py-20 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-blue-400/30">
            <div className="pt-8 md:pt-0">
              <div className="text-5xl font-black mb-2 drop-shadow-md">
                <CountUp end={10000} suffix="+" duration={2.5} />
              </div>
              <div className="text-blue-100 font-medium text-lg uppercase tracking-wider">Khách hàng hài lòng</div>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-5xl font-black mb-2 drop-shadow-md">
                <CountUp end={500} suffix="+" duration={2} />
              </div>
              <div className="text-blue-100 font-medium text-lg uppercase tracking-wider">Đối tác lữ hành</div>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-5xl font-black mb-2 drop-shadow-md">
                <CountUp end={50} suffix="+" duration={1.5} />
              </div>
              <div className="text-blue-100 font-medium text-lg uppercase tracking-wider">Điểm đến toàn cầu</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call to Action (CTA) */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Bạn đã sẵn sàng cho chuyến đi tiếp theo?</h2>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Hãy để chúng tôi đồng hành cùng bạn trong mọi cuộc hành trình. Hàng ngàn ưu đãi hấp dẫn đang chờ đón!
          </p>
          <Link href="/tours">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 flex items-center justify-center mx-auto gap-3 group">
              Khám phá các Tour ngay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}
