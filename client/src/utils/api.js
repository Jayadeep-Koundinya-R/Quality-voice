import axios from 'axios';

// Get API URL from environment or use production fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'|| 
  (import.meta.env.PROD ? 'https://api.qualityvoice.app' : 'http://localhost:5000');

if (!process.env.REACT_APP_API_URL && import.meta.env.PROD) {
  console.warn('⚠️ REACT_APP_API_URL not set. Using default:', API_URL);
}

export { API_URL };
const API = axios.create({
  baseURL: `${API_URL}/api`
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('qv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);

// Users
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (data) => API.put('/users/profile', data);

// Shops
export const getShops = (params) => API.get('/shops', { params });
export const getShop = (id) => API.get(`/shops/${id}`);
export const createShop = (data) => API.post('/shops', data);

// Reviews
export const getReviews = (shopId) => API.get(`/reviews/${shopId}`);
export const createReview = (data) => API.post('/reviews', data);
export const likeReview = (reviewId) => API.post(`/reviews/${reviewId}/like`);
export const markHelpful = (reviewId) => API.post(`/reviews/${reviewId}/helpful`);

// Comments
export const getComments = (reviewId) => API.get(`/comments/${reviewId}`);
export const createComment = (data) => API.post('/comments', data);

// Reports
export const createReport = (data) => API.post('/reports', data);
export const getReports = () => API.get('/reports');
export const updateReportStatus = (id) => API.put(`/reports/${id}/status`);

// Badges
export const giveBadge = (shopId) => API.post(`/badges/${shopId}`);
export const removeBadge = (shopId) => API.delete(`/badges/${shopId}`);

// Feed
export const getFeed = (params) => API.get('/feed', { params });

// Notifications
export const getNotifications = () => API.get('/notifications');
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markAllRead = () => API.put('/notifications/mark-all-read');
export const markOneRead = (id) => API.put(`/notifications/${id}/read`);

export default API;
