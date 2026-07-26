'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils'
import { fetchApi } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải từ 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
})

export default function AuthModal() {
  const { isLoginModalOpen, setLoginModalOpen, login } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const router = useRouter()

  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const { register: registerReg, handleSubmit: handleRegSubmit, formState: { errors: regErrors } } = useForm({
    resolver: zodResolver(registerSchema)
  })

  if (!isLoginModalOpen) return null

  const onLogin = async (data: any) => {
    try {
      const result = await fetchApi('/login', { data })
      login(result.user, result.token)
      if (result.user.role === 'admin') {
        router.push('/admin/tours')
      }
    } catch (error: any) {
      alert(error.message || 'Đăng nhập thất bại')
    }
  }

  const onRegister = async (data: any) => {
    try {
      const result = await fetchApi('/register', { data })
      login(result.user, result.token)
    } catch (error: any) {
      alert(error.message || 'Đăng ký thất bại')
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
                    className={cn("w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-100", regErrors.name ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-500")}
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
                    className={cn("w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-100", regErrors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-500")}
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
                    className={cn("w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-100", regErrors.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-500")}
                  />
                </div>
                {regErrors.password && <p className="text-red-500 text-xs mt-1 ml-1">{regErrors.password.message as string}</p>}
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Đăng ký
              </button>
            </form>
          )}

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
