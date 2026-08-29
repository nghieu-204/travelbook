'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { USER_ROLE } from '@/constants/status'

export default function AdminRedirect() {
  const { user } = useAuthStore()
  const router = useRouter()
  
  useEffect(() => {
    if (user?.role === USER_ROLE.ADMIN) {
      router.push('/admin')
    }
  }, [user, router])
  
  return null
}
