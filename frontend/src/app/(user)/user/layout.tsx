'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuthStore()

  const links = [
    { href: '/user', label: 'Cài đặt hồ sơ', icon: User },
    { href: '/user/bookings', label: 'Đơn đặt của tôi', icon: ShoppingBag },
  ]

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sticky top-24">
              <nav className="space-y-2">
                {links.map(link => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors", isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50")}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  )
                })}
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
