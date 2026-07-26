import { HelpCircle } from 'lucide-react'

const faqs = [
  { q: "Làm sao để đặt tour?", a: "Bạn có thể dễ dàng đặt tour bằng cách tìm kiếm điểm đến, chọn tour phù hợp, điền số lượng người và ngày khởi hành, sau đó tiến hành thanh toán." },
  { q: "Các phương thức thanh toán?", a: "Chúng tôi hỗ trợ thanh toán qua Ví MoMo, PayPal, Thẻ tín dụng/ghi nợ quốc tế (Visa/Mastercard) và thanh toán sau tại văn phòng." },
  { q: "Tôi có thể hủy tour không?", a: "Có. Bạn có thể hủy tour trước 7 ngày khởi hành để được hoàn 100% tiền. Vui lòng xem chi tiết tại trang Chính sách hoàn tiền." },
  { q: "Trẻ em có được giảm giá không?", a: "Tùy thuộc vào từng tour cụ thể, thông thường trẻ em dưới 2 tuổi miễn phí, từ 2-12 tuổi tính 70-80% giá người lớn." },
]

export default function FAQPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">Câu hỏi thường gặp</h1>
          <p className="text-slate-600 text-lg">Giải đáp những thắc mắc phổ biến nhất của khách hàng</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-start gap-3">
                <span className="text-blue-600">Q:</span> {faq.q}
              </h3>
              <p className="text-slate-600 leading-relaxed pl-7">
                <span className="font-bold text-slate-400 mr-2">A:</span> {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
