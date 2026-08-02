export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Về TravelBooking</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Chúng tôi tự hào là nền tảng đặt tour du lịch hàng đầu, kết nối hàng triệu du khách với những trải nghiệm tuyệt vời nhất trên khắp thế giới.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Sứ mệnh của chúng tôi</h2>
            <p className="text-slate-600 leading-relaxed text-justify">
              TravelBooking ra đời với sứ mệnh đơn giản hóa quá trình khám phá thế giới của bạn. 
              Từ những bãi biển nhiệt đới lộng lẫy đến những đỉnh núi mù sương, chúng tôi cam kết mang lại 
              các tour du lịch chất lượng, an toàn và dễ dàng đặt trước chỉ với vài cú click.
            </p>
            <ul className="space-y-3 text-slate-700 font-medium">
              <li>✅ Đội ngũ hỗ trợ 24/7 nhiệt tình.</li>
              <li>✅ Mức giá tốt nhất trên thị trường.</li>
              <li>✅ Hợp tác với hơn 10,000 đối tác lưu trú và lữ hành.</li>
            </ul>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" 
              alt="About Us" 
              className="rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
