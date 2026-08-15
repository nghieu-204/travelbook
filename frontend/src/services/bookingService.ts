import { fetchApi } from '@/lib/api';

export const bookingService = {
  getUserBookings: async (userId: number | string) => {
    return fetchApi(`/bookings/user/${userId}`);
  },

  getAdminBookings: async () => {
    return fetchApi('/admin/bookings');
  },

  updateBookingStatus: async (id: number, status: string) => {
    return fetchApi(`/admin/bookings/${id}/status`, {
      method: 'PUT',
      data: { status }
    });
  },

  updatePaymentStatus: async (id: number, payment_status: string) => {
    return fetchApi(`/admin/bookings/${id}/payment-status`, {
      method: 'PUT',
      data: { payment_status }
    });
  },

  updateBooking: async (id: number, data: any) => {
    return fetchApi(`/admin/bookings/${id}`, {
      method: 'PUT',
      data
    });
  },

  cancelBooking: async (id: number | string, userId: number | string, cancelReason: string) => {
    return fetchApi(`/bookings/cancel/${id}`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, cancel_reason: cancelReason })
    });
  }
};
