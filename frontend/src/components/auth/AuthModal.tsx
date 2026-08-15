'use client'

import { useState } from 'react'
// @ts-expect-error type error from react-hook-form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Mail, Lock, User as UserIcon, ShieldCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils'
import { authService } from '@/services/authService'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải từ 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
  confirmPassword: z.string().min(6, 'Mật khẩu xác nhận phải từ 6 ký tự'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export default function AuthModal() {
  const { isLoginModalOpen, setLoginModalOpen, login } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const { register: registerReg, handleSubmit: handleRegSubmit, formState: { errors: regErrors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  if (!isLoginModalOpen) return null

  const onLogin = async (data: LoginFormData) => {
    try {
      const result = await authService.login(data)
      login(result.user, result.token)
    } catch (error: unknown) {
      alert((error as Error).message || 'Đăng nhập thất bại')
    }
  }

  const onRegister = async (data: RegisterFormData) => {
    if (!otpSent) {
      try {
        setIsSendingOtp(true)
        const result = await authService.sendOtp(data.email)
        setOtpSent(true)
        alert(result.message || 'Mã OTP đã được gửi đến email của bạn!')
      } catch (error: unknown) {
        alert((error as Error).message || 'Gửi mã OTP thất bại')
      } finally {
        setIsSendingOtp(false)
      }
      return
    }

    if (!otp) {
      alert('Vui lòng nhập mã OTP!')
      return
    }

    try {
      const result = await authService.register({ ...data, otp })
      alert(result.message || 'Đăng ký thành công! Bạn có thể đăng nhập ngay.')
      setMode('login')
      setOtpSent(false)
      setOtp('')
    } catch (error: unknown) {
      alert((error as Error).message || 'Đăng ký thất bại')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={() => setLoginModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">
              {mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              {mode === 'login' ? 'Đăng nhập để khám phá hàng ngàn ưu đãi' : 'Tham gia cộng đồng đam mê du lịch lớn nhất'}
            </p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    {...registerLogin('email')}
                    type="email" 
                    placeholder="Email của bạn" 
                    className={cn("w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-100", loginErrors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-500")}
                  />
                </div>
                {loginErrors.email && <p className="text-red-500 text-xs mt-1 ml-1">{loginErrors.email.message as string}</p>}
              </div>
              
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    {...registerLogin('password')}
                    type="password" 
                    placeholder="Mật khẩu" 
                    className={cn("w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-100", loginErrors.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-500")}
                  />
                </div>
                {loginErrors.password && <p className="text-red-500 text-xs mt-1 ml-1">{loginErrors.password.message as string}</p>}
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" onClick={() => setLoginModalOpen(false)} className="text-sm font-medium text-blue-600 hover:underline">Quên mật khẩu?</Link>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Đăng nhập
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegSubmit(onRegister)} className="space-y-4">
              <div>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    {...registerReg('name')}
                    type="text" 
                    placeholder="Họ và tên" 
                    disabled={otpSent}
                    className={cn("w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500", regErrors.name ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-500")}
                  />
                </div>
                {regErrors.name && <p className="text-red-500 text-xs mt-1 ml-1">{regErrors.name.message as string}</p>}
              </div>

              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    {...registerReg('email')}
                    type="email" 
                    placeholder="Email của bạn" 
                    disabled={otpSent}
                    className={cn("w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500", regErrors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-500")}
                  />
                </div>
                {regErrors.email && <p className="text-red-500 text-xs mt-1 ml-1">{regErrors.email.message as string}</p>}
              </div>
              
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    {...registerReg('password')}
                    type="password" 
                    placeholder="Tạo mật khẩu" 
                    disabled={otpSent}
                    className={cn("w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500", regErrors.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-500")}
                  />
                </div>
                {regErrors.password && <p className="text-red-500 text-xs mt-1 ml-1">{regErrors.password.message as string}</p>}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    {...registerReg('confirmPassword')}
                    type="password" 
                    placeholder="Xác nhận mật khẩu" 
                    disabled={otpSent}
                    className={cn("w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500", regErrors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-500")}
                  />
                </div>
                {regErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{regErrors.confirmPassword.message as string}</p>}
              </div>

              {otpSent && (
                <div>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      type="text" 
                      placeholder="Nhập mã OTP (6 số)" 
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-400 outline-none transition-all focus:ring-2 focus:ring-blue-100 bg-blue-50"
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1 ml-1">Mã OTP đã được gửi đến email của bạn, vui lòng kiểm tra hộp thư.</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSendingOtp}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : otpSent ? 'Xác thực & Đăng ký' : 'Nhận mã OTP'}
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Hoặc tiếp tục với</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              
              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-600 border-t border-slate-100 pt-6">
            {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold text-blue-600 hover:underline"
            >
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
