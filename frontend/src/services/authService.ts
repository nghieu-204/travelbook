import { fetchApi } from '@/lib/api';

export const authService = {
  login: async (credentials: any) => {
    return fetchApi('/login', { data: credentials });
  },
  
  adminLogin: async (credentials: any) => {
    return fetchApi('/admin/login', { data: credentials });
  },

  register: async (userData: any) => {
    return fetchApi('/register', { data: userData });
  },

  forgotPassword: async (email: string) => {
    return fetchApi('/forgot-password', { data: { email } });
  },

  sendOtp: async (email: string) => {
    return fetchApi('/send-otp', { data: { email } });
  },

  resetPassword: async (data: any) => {
    return fetchApi('/reset-password', { data });
  },
};
