import { ShieldCheck, Headphones, CreditCard, ThumbsUp } from 'lucide-react'

export default function CTABanner() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Tự Tin Du Lịch Cùng TravelBook</h2>
          <p className="text-slate-500 mt-2 text-lg max-w-2xl mx-auto">Cam kết mang lại trải nghiệm tuyệt vời nhất với các tiêu chuẩn dịch vụ hàng đầu.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-[#0046c1]" />
            <h3 className="font-bold text-lg mb-2 text-slate-800">An Toàn Tuyệt Đối</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Bảo hiểm du lịch toàn diện cho mọi hành trình của bạn.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <ThumbsUp className="w-12 h-12 mx-auto mb-4 text-[#0046c1]" />
            <h3 className="font-bold text-lg mb-2 text-slate-800">Chất Lượng 5 Sao</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Tuyển chọn các đối tác dịch vụ khắt khe nhất.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-[#0046c1]" />
            <h3 className="font-bold text-lg mb-2 text-slate-800">Thanh Toán Dễ Dàng</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Hỗ trợ đa dạng phương thức, bảo mật chuẩn quốc tế.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <Headphones className="w-12 h-12 mx-auto mb-4 text-[#0046c1]" />
            <h3 className="font-bold text-lg mb-2 text-slate-800">Hỗ Trợ 24/7</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Đội ngũ chuyên viên luôn sẵn sàng đồng hành cùng bạn.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
