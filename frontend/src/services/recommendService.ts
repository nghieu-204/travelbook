import { fetchApi } from '@/lib/api';

export const recommendService = {
  getRecommendations: async (userId?: number) => {
    const endpoint = userId ? `/recommendations?userId=${userId}` : '/recommendations';
    return fetchApi(endpoint);
  },

  trackTourView: async (tourId: number, userId: number | string) => {
    return fetchApi('/recommendations/tracking', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        tourId,
        interactionType: 'view'
      })
    });
  }
};
