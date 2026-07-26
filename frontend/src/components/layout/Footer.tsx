import Link from 'next/link'
import { Globe, Camera, MessageCircle, Video } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Col 1 */}
        <div>
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-black text-white tracking-tighter">TRAVEL<span className="text-emerald-500">BOOK</span></span>
          </Link>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Nền tảng đặt tour du lịch hàng đầu Việt Nam. Khám phá hàng ngàn điểm đến hấp dẫn với giá tốt nhất và dịch vụ chu đáo.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Globe className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all"><Camera className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all"><MessageCircle className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><Video className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Liên Kết Nhanh</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/tours" className="hover:text-emerald-400 transition-colors">Tất cả Tour</Link></li>
            <li><Link href="/about" className="hover:text-emerald-400 transition-colors">Về chúng tôi</Link></li>
            <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Liên hệ</Link></li>
            <li><Link href="/blog" className="hover:text-emerald-400 transition-colors">Cẩm nang du lịch</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Chính Sách</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Điều khoản sử dụng</Link></li>
            <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Bảo mật thông tin</Link></li>
            <li><Link href="/refund" className="hover:text-emerald-400 transition-colors">Chính sách hoàn tiền</Link></li>
            <li><Link href="/faq" className="hover:text-emerald-400 transition-colors">Câu hỏi thường gặp</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Thanh Toán</h3>
          <p className="text-sm text-slate-400 mb-4">Chúng tôi chấp nhận các hình thức thanh toán an toàn và tiện lợi nhất.</p>
          <div className="flex gap-2 flex-wrap">
            <div className="w-16 h-10 bg-white rounded flex items-center justify-center p-1">
              <span className="text-blue-900 font-black text-xs">VISA</span>
            </div>
            <div className="w-16 h-10 bg-white rounded flex items-center justify-center p-1">
              <span className="text-red-600 font-black text-xs">MasterCard</span>
            </div>
            <div className="w-16 h-10 bg-white rounded flex items-center justify-center p-1">
              <span className="text-blue-500 font-black text-xs">PayPal</span>
            </div>
            <div className="w-16 h-10 bg-pink-600 rounded flex items-center justify-center p-1 text-white font-bold text-xs">
              MoMo
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} TravelBooking. All rights reserved.
      </div>
    </footer>
  )
}
