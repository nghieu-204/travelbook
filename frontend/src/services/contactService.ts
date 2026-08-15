import { fetchApi } from '@/lib/api';

export const contactService = {
  createContact: async (data: { user_name: string; user_email: string; user_phone?: string; contact_date?: string | null; subject: string; message: string }) => {
    return fetchApi('/contacts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getAdminContacts: async () => {
    return fetchApi('/admin/contacts');
  },

  replyContact: async (id: number, admin_reply: string) => {
    return fetchApi(`/admin/contacts/${id}/reply`, {
      method: 'PUT',
      body: JSON.stringify({ admin_reply })
    });
  }
};
