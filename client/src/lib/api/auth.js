import apiClient from './axios';

/**
 * Register a new user
 * @param {Object} userData - {fullName, email, password, role}
 * @returns {Promise<{success: boolean, token: string, user: Object}>}
 */
export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data; // {success, token, user}
};

/**
 * Login user
 * @param {Object} credentials - {email, password}
 * @returns {Promise<{success: boolean, token: string, user: Object}>}
 */
export const loginUser = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data; // {success, token, user}
};

/**
 * Get current user profile
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * Logout (client-side only)
 */
export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};
