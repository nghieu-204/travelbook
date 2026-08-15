import { fetchApi } from '@/lib/api';

export const userService = {
  getProfile: async () => {
    return fetchApi('/profile');
  },

  updateProfile: async (data: any) => {
    return fetchApi('/profile', {
      method: 'PUT',
      data,
    });
  },

  getUsers: async (urlOrParams?: string | Record<string, any>) => {
    let url = '/admin/users';
    if (typeof urlOrParams === 'string') {
      url = urlOrParams;
    } else if (urlOrParams) {
      const qs = new URLSearchParams(urlOrParams as any).toString();
      if (qs) url += `?${qs}`;
    }
    return fetchApi(url);
  },

  deleteUser: async (id: number) => {
    return fetchApi(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  updateUserStatus: async (id: number, status: string) => {
    return fetchApi(`/admin/users/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
  },

  resetUserPassword: async (id: number) => {
    return fetchApi(`/admin/users/${id}/reset-password`, {
      method: 'POST',
    });
  },

  updateUser: async (id: number, data: any) => {
    return fetchApi(`/admin/users/${id}`, {
      method: 'PUT',
      data,
    });
  },

  changeUserRole: async (id: number, newRole: string) => {
    return fetchApi(`/admin/users/${id}/role`, {
      method: 'PUT',
      data: { role: newRole },
    });
  }
};
