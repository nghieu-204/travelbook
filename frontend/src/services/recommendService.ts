import { fetchApi } from '@/lib/api';

export const recommendService = {
  getRecentlyViewed: async (userId?: number) => {
    const endpoint = userId ? `/suggestions/recently-viewed?userId=${userId}` : '/suggestions/recently-viewed';
    return fetchApi(endpoint);
  },

  getPersonalized: async (userId?: number) => {
    const endpoint = userId ? `/suggestions/personalized?userId=${userId}` : '/suggestions/personalized';
    return fetchApi(endpoint);
  },

  trackTourView: async (tourId: number, userId: number | string) => {
    return fetchApi('/suggestions/tracking', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        tourId,
        interactionType: 'view'
      })
    });
  }
};
