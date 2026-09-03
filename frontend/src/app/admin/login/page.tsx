/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { cn } from '@/lib/utils'
import { authService } from '@/services/authService'
import { toast } from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
})

export default function AdminLoginPage() {
  const { login } = useAdminAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onLogin = async (data: any) => {
    try {
      setIsLoading(true)
      setLoginError(null)
      const result = await authService.adminLogin(data)
      login(result.user, result.token)
      toast.success('Đăng nhập thành công!')
      window.location.href = '/admin'
    } catch (error: any) {
      const errorMsg = error.message || 'Đăng nhập thất bại'
      setLoginError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-tighter">
              ADMIN<span className="text-emerald-500">PANEL</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Đăng nhập để quản trị hệ thống
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <div className="text-red-500 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <div>
                <h4 className="text-red-500 font-bold text-sm mb-1">Đăng nhập thất bại</h4>
                <p className="text-red-400/90 text-sm">
                  {loginError.includes('không có quyền') ? (
                    <>Tài khoản của bạn là tài khoản khách hàng, không có quyền truy cập trang quản trị. <a href="/" className="underline hover:text-red-300 font-semibold">Quay lại trang chủ</a></>
                  ) : (
                    loginError
                  )}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="Email quản trị" 
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-xl border bg-[#0f172a] text-slate-200 outline-none transition-all focus:ring-2 focus:ring-emerald-500/50", 
                    errors.email ? "border-red-500/50 focus:border-red-500/50" : "border-slate-800 focus:border-emerald-500/50"
                  )}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message as string}</p>}
            </div>
            
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  {...register('password')}
                  type="password" 
                  placeholder="Mật khẩu" 
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-xl border bg-[#0f172a] text-slate-200 outline-none transition-all focus:ring-2 focus:ring-emerald-500/50", 
                    errors.password ? "border-red-500/50 focus:border-red-500/50" : "border-slate-800 focus:border-emerald-500/50"
                  )}
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message as string}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đăng nhập Quản trị'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
