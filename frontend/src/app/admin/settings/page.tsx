'use client'

import { useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { cn, getImageUrl } from '@/lib/utils'
import { User, Phone, Shield, Loader2, Save, Lock, AlertCircle, Info, Upload, Camera } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AdminSettings() {
  const { token, updateUser } = useAdminAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Forms
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '' // Current URL
  })
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchApi('/profile')
        setProfile(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          avatar: data.avatar || ''
        })
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        toast.error('Không thể tải thông tin hồ sơ')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [token])

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      let finalAvatarUrl = formData.avatar;
      
      // Nếu có chọn file mới, upload file trước
      if (avatarFile) {
        const uploadData = new FormData()
        uploadData.append('avatar', avatarFile)
        
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/profile/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadData
        })
        
        const uploadResult = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadResult.message || 'Lỗi khi tải ảnh lên')
        
        finalAvatarUrl = uploadResult.avatar
      }

      // Sau đó cập nhật name và phone
      const result = await fetchApi('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          avatar: finalAvatarUrl
        })
      })
      toast.success('Cập nhật thông tin thành công!')
      
      // Update global store so the header updates instantly
      if (result.user) {
        updateUser({
          name: result.user.name,
          phone: result.user.phone,
          avatar: result.user.avatar
        })
      }
      
      // Reset preview
      setAvatarFile(null)
      setAvatarPreview(null)
      setFormData(prev => ({ ...prev, avatar: finalAvatarUrl }))
      
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cập nhật thông tin')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!')
      return
    }

    setIsSavingPassword(true)
    try {
      await fetchApi('/profile/password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      })
      toast.success('Đổi mật khẩu thành công!')
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi đổi mật khẩu')
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-[400px] items-center justify-center flex-col gap-4">
        <p className="text-slate-400">Không thể tải thông tin hồ sơ.</p>
      </div>
    )
  }

  const isOAuthUser = profile.google_id || profile.facebook_id;
  
  // Logic hiển thị ảnh preview
  const displayAvatar = avatarPreview || getImageUrl(formData.avatar);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white">Cài đặt tài khoản</h1>
        <p className="text-slate-400">Cập nhật thông tin cá nhân và bảo mật</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Thông tin tài khoản */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <User className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-white">Thông tin cơ bản</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleUpdateInfo} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Ảnh đại diện</label>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full border-4 border-slate-700 bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                      {displayAvatar ? (
                        <img 
                          src={displayAvatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.fallback-letter')) {
                              const span = document.createElement('span');
                              span.className = 'text-3xl font-bold text-slate-500 fallback-letter';
                              span.innerText = formData.name?.charAt(0).toUpperCase() || 'A';
                              parent.appendChild(span);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-3xl font-bold text-slate-500">{formData.name?.charAt(0) || 'A'}</span>
                      )}
                      
                      {/* Overlay upload button directly on avatar */}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-8 h-8 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setAvatarFile(file)
                              setAvatarPreview(URL.createObjectURL(file))
                            }
                          }}
                        />
                      </label>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-slate-400">Click vào ảnh để tải lên ảnh mới.</p>
                      <p className="text-xs text-slate-500">Định dạng hỗ trợ: JPG, PNG, WEBP. Tối đa 5MB.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bảo mật */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-white">Bảo mật</h2>
          </div>
          
          <div className="p-6">
            {isOAuthUser ? (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300">
                <Info className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Tài khoản {profile.google_id ? 'Google' : 'Facebook'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Mật khẩu của tài khoản này được quản lý bởi nhà cung cấp đăng nhập (OAuth). Bạn không thể thay đổi mật khẩu thông qua TravelBook.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                  >
                    {isSavingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
