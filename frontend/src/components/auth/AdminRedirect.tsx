'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'

export default function AdminRedirect() {
  const { user } = useAuthStore()
  const router = useRouter()
  
  useEffect(() => {
    if (user?.role === 'admin') {
      router.push('/admin')
    }
  }, [user, router])
  
  return null
}
