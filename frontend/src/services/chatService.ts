import { fetchApi } from '@/lib/api';

export const chatService = {
  getChatHistory: async (sessionId: string) => {
    return fetchApi(`/chat/${sessionId}`);
  },

  sendMessage: async (message: string, sessionId: string | null, userId?: number | string) => {
    return fetchApi('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        sessionId,
        userId
      })
    });
  }
};
