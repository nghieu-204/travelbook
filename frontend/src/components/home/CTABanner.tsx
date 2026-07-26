import { ShieldCheck, Headphones, CreditCard, ThumbsUp } from 'lucide-react'

export default function CTABanner() {
  return (
    <section className="py-20 bg-blue-600">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-4">Tự Tin Du Lịch Cùng TravelBooking</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">Cam kết mang lại trải nghiệm tuyệt vời nhất với các tiêu chuẩn dịch vụ hàng đầu.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center text-white border border-white/20">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
            <h3 className="font-bold text-lg mb-2">An Toàn Tuyệt Đối</h3>
            <p className="text-blue-100 text-sm">Bảo hiểm du lịch toàn diện cho mọi hành trình của bạn.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center text-white border border-white/20">
            <ThumbsUp className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
            <h3 className="font-bold text-lg mb-2">Chất Lượng 5 Sao</h3>
            <p className="text-blue-100 text-sm">Tuyển chọn các đối tác dịch vụ khắt khe nhất.</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center text-white border border-white/20">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
            <h3 className="font-bold text-lg mb-2">Thanh Toán Dễ Dàng</h3>
            <p className="text-blue-100 text-sm">Hỗ trợ đa dạng phương thức, bảo mật chuẩn quốc tế.</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center text-white border border-white/20">
            <Headphones className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
            <h3 className="font-bold text-lg mb-2">Hỗ Trợ 24/7</h3>
            <p className="text-blue-100 text-sm">Đội ngũ chuyên viên luôn sẵn sàng đồng hành cùng bạn.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
