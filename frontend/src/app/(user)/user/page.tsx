/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
'use client'

import { Camera, X, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useState, useEffect, useRef } from 'react'
import { userService } from '@/services/userService'
import { toast } from 'react-hot-toast'

export default function UserProfilePage() {
  const { user, token, login } = useAuthStore()
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avatar, setAvatar] = useState('')
  
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getProfile()
        setProfile(data)
        setName(data.name || '')
        setPhone(data.phone || '')
        setAddress(data.address || '')
        setAvatar(data.avatar || '')
      } catch (error) {
        console.error("Lỗi lấy thông tin profile:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    
    try {
      setIsUpdating(true)
      await userService.updateProfile({
        name: profile?.name,
        email: profile?.email,
        phone: profile?.phone,
        address: profile?.address,
        new_password: newPassword
      })

      toast.success('Cập nhật mật khẩu thành công!', { id: 'pwd-success' })
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordModal(false)
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật mật khẩu', { id: 'pwd-error' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const res = await userService.updateProfile({
        name,
        email: profile?.email,
        address,
        phone,
        avatar
      })
      
      setProfile(res.user)
      toast.success('Cập nhật hồ sơ thành công!', { id: 'profile-success' })
      
      if (token && res.user) {
        const newUser = { 
          id: res.user.id, 
          name: res.user.name, 
          email: res.user.email, 
          role: res.user.role,
          avatar: res.user.avatar,
          phone: res.user.phone
        }
        login(newUser, token)
        
        // Cập nhật cả bên admin store nếu user là admin đang đăng nhập
        import('@/store/useAdminAuthStore').then(({ useAdminAuthStore }) => {
          const adminState = useAdminAuthStore.getState()
          if (adminState.user?.id === res.user.id) {
            adminState.updateUser(newUser)
          }
        })
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật hồ sơ', { id: 'profile-error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast.error('Kích thước ảnh quá lớn, vui lòng chọn ảnh < 2MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Hồ sơ cá nhân</h1>
      
      <div className="flex flex-col md:flex-row gap-8 items-start mb-8 pb-8 border-b border-slate-100">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-4xl border-4 border-white shadow-lg overflow-hidden shrink-0">
            {avatar ? (
              <img 
                src={avatar.startsWith('http') || avatar.startsWith('data:') ? avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902'}${avatar.startsWith('/') ? '' : '/'}${avatar}`}
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    const span = document.createElement('span');
                    span.innerText = profile?.name?.charAt(0) || 'U';
                    e.currentTarget.parentElement.appendChild(span);
                  }
                }}
              />
            ) : (
              profile?.name?.charAt(0) || 'U'
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-blue-700 transition-colors shadow-md"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{profile?.name || 'Tên người dùng'}</h2>
          <p className="text-slate-500 mt-1">{profile?.email || 'email@example.com'}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực
            </span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">
              {profile?.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="mt-4 text-sm font-semibold text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" 
              placeholder="Chưa cập nhật" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" 
              placeholder="Chưa cập nhật" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email (Không thể thay đổi)</label>
            <input 
              type="email" 
              disabled 
              defaultValue={profile?.email} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none cursor-not-allowed" 
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full md:w-auto"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Đang lưu...
            </span>
          ) : 'Lưu thay đổi'}
        </button>
      </form>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Đổi mật khẩu</h2>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mật khẩu mới</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" 
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" 
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
              </div>

              {passwordError && <p className="text-red-500 text-sm font-medium">{passwordError}</p>}
              {passwordSuccess && <p className="text-green-500 text-sm font-medium">{passwordSuccess}</p>}

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang cập nhật...
                  </span>
                ) : 'Cập nhật mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
