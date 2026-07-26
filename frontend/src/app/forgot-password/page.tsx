'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { setLoginModalOpen } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Vui lòng nhập địa chỉ email.')
      return
    }
    
    if (!validateEmail(email)) {
      setError('Email không đúng định dạng. Vui lòng kiểm tra lại.')
      return
    }

    setIsLoading(true)

    // Mock API Call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 1500)
  }

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/')
    setTimeout(() => {
      setLoginModalOpen(true)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Toast Notification */}
      {isSuccess && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle className="w-6 h-6" />
          <span className="font-bold">Vui lòng kiểm tra hộp thư email của bạn!</span>
        </div>
      )}

      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100">
        <div className="p-8 md:p-10">
          
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-black text-blue-600 tracking-tighter">TRAVEL<span className="text-emerald-500">BOOK</span></span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Quên mật khẩu?</h1>
            <p className="text-slate-500 text-sm">
              Vui lòng nhập địa chỉ email bạn đã đăng ký. Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  disabled={isSuccess}
                  placeholder="Nhập email của bạn" 
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${error ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'} rounded-xl text-slate-800 outline-none focus:ring-2 transition-all`}
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-500 font-medium animate-in fade-in">{error}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading || isSuccess}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? (
                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSuccess ? (
                'Đã gửi yêu cầu'
              ) : (
                'Gửi yêu cầu'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={handleBackToLogin}
              className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 mx-auto group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Quay lại trang Đăng nhập
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
