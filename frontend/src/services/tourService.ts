import { fetchApi } from '@/lib/api';

export const tourService = {
  // --- TOURS ---
  getTours: async (params?: Record<string, any> | string) => {
    let url = '/tours';
    if (params) {
      const qs = typeof params === 'string' ? params : new URLSearchParams(params as Record<string, string>).toString();
      if (qs) url += `?${qs}`;
    }
    return fetchApi(url);
  },

  getAdminTours: async () => {
    return fetchApi('/tours?isAdmin=true');
  },
  
  createTour: async (data: any) => {
    return fetchApi('/admin/tours', {
      method: 'POST',
      data,
    });
  },

  updateTourStatus: async (id: number, status: string) => {
    return fetchApi(`/admin/tours/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
  },

  deleteTour: async (id: number) => {
    return fetchApi(`/admin/tours/${id}`, {
      method: 'DELETE',
    });
  },

  // --- METADATA (Tags, Destinations, Categories) ---
  getMetadata: async () => {
    return fetchApi('/metadata');
  },

  createMetadata: async (endpoint: string, data: any) => {
    return fetchApi(endpoint, {
      method: 'POST',
      data,
    });
  },

  updateMetadata: async (endpoint: string, id: number, data: any) => {
    return fetchApi(`${endpoint}/${id}`, {
      method: 'PUT',
      data,
    });
  },

  deleteMetadata: async (endpoint: string) => {
    return fetchApi(endpoint, {
      method: 'DELETE',
    });
  }
};
