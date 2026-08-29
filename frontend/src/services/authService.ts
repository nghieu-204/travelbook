import { fetchApi } from '@/lib/api';

export const authService = {
  login: async (credentials: any) => {
    const res = await fetchApi('/login', { data: credentials });
    return res.data; // Return token and user
  },
  
  adminLogin: async (credentials: any) => {
    const res = await fetchApi('/admin/login', { data: credentials });
    return res.data;
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

  loginGoogle: async (accessToken: string) => {
    const res = await fetchApi('/auth/google', { data: { accessToken } });
    return res.data;
  },

  loginFacebook: async (accessToken: string) => {
    const res = await fetchApi('/auth/facebook', { data: { accessToken } });
    return res.data;
  },
};
