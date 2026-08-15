'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setLoginModalOpen } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      
      // Nếu thành công
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error).message || 'Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
    setTimeout(() => {
      setLoginModalOpen(true);
    }, 100);
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100">
        <button onClick={handleBackToLogin} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0046c1] transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
        </button>
        
        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Đã gửi liên kết</h1>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến email <br/><span className="font-semibold text-slate-900">{email}</span>.
              <br/><br/>Vui lòng kiểm tra hộp thư đến (hoặc thư rác) và làm theo hướng dẫn.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="w-full bg-[#0046c1] text-white py-3 rounded-xl font-bold hover:bg-[#00379a] transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Khôi phục mật khẩu</h1>
            <p className="text-slate-600 mb-6 text-sm">
              Nhập email bạn đã đăng ký để nhận liên kết khôi phục mật khẩu.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email của bạn</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: nguyenvan@gmail.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0046c1]/20 focus:border-[#0046c1] transition-all"
                  />
                </div>
              </div>
              
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <button 
                type="submit" 
                disabled={loading || !email}
                className="w-full bg-[#0046c1] text-white py-3 rounded-xl font-bold hover:bg-[#00379a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi yêu cầu khôi phục'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
