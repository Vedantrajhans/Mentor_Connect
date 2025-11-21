import apiClient from './axios';

/**
 * Transform review data from API response
 */
const transformReview = (review) => {
  if (!review) return null;
  
  return {
    ...review,
    _id: review._id || review.id,
    reviewer: review.reviewer ? {
      id: review.reviewer._id,
      _id: review.reviewer._id,
      fullName: review.reviewer.fullName,
      email: review.reviewer.email,
      university: review.reviewer.university,
    } : null,
    reviewee: review.reviewee ? {
      id: review.reviewee._id,
      _id: review.reviewee._id,
      fullName: review.reviewee.profile?.fullName || review.reviewee.fullName,
      email: review.reviewee.email,
      university: review.reviewee.profile?.university || review.reviewee.university,
    } : null,
  };
};

/**
 * Create a review
 * @param {Object} reviewData - {sessionId, rating, comment}
 */
export const createReview = async (reviewData) => {
  const response = await apiClient.post('/reviews', reviewData);
  return transformReview(response.data);
};

/**
 * Get reviews for a mentor
 * @param {string} mentorId
 */
export const getMentorReviews = async (mentorId) => {
  const response = await apiClient.get(`/reviews/mentor/${mentorId}`);
  const reviewsArray = response.data.reviews || response.data;
  return reviewsArray.map(transformReview);
};

/**
 * Get my reviews (as reviewer)
 */
export const getMyReviews = async () => {
  const response = await apiClient.get('/reviews/my');
  const reviewsArray = response.data.reviews || response.data;
  return reviewsArray.map(transformReview);
};
