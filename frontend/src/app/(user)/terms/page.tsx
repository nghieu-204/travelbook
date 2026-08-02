export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Điều khoản sử dụng</h1>
        
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Chào mừng bạn đến với TravelBooking. Khi sử dụng website và dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản sau đây.</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Tài khoản và Bảo mật</h2>
          <p>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình. Chúng tôi có quyền khóa tài khoản nếu phát hiện hành vi gian lận hoặc vi phạm quy định.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Dịch vụ Đặt tour</h2>
          <p>TravelBooking cam kết cung cấp thông tin tour chính xác nhất. Tuy nhiên, lịch trình có thể thay đổi do thời tiết hoặc các yếu tố khách quan khác. Chúng tôi sẽ thông báo cho bạn sớm nhất có thể.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Bản quyền</h2>
          <p>Mọi nội dung, hình ảnh, mã nguồn trên website thuộc bản quyền của TravelBooking. Nghiêm cấm sao chép, phân phối khi chưa có sự đồng ý bằng văn bản.</p>
        </div>
      </div>
    </div>
  )
}
