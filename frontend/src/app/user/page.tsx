'use client'

import { Camera } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function UserProfilePage() {
  const { user } = useAuthStore()

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Cài đặt hồ sơ</h1>
      
      <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl border-4 border-white shadow-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-blue-700 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user?.name || 'Tên người dùng'}</h2>
          <p className="text-slate-500">{user?.email || 'email@example.com'}</p>
          <button className="mt-3 text-sm font-medium text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">Đổi mật khẩu</button>
        </div>
      </div>

      <form className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên</label>
            <input type="text" defaultValue={user?.name} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="Chưa cập nhật" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input type="email" disabled defaultValue={user?.email} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none cursor-not-allowed" />
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          Lưu thay đổi
        </button>
      </form>
    </div>
  )
}
