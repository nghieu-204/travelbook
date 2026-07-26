import { ShieldCheck } from 'lucide-react'

export default function OrderSummary() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl sticky top-24">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Tóm tắt đơn hàng</h2>
      
      <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
        <img src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=200&q=80" alt="Tour" className="w-24 h-24 object-cover rounded-xl" />
        <div>
          <h3 className="font-bold text-slate-900 leading-tight mb-2">Khám phá Vịnh Hạ Long 2N1Đ - Nghỉ đêm trên du thuyền 5 sao</h3>
          <p className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">2 Ngày 1 Đêm</p>
        </div>
      </div>

      <div className="space-y-4 mb-6 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Ngày khởi hành</span>
          <span className="font-bold text-slate-900">15/08/2026</span>
        </div>
        <div className="flex justify-between">
          <span>Số khách</span>
          <span className="font-bold text-slate-900">2 Người lớn, 0 Trẻ em</span>
        </div>
      </div>

      <div className="space-y-3 mb-6 pb-6 border-b border-slate-100 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Tạm tính (2x)</span>
          <span className="font-medium text-slate-700">5.000.000đ</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Thuế & Phí (10%)</span>
          <span className="font-medium text-slate-700">500.000đ</span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="block text-slate-500 text-sm mb-1">Tổng cộng</span>
          <span className="text-xs text-slate-400">Đã bao gồm thuế</span>
        </div>
        <span className="text-3xl font-black text-red-600">5.500.000đ</span>
      </div>

      <button form="checkout-form" type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 mb-4">
        Xác nhận & Thanh toán
      </button>

      <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        <p>Thanh toán an toàn 100%. Thông tin của bạn được bảo mật tuyệt đối.</p>
      </div>
    </div>
  )
}
