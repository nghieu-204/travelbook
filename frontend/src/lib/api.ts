const API_URL = typeof window !== 'undefined'
  ? '/api'
  : (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api');

interface FetchOptions extends RequestInit {
  data?: Record<string, unknown>;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { data, headers, ...customConfig } = options;

  // Cấu hình headers mặc định
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Nếu body hoặc data là FormData, KHÔNG GÁN Content-Type để trình duyệt tự set multipart/form-data
  if (customConfig.body instanceof FormData || data instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  // Lấy token từ LocalStorage nếu ở môi trường client
  if (typeof window !== 'undefined') {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const storageKey = isAdminRoute ? 'admin-auth-storage' : 'auth-storage';
    const authStorage = localStorage.getItem(storageKey);
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          defaultHeaders['Authorization'] = `Bearer ${state.token}`;
        }
      } catch (e) {
        console.error(`Lỗi khi parse ${storageKey}`, e);
      }
    }
  }

  const config: RequestInit = {
    method: data || customConfig.body ? 'POST' : 'GET',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    cache: 'no-store',
    ...customConfig,
  };

  if (data) {
    if (data instanceof FormData) {
      config.body = data;
    } else {
      config.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // Không chặn lỗi 401/403 nếu đang ở trang đăng nhập
          if (!currentPath.includes('/login')) {
            if (currentPath.startsWith('/admin')) {
               const { useAdminAuthStore } = await import('@/store/useAdminAuthStore');
               useAdminAuthStore.getState().logout();
               window.location.href = '/admin/login';
               return new Promise(() => {}); // Prevent throwing error while redirecting
            } else {
               const { useAuthStore } = await import('@/store/useAuthStore');
               useAuthStore.getState().logout();
               const { default: toast } = await import('react-hot-toast');
               toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
               window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
               return new Promise(() => {}); // Prevent throwing error while redirecting
            }
          }
        }
      }
      throw new Error(result.message || 'Có lỗi xảy ra khi gọi API');
    }

    return result;
  } catch (error: unknown) {
    throw error;
  }
}
