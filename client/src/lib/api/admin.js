import apiClient from './axios';

/**
 * Get all pending mentors for approval
 */
export const getPendingMentors = async () => {
  const response = await apiClient.get('/admin/mentors/pending');
  return response.data;
};

/**
 * Approve a mentor
 * @param {string} mentorId
 */
export const approveMentor = async (mentorId) => {
  const response = await apiClient.post(`/admin/mentors/${mentorId}/approve`);
  return response.data;
};

/**
 * Reject a mentor
 * @param {string} mentorId
 * @param {string} reason
 */
export const rejectMentor = async (mentorId, reason) => {
  const response = await apiClient.post(`/admin/mentors/${mentorId}/reject`, { reason });
  return response.data;
};

/**
 * Get all users
 * @param {Object} filters - {role, status}
 */
export const getAllUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const response = await apiClient.get(`/admin/users?${params.toString()}`);
  return response.data;
};

/**
 * Get all sessions
 */
export const getAllSessions = async () => {
  const response = await apiClient.get('/admin/sessions');
  return response.data;
};

/**
 * Get analytics data
 */
export const getAnalytics = async () => {
  const response = await apiClient.get('/admin/analytics');
  return response.data;
};

/**
 * Suspend/Activate user
 * @param {string} userId
 * @param {boolean} suspend
 */
export const updateUserStatus = async (userId, suspend) => {
  const response = await apiClient.put(`/admin/users/${userId}/status`, { suspended: suspend });
  return response.data;
};
