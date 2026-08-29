'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { user, setLoginModalOpen } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user) {
      // Đã đăng nhập, quay lại trang trước đó
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    } else {
      // Chưa đăng nhập, bật modal
      setLoginModalOpen(true);
    }
  }, [user, setLoginModalOpen, router, searchParams]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col items-center justify-center p-4">
      <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Yêu cầu đăng nhập</h1>
      <p className="text-slate-500 mb-6 text-center max-w-md">
        Bạn cần đăng nhập để truy cập tính năng này. Vui lòng đăng nhập qua hộp thoại hoặc bấm nút bên dưới.
      </p>
      <button 
        onClick={() => setLoginModalOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
      >
        <LogIn className="w-5 h-5" />
        Đăng nhập ngay
      </button>
    </div>
  );
}
