/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Map, ShoppingBag, Users, LogOut, MessageSquare, MapPin, Tag, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { useEffect, useState } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAdminAuthStore()
  const [isMounted, setIsMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'admin') {
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-[100] flex bg-[#0f172a] items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const links = [
    { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/admin/tours', label: 'Quản lý Tour', icon: Map },
    { href: '/admin/destinations', label: 'Khu vực & Điểm đến', icon: MapPin },
    { href: '/admin/tags', label: 'Quản lý Nhãn', icon: Tag },
    { href: '/admin/bookings', label: 'Quản lý Đơn đặt', icon: ShoppingBag },
    { href: '/admin/users', label: 'Người dùng', icon: Users },
    { href: '/admin/contacts', label: 'Liên hệ', icon: MessageSquare },
  ]

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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto whitespace-nowrap min-w-[256px]">
          {links.map(link => {
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
        </nav>
        <div className="p-4 border-t border-slate-800 whitespace-nowrap min-w-[256px]">
          <button onClick={() => { logout(); router.push('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-slate-400 hover:bg-[#334155] hover:text-white transition-colors">
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'A'
              )}
            </div>
            <span className="text-sm font-medium text-slate-300">{user?.name || 'Admin'}</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-[#0f172a]">
          {children}
        </div>
      </main>
    </div>
  )
}
