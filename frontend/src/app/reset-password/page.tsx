'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { setLoginModalOpen } = useAuthStore()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Real-time password strength validation
  const validatePasswordStrength = (pass: string) => {
    if (pass.length === 0) return ''
    if (pass.length < 8) return 'Mật khẩu phải dài ít nhất 8 ký tự.'
    if (!/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) {
      return 'Mật khẩu phải bao gồm cả chữ cái và chữ số.'
    }
    return ''
  }

  const passwordError = validatePasswordStrength(password)
  const confirmError = confirmPassword.length > 0 && confirmPassword !== password ? 'Mật khẩu xác nhận không khớp.' : ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Vui lòng nhập mật khẩu mới.')
      return
    }

    if (passwordError) {
      setError(passwordError)
      return
    }

    if (confirmPassword !== password) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setIsLoading(true)

    // Mock API Call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      
      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/')
        setTimeout(() => {
          setLoginModalOpen(true)
        }, 100)
      }, 2000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Toast Notification */}
      {isSuccess && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle className="w-6 h-6" />
          <span className="font-bold">Đổi mật khẩu thành công! Đang chuyển hướng...</span>
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
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Tạo mật khẩu mới</h1>
            <p className="text-slate-500 text-sm">
              Mật khẩu mới của bạn phải khác với các mật khẩu đã sử dụng trước đây.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mật khẩu mới</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  disabled={isSuccess}
                  placeholder="Nhập mật khẩu mới" 
                  className={`w-full pl-11 pr-12 py-3 bg-slate-50 border ${passwordError ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'} rounded-xl text-slate-800 outline-none focus:ring-2 transition-all`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-xs text-red-500 font-medium animate-in fade-in">{passwordError}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (error) setError('')
                  }}
                  disabled={isSuccess}
                  placeholder="Nhập lại mật khẩu mới" 
                  className={`w-full pl-11 pr-12 py-3 bg-slate-50 border ${confirmError ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'} rounded-xl text-slate-800 outline-none focus:ring-2 transition-all`}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmError && <p className="mt-1 text-xs text-red-500 font-medium animate-in fade-in">{confirmError}</p>}
            </div>

            {error && <p className="text-sm text-red-500 font-medium animate-in fade-in text-center pt-2">{error}</p>}

            <button 
              type="submit" 
              disabled={isLoading || isSuccess || !!passwordError || !!confirmError}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSuccess ? (
                <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Thành công</span>
              ) : (
                'Lưu mật khẩu mới'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
