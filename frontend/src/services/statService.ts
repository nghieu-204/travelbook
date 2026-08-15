import { fetchApi } from '@/lib/api';

export const statService = {
  getStats: async (timeFilter: string = 'month') => {
    return fetchApi(`/admin/stats?time=${timeFilter}`);
  },

  exportDashboardSummary: async () => {
    let token = '';
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('admin-auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          token = state?.token || '';
        } catch (e) {
          console.error(e);
        }
      }
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api';
    const response = await fetch(`${API_URL}/admin/reports/dashboard-summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error("Lỗi tải file");
    return response.blob();
  }
};
