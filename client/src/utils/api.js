import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wishcart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  googleLogin: (data) => api.post('/api/auth/google', data),
  sendOtp: (data) => api.post('/api/auth/send-otp', data),
  verifyOtp: (data) => api.post('/api/auth/verify-otp', data),
  loginOtp: (data) => api.post('/api/auth/login-otp', data)
};

// Products endpoints
export const productsAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  getFeatured: () => api.get('/api/products/featured/list'),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`)
};

// Orders endpoints
export const ordersAPI = {
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  getMyOrders: () => api.get('/api/orders/my-orders'),
  create: (data) => api.post('/api/orders', data),
  update: (id, data) => api.put(`/api/orders/${id}`, data)
};

// Reviews endpoints
export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/api/reviews/${productId}`),
  create: (productId, data) => api.post(`/api/reviews/${productId}`, data),
  delete: (id) => api.delete(`/api/reviews/${id}`)
};

export default api;
