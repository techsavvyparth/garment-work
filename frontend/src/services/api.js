import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

export const ladiesAPI = {
  getAll: (params) => api.get('/ladies', { params }),
  getById: (id, params) => api.get(`/ladies/${id}`, { params }),
  create: (data) => api.post('/ladies', data),
  update: (id, data) => api.put(`/ladies/${id}`, data),
  delete: (id) => api.delete(`/ladies/${id}`),
};

export const workAPI = {
  getAll: (params) => api.get('/work', { params }),
  create: (data) => api.post('/work', data),
  update: (id, data) => api.put(`/work/${id}`, data),
  delete: (id) => api.delete(`/work/${id}`),
  getTypes: () => api.get('/work/types/list'),
};

export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getLadyMonthly: (id, params) => api.get(`/reports/lady/${id}/monthly`, { params }),
  getPending: () => api.get('/reports/pending'),
};

export default api;
