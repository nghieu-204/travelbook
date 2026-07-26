export default function RefundPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Chính sách hoàn tiền</h1>
        
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Để đảm bảo quyền lợi cho khách hàng, TravelBooking áp dụng chính sách hoàn hủy linh hoạt như sau:</p>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 my-8">
            <h3 className="font-bold text-slate-900 mb-4">Đối với Tour Nội địa</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Hủy trước 7 ngày khởi hành: Hoàn 100% tiền cọc.</li>
              <li>Hủy từ 3-6 ngày khởi hành: Hoàn 50% tiền cọc.</li>
              <li>Hủy trong vòng 48h khởi hành: Không hoàn tiền.</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 my-8">
            <h3 className="font-bold text-slate-900 mb-4">Đối với Tour Quốc tế</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Hủy trước 15 ngày khởi hành: Hoàn 100% tiền cọc (trừ phí Visa nếu có).</li>
              <li>Hủy từ 7-14 ngày khởi hành: Hoàn 30% tổng giá trị tour.</li>
              <li>Hủy trong vòng 7 ngày khởi hành: Không hoàn tiền.</li>
            </ul>
          </div>

          <p className="text-sm text-red-500 font-medium">* Lưu ý: Thời gian hoàn tiền thường mất từ 3-5 ngày làm việc tùy thuộc vào phương thức thanh toán và ngân hàng của quý khách.</p>
        </div>
      </div>
    </div>
  )
}
