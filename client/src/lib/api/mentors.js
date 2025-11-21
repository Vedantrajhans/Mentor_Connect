import apiClient from "./axios";

/**
 * Transform mentor data from API response
 */
const transformMentor = (mentor) => {
  if (!mentor) return null;

  return {
    id: mentor._id,
    _id: mentor._id,
    fullName: mentor.profile?.fullName || mentor.fullName,
    email: mentor.email,
    bio: mentor.profile?.bio || mentor.bio,
    photo: mentor.profile?.photo || mentor.photo,
    university: mentor.profile?.university || mentor.university,
    program: mentor.profile?.program || mentor.program,
    graduationYear: mentor.profile?.graduationYear || mentor.graduationYear,
    expertise: mentor.profile?.expertise || mentor.expertise || [],
    phone: mentor.profile?.phone || mentor.phone,
    availability: mentor.profile?.availability || mentor.availability || [],
    averageRating: mentor.profile?.rating || mentor.averageRating || 0,
    totalReviews: mentor.profile?.totalReviews || mentor.totalReviews || 0,
    isApproved: mentor.isApproved,
  };
};

/**
 * Search mentors with filters
 * @param {Object} filters - {university, program, expertise, page, limit}
 */
export const searchMentors = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.keys(filters).forEach((key) => {
    if (filters[key]) params.append(key, filters[key]);
  });

  const response = await apiClient.get(`/mentors/search?${params.toString()}`);

  // Handle different response structures
  const mentorsArray = response.data.mentors || response.data;

  // Transform mentors data
  const transformedMentors = mentorsArray.map(transformMentor);

  return transformedMentors;
};

/**
 * Get mentor by ID
 * @param {string} mentorId
 */
export const getMentorById = async (mentorId) => {
  const response = await apiClient.get(`/mentors/${mentorId}`);
  return transformMentor(response.data);
};

/**
 * Get all approved mentors
 */
export const getAllMentors = async () => {
  const response = await apiClient.get("/mentors");

  // Handle different response structures
  const mentorsArray = response.data.mentors || response.data;

  // Transform mentors data
  const transformedMentors = mentorsArray.map(transformMentor);

  return transformedMentors;
};

/**
 * Complete mentor profile (initial setup)
 * @param {Object} profileData - Profile fields
 */
export const completeMentorProfile = async (profileData) => {
  const response = await apiClient.post("/mentors/profile", profileData);
  return transformMentor(response.data);
};

/**
 * Get my mentor profile
 */
export const getMyMentorProfile = async () => {
  const response = await apiClient.get("/mentors/profile/me");
  return response.data; // Return raw data, not transformed
};

/**
 * Update mentor profile
 * @param {Object} profileData - Updated profile fields
 */
export const updateMentorProfile = async (profileData) => {
  const response = await apiClient.put("/mentors/profile", profileData);
  return transformMentor(response.data);
};

/**
 * Update availability
 * @param {Array} availability - Array of ISO date strings
 */
export const updateAvailability = async (availability) => {
  const response = await apiClient.put("/mentors/availability", {
    availability,
  });
  return response.data;
};
