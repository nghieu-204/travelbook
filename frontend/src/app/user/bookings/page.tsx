import { MapPin, Calendar, Clock } from 'lucide-react'

const mockBookings = [
  { id: 'BK1002', tourName: 'Khám phá Vịnh Hạ Long 2N1Đ - Nghỉ đêm trên du thuyền 5 sao', date: '15/08/2026', status: 'Đã hoàn thành', price: 5500000, image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=200&q=80' },
  { id: 'BK1005', tourName: 'Nghỉ dưỡng Vinpearl Nam Hội An', date: '20/12/2026', status: 'Đã xác nhận', price: 8400000, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=200&q=80' },
]

export default function UserBookingsPage() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Đơn đặt của tôi</h1>
      
      <div className="space-y-6">
        {mockBookings.map(booking => (
          <div key={booking.id} className="flex flex-col md:flex-row gap-6 p-4 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
            <img src={booking.image} alt={booking.tourName} className="w-full md:w-48 h-32 object-cover rounded-xl shrink-0" />
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-900 leading-tight">{booking.tourName}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${booking.status === 'Đã hoàn thành' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {booking.status}
                </span>
              </div>
              <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">Mã đơn: <span className="font-mono text-slate-900">{booking.id}</span></div>
              <div className="text-sm text-slate-500 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" /> Khởi hành: <span className="font-medium text-slate-900">{booking.date}</span></div>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="font-black text-red-600">{booking.price.toLocaleString('vi-VN')}đ</div>
                {booking.status === 'Đã hoàn thành' && (
                  <button className="text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    Viết đánh giá
                  </button>
                )}
                {booking.status === 'Đã xác nhận' && (
                  <button className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                    Xem vé
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
