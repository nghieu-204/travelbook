/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchApi } from '@/lib/api'
import { ChevronLeft, User as UserIcon, MapPin, Phone, Mail, Calendar, CreditCard, Loader2, Shield, Activity, XCircle, ShoppingBag, Key } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import Link from 'next/link'
import { USER_STATUS, USER_ROLE, BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/status'
import { toast } from 'react-hot-toast'

// Component xử lý ảnh đại diện có fallback
const AvatarFallback = ({ profile }: { profile: any }) => {
  const [hasError, setHasError] = useState(false);

  if (!profile.avatar || hasError) {
    return profile.role === USER_ROLE.ADMIN 
      ? <Shield className="w-6 h-6 text-emerald-500" /> 
      : <UserIcon className="w-6 h-6 text-slate-400" />;
  }

  return (
    <img 
      src={getImageUrl(profile.avatar)} 
      alt={profile.name} 
      className="w-full h-full object-cover" 
      onError={() => setHasError(true)}
    />
  );
};

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings'>('overview')
  const [data, setData] = useState<{
    profile: any;
    bookings: any[];
    insights: any;
  } | null>(null)

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetchApi(`/admin/users/${id}/details`)
        setData(response)
      } catch (error: any) {
        toast.error(error.message || 'Lỗi tải dữ liệu người dùng')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (id) loadDetails()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data || !data.profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy người dùng</h2>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const { profile, bookings, insights } = data

  return (
    <div className="pb-20">
      {/* Top Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-200 rounded-lg transition-colors bg-white shadow-sm border border-slate-200"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            <AvatarFallback profile={profile} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">{profile.name}</h1>
            <div className="text-sm text-slate-400 flex items-center gap-2">
              <span>#{profile.id}</span>
              <span>•</span>
              <span className={`font-semibold ${profile.status === USER_STATUS.ACTIVE || !profile.status ? 'text-emerald-600' : 'text-red-600'}`}>
                {profile.status === USER_STATUS.ACTIVE || !profile.status ? 'Đang hoạt động' : 'Bị khóa'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Tổng quan & Thống kê
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'bookings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Lịch sử Đặt Tour
          <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
            {bookings.length}
          </span>
        </button>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Thông tin cá nhân */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Thông tin cá nhân</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</div>
                    <div className="text-slate-800 font-medium">{profile.email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số điện thoại</div>
                    <div className="text-slate-800 font-medium">{profile.phone || 'Chưa cập nhật'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Địa chỉ</div>
                    <div className="text-slate-800 font-medium">{profile.address || 'Chưa cập nhật'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phương thức đăng nhập</div>
                    <div className="text-slate-800 font-medium">
                      {profile.auth_provider === 'google' ? 'Google' : profile.auth_provider === 'facebook' ? 'Facebook' : 'Email & Mật khẩu'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tham gia</div>
                    <div className="text-slate-800 font-medium">
                      {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Thống kê CRM */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-white">Phân tích CRM (CRM Insights)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShoppingBag className="w-16 h-16 text-blue-600" />
                </div>
                <div className="relative z-10">
                  <div className="text-sm font-semibold text-slate-500 mb-2">Tổng số tour đã đi</div>
                  <div className="text-4xl font-black text-blue-600">{insights.totalTours}</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CreditCard className="w-16 h-16 text-emerald-600" />
                </div>
                <div className="relative z-10">
                  <div className="text-sm font-semibold text-slate-500 mb-2">Tổng tiền chi tiêu</div>
                  <div className="text-3xl font-black text-emerald-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(insights.totalSpent)}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <XCircle className="w-16 h-16 text-red-600" />
                </div>
                <div className="relative z-10">
                  <div className="text-sm font-semibold text-slate-500 mb-2">Tỷ lệ hủy tour</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-black text-red-600">{insights.cancelRate}%</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Bookings */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-4 font-semibold w-28">Mã BK</th>
                  <th className="p-4 font-semibold">Tên Tour</th>
                  <th className="p-4 font-semibold">Ngày đi</th>
                  <th className="p-4 font-semibold text-center">Khách</th>
                  <th className="p-4 font-semibold text-right">Tổng tiền</th>
                  <th className="p-4 font-semibold">Thanh toán</th>
                  <th className="p-4 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      Khách hàng này chưa đặt tour nào.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking: any) => (
                    <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-sm text-slate-500">#{booking.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 line-clamp-2">{booking.tour_name}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Đặt lúc: {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        {new Date(booking.departure_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-sm">
                          <span className="font-bold">{booking.adults}</span> NL
                          {booking.children > 0 && <span>, <span className="font-bold">{booking.children}</span> TE</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-blue-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
                          booking.payment_status === PAYMENT_STATUS.PAID ? 'bg-emerald-100 text-emerald-700' :
                          booking.payment_status === 'Đã cọc' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
                          booking.status === BOOKING_STATUS.CANCELLED ? 'bg-red-100 text-red-700' :
                          booking.status === BOOKING_STATUS.COMPLETED ? 'bg-purple-100 text-purple-700' :
                          booking.status === BOOKING_STATUS.CONFIRMED ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
