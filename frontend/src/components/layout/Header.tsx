'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, User as UserIcon, LogOut, Menu, Mic } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function Header() {
  const { user, logout, setLoginModalOpen } = useAuthStore()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      router.push(`/tours?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black text-blue-600 tracking-tighter">TRAVEL<span className="text-emerald-500">BOOK</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <a href="/tours" className="hover:text-blue-600 transition-colors">Danh sách Tour</a>
          <Link href="/about" className="hover:text-blue-600 transition-colors">Giới thiệu</Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors">Liên hệ</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-600 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-100"
            >
              <Search className="w-5 h-5" />
            </button>

            {isSearchOpen && (
              <div className="absolute right-0 top-full mt-4 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 before:absolute before:-top-2 before:right-3 before:w-4 before:h-4 before:bg-white before:border-t before:border-l before:border-slate-100 before:rotate-45">
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    placeholder="Tìm kiếm tour..."
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch()
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200/50 focus:bg-white border border-transparent focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 outline-none rounded-full py-2.5 pl-4 pr-16 text-sm transition-all"
                  />
                  <div className="absolute right-3 flex items-center gap-2 text-slate-500">
                    <button className="hover:text-red-500 transition-colors group" title="Tìm kiếm bằng giọng nói">
                      <Mic className="w-4 h-4 group-hover:animate-pulse" />
                    </button>
                    <button onClick={handleSearch} className="hover:text-blue-600 transition-colors" title="Tìm kiếm">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold hidden sm:block">{user.name}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50" onClick={() => setIsDropdownOpen(false)}>Vào trang Admin</Link>
                  )}
                  <Link href="/user" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setIsDropdownOpen(false)}>Hồ sơ của tôi</Link>
                  <Link href="/user/bookings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setIsDropdownOpen(false)}>Đơn đặt tour</Link>
                  <button
                    onClick={() => { logout(); setIsDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </button>
          )}

          <button className="md:hidden p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
