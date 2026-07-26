export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Bảo mật thông tin</h1>
        
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>TravelBooking coi trọng việc bảo mật thông tin cá nhân của khách hàng. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Thu thập thông tin</h2>
          <p>Chúng tôi thu thập thông tin khi bạn đăng ký tài khoản, đặt tour hoặc liên hệ hỗ trợ. Thông tin bao gồm: họ tên, số điện thoại, email, địa chỉ và thông tin thanh toán.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Sử dụng thông tin</h2>
          <p>Thông tin của bạn được dùng để: xử lý đơn đặt tour, gửi thông báo cập nhật, cải thiện dịch vụ và cung cấp các ưu đãi cá nhân hóa.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Bảo vệ dữ liệu</h2>
          <p>Tất cả thông tin nhạy cảm (như thẻ tín dụng) đều được mã hóa theo tiêu chuẩn SSL. Chúng tôi không bao giờ bán dữ liệu cá nhân của bạn cho bên thứ ba.</p>
        </div>
      </div>
    </div>
  )
}
