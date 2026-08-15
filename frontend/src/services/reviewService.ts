import { fetchApi } from '@/lib/api';

export const reviewService = {
  getTourReviews: async (tourId: number) => {
    return fetchApi(`/reviews/tour/${tourId}`);
  },

  checkEligibility: async (tourId: number, userId: string, email: string) => {
    return fetchApi(`/reviews/check-eligibility?tourId=${tourId}&userId=${userId}&email=${email}`);
  },

  submitReview: async (data: any) => {
    return fetchApi('/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
