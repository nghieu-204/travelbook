'use client'

// @ts-ignore
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Tên phải từ 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  address: z.string().min(10, 'Địa chỉ chi tiết hơn'),
  paymentMethod: z.enum(['office', 'paypal', 'momo']),
})

export default function CheckoutForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'momo'
    }
  })

  const selectedPayment = watch('paymentMethod')

  const onSubmit = (data: z.infer<typeof checkoutSchema>) => {
    console.log(data)
    alert('Đặt tour thành công!')
  }

  return (
    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* User Info */}
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Thông tin liên hệ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên *</label>
            <input 
              {...register('fullName')}
              className={cn("w-full px-4 py-3 rounded-xl border outline-none focus:ring-2", errors.fullName ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100")}
              placeholder="VD: Nguyễn Văn A"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại *</label>
            <input 
              {...register('phone')}
              className={cn("w-full px-4 py-3 rounded-xl border outline-none focus:ring-2", errors.phone ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100")}
              placeholder="VD: 0912345678"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
            <input 
              {...register('email')}
              type="email"
              className={cn("w-full px-4 py-3 rounded-xl border outline-none focus:ring-2", errors.email ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100")}
              placeholder="VD: email@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ *</label>
            <input 
              {...register('address')}
              className={cn("w-full px-4 py-3 rounded-xl border outline-none focus:ring-2", errors.address ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100")}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message as string}</p>}
          </div>
        </div>
      </section>

      {/* Payment Method */}
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Phương thức thanh toán</h2>
        
        <div className="space-y-4">
          <label className={cn("flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all", selectedPayment === 'momo' ? "border-pink-500 bg-pink-50/50" : "border-slate-200 hover:border-slate-300")}>
            <div className="flex items-center gap-4">
              <input type="radio" value="momo" {...register('paymentMethod')} className="w-5 h-5 text-pink-600 focus:ring-pink-500" />
              <div>
                <p className="font-bold text-slate-900">Thanh toán qua Ví MoMo</p>
                <p className="text-xs text-slate-500">Quét mã QR bằng ứng dụng MoMo</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">MoMo</div>
          </label>

          <label className={cn("flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all", selectedPayment === 'paypal' ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-slate-300")}>
            <div className="flex items-center gap-4">
              <input type="radio" value="paypal" {...register('paymentMethod')} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
              <div>
                <p className="font-bold text-slate-900">Thanh toán qua PayPal</p>
                <p className="text-xs text-slate-500">Sử dụng tài khoản PayPal hoặc thẻ tín dụng quốc tế</p>
              </div>
            </div>
            <div className="w-12 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold text-xs px-2">PayPal</div>
          </label>

          <label className={cn("flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all", selectedPayment === 'office' ? "border-slate-500 bg-slate-50" : "border-slate-200 hover:border-slate-300")}>
            <div className="flex items-center gap-4">
              <input type="radio" value="office" {...register('paymentMethod')} className="w-5 h-5 text-slate-600 focus:ring-slate-500" />
              <div>
                <p className="font-bold text-slate-900">Thanh toán tại văn phòng</p>
                <p className="text-xs text-slate-500">Giữ chỗ trước, thanh toán sau trong vòng 24h</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500"><Wallet className="w-6 h-6" /></div>
          </label>
        </div>
      </section>
    </form>
  )
}
