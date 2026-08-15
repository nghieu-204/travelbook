'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { setLoginModalOpen } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Đường dẫn không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword });

      // Nếu thành công
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error).message || 'Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
    setTimeout(() => {
      setLoginModalOpen(true);
    }, 100);
  };

  if (!token && !isSuccess) {
    return (
      <div className="text-center py-6">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Đường dẫn không hợp lệ</h1>
        <p className="text-slate-600 mb-6">
          Vui lòng kiểm tra lại đường dẫn đặt lại mật khẩu trong email của bạn.
        </p>
        <Link href="/forgot-password" className="w-full inline-block bg-[#0046c1] text-white py-3 rounded-xl font-bold hover:bg-[#00379a] transition-colors">
          Yêu cầu lại link khôi phục
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Thành công!</h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.
        </p>
        <button 
          onClick={handleGoLogin}
          className="w-full bg-[#0046c1] text-white py-3 rounded-xl font-bold hover:bg-[#00379a] transition-colors"
        >
          Trở về trang chủ để đăng nhập
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-black text-slate-900 mb-2">Đặt lại mật khẩu</h1>
      <p className="text-slate-600 mb-6 text-sm">
        Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0046c1]/20 focus:border-[#0046c1] transition-all"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0046c1]/20 focus:border-[#0046c1] transition-all"
            />
          </div>
        </div>
        
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <button 
          type="submit" 
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full bg-[#0046c1] text-white py-3 rounded-xl font-bold hover:bg-[#00379a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận đặt lại'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100">
        
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[#0046c1]" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
