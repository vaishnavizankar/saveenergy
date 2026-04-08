import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Auto-inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post(`/auth/forgot-password?email=${email}`),
  confirmReset: (email, code, newPassword) => api.post(`/auth/confirm-reset?email=${email}&code=${code}&new_password=${newPassword}`),
};

export const resourceService = {
  list: () => api.get('/resources'),
  stop: (id) => api.post(`/actions/stop?resource_id=${id}`),
  start: (id) => api.post(`/actions/start?resource_id=${id}`),
  sync: () => api.post('/actions/sync'),
};

export const metricService = {
  getLive: () => api.get('/metrics/live'),
  getTimeSeries: (range) => api.get(`/metrics/timeseries?range_days=${range}`),
  getCostBreakdown: () => api.get('/metrics/cost-breakdown'),
};

export const reportService = {
  list: () => api.get('/reports'),
  generate: (title) => api.post(`/reports/generate?title=${title}`),
};

export default api;
