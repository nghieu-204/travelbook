import Link from 'next/link'
import { CheckCircle2, MapPin, Calendar, Users, ChevronRight, Download } from 'lucide-react'

export default function BookingsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Alert */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left shadow-sm animate-in slide-in-from-top-4 duration-500">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mx-auto md:mx-0">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Đặt tour thành công!</h1>
            <p className="text-slate-600 leading-relaxed">
              Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Một email xác nhận kèm vé điện tử đã được gửi tới hòm thư của bạn. Vui lòng kiểm tra lại thông tin chuyến đi.
            </p>
          </div>
        </div>

        {/* Bookings List */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Chuyến đi của bạn</h2>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-700 delay-150 fill-mode-both">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 border-b border-slate-100 pb-8 mb-8">
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                <img src="https://images.unsplash.com/photo-1596422846543-74c6e271abb1?auto=format&fit=crop&w=600&q=80" alt="Tour image" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-2">Hà Nội 36 Phố Phường - Hồ Hoàn Kiếm - Văn Miếu</h3>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
                    Đã thanh toán
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Khởi hành</p>
                      <p>23/07/2026</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Số lượng</p>
                      <p>1 Người lớn, 0 Trẻ em</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium">Mã đặt chỗ:</span>
                <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded">BKG-9824X</span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
                  <Download className="w-4 h-4" /> Tải vé
                </button>
                <Link href="/" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                  Trang chủ <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
