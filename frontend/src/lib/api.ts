const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api';
import { useAuthStore } from '@/store/useAuthStore';

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { data, headers, ...customConfig } = options;

  // Cấu hình headers mặc định
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Lấy token từ LocalStorage nếu ở môi trường client
  if (typeof window !== 'undefined') {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          defaultHeaders['Authorization'] = `Bearer ${state.token}`;
        }
      } catch (e) {
        console.error('Lỗi khi parse auth-storage', e);
      }
    }
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    cache: 'no-store',
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        if (typeof window !== 'undefined') {
          useAuthStore.getState().logout();
          if (window.location.pathname.startsWith('/admin')) {
             window.location.href = '/';
          } else {
             useAuthStore.getState().setLoginModalOpen(true);
          }
        }
      }
      throw new Error(result.message || 'Có lỗi xảy ra khi gọi API');
    }

    return result;
  } catch (error: any) {
    throw error;
  }
}
