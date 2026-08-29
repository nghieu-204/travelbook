import { fetchApi } from '@/lib/api';

export const recommendService = {
  getRecommendations: async (userId?: number) => {
    const endpoint = userId ? `/suggestions?userId=${userId}` : '/suggestions';
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
