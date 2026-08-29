import CheckoutForm from '@/components/checkout/CheckoutForm'
import OrderSummary from '@/components/checkout/OrderSummary'
import AuthGuard from '@/components/auth/AuthGuard'

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <div className="bg-slate-50 py-12 min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Thanh toán & Đặt chỗ</h1>
            <p className="text-slate-500">Vui lòng điền thông tin và hoàn tất thanh toán để giữ chỗ.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 w-full">
              <CheckoutForm />
            </div>
            
            <div className="lg:w-1/3 w-full">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
