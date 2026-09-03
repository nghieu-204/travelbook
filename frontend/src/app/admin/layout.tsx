/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Map, ShoppingBag, Users, LogOut, MessageSquare, MapPin, Tag, Menu, User, Settings } from 'lucide-react'
import { cn, getImageUrl } from '@/lib/utils'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { useEffect, useState } from 'react'
import { USER_ROLE } from '@/constants/status'

// Component xử lý ảnh đại diện có fallback
const AvatarFallback = ({ user }: { user: any }) => {
  const [hasError, setHasError] = useState(false);

  if (!user?.avatar || hasError) {
    return (
      <img 
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=random`}
        alt="Avatar" 
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <img 
      src={getImageUrl(user.avatar)}
      alt="Avatar" 
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAdminAuthStore()
  const [isMounted, setIsMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!user || user.role !== USER_ROLE.ADMIN) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    } else if (pathname === '/admin/login') {
      router.push('/admin')
    }
  }, [user, router, pathname])

  if (!isMounted) {
    return (
      <div className="fixed inset-0 z-[100] flex bg-[#0f172a] items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user || user.role !== USER_ROLE.ADMIN) {
    return (
      <div className="fixed inset-0 z-[100] flex bg-[#0f172a] items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const linkGroups = [
    {
      label: 'VẬN HÀNH',
      links: [
        { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
        { href: '/admin/bookings', label: 'Quản lý Đơn đặt', icon: ShoppingBag },
        { href: '/admin/contacts', label: 'Liên hệ', icon: MessageSquare },
      ]
    },
    {
      label: 'DỊCH VỤ',
      links: [
        { href: '/admin/tours', label: 'Quản lý Tour', icon: Map },
        { href: '/admin/destinations', label: 'Khu vực & Điểm đến', icon: MapPin },
        { href: '/admin/tags', label: 'Quản lý Nhãn', icon: Tag },
      ]
    },
    {
      label: 'HỆ THỐNG',
      links: [
        { href: '/admin/users', label: 'Người dùng', icon: Users },
      ]
    }
  ]

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    window.location.href = '/admin/login';
  }

  return (
    <div className="flex w-full h-full min-h-screen bg-[#0f172a] text-slate-300 font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[#1e293b] border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-none opacity-0"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0 whitespace-nowrap">
          <span className="text-xl font-black text-white tracking-tighter">ADMIN<span className="text-emerald-500">PANEL</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto whitespace-nowrap min-w-[256px]">
          {linkGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.links.map(link => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn("flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors", isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-[#334155] hover:text-white")}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 whitespace-nowrap min-w-[256px]">
          <button onClick={() => setIsLogoutModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-slate-400 hover:bg-[#334155] hover:text-white transition-colors">
            <LogOut className="w-5 h-5 shrink-0" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="h-16 bg-[#1e293b] border-b border-slate-800 flex items-center justify-between px-8 shrink-0 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-white">Bảng Điều Khiển</h2>
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                <AvatarFallback user={user} />
              </div>
              <span className="text-sm font-medium text-slate-300">{user?.name || 'Admin'}</span>
            </button>

            {isAccountMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsAccountMenuOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-[#1e293b] border border-slate-700 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 py-2">
                  <Link href="/admin/profile" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-[#334155] hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                    Hồ sơ cá nhân
                  </Link>
                  <Link href="/admin/settings" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-[#334155] hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                    Cài đặt tài khoản
                  </Link>
                  <div className="h-px bg-slate-700 my-2"></div>
                  <button onClick={() => { setIsAccountMenuOpen(false); setIsLogoutModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-[#0f172a]">
          {children}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-6 w-[400px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Đăng xuất</h3>
            <p className="text-slate-400 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
