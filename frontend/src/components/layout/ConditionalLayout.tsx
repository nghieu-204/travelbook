'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { useAuthStore } from '@/store/useAuthStore'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()
  
  const isAdminRoute = pathname?.startsWith('/admin')

  useEffect(() => {
    if (user?.role === 'admin' && !isAdminRoute) {
      router.push('/admin')
    }
  }, [user, isAdminRoute, router])

  if (isAdminRoute) {
    return <main className="flex-1 flex flex-col">{children}</main>
  }

  if (user?.role === 'admin') {
    return null
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}
