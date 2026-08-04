import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
  phone?: string
  address?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoginModalOpen: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setLoginModalOpen: (isOpen: boolean) => void
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoginModalOpen: false,
      login: (user, token) => set({ user, token, isLoginModalOpen: false }),
      logout: () => set({ user: null, token: null }),
      setLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
    }),
    {
      name: 'auth-storage', // Tên key trong localStorage
      partialize: (state) => ({ user: state.user, token: state.token }), // Chỉ lưu user và token
    }
  )
)
