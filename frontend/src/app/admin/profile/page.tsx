'use client'

import { useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { User, Phone, Mail, Shield, Calendar, Loader2 } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import Link from 'next/link'

export default function AdminProfile() {
  const { token } = useAdminAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchApi('/profile')
        setProfile(data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [token])

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

  const avatarUrl = getImageUrl(profile.avatar);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hồ sơ cá nhân</h1>
          <p className="text-slate-400">Xem thông tin tài khoản quản trị của bạn</p>
        </div>
        <Link 
          href="/admin/settings"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
        >
          Chỉnh sửa hồ sơ
        </Link>
      </div>

      <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="h-32 bg-gradient-to-r from-blue-900 to-indigo-900 relative"></div>
        <div className="px-8 pb-8 relative">
          {/* Avatar */}
          <div className="relative -mt-16 mb-6 inline-block">
            <div className="w-32 h-32 rounded-full border-4 border-[#1e293b] bg-slate-800 overflow-hidden flex items-center justify-center text-4xl font-bold text-slate-400 shadow-xl">
              <img 
                src={avatarUrl ? avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'A')}&background=random`} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'A')}&background=random`;
                }}
              />
            </div>
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-[#1e293b] rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <p className="text-blue-400 font-medium">Quản trị viên hệ thống</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email liên hệ</p>
                    <p className="font-medium text-white">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Số điện thoại</p>
                    <p className="font-medium text-white">{profile.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:border-l md:border-slate-800 md:pl-8">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Vai trò</p>
                  <p className="font-medium text-white capitalize">{profile.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Ngày tham gia</p>
                  <p className="font-medium text-white">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'Không rõ'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-slate-300 mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Đăng nhập bằng</p>
                  <p className="font-medium text-white">
                    {profile.google_id ? 'Google OAuth' : profile.facebook_id ? 'Facebook OAuth' : 'Email & Mật khẩu'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
