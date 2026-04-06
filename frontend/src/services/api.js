import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

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
};

export const resourceService = {
  list: () => api.get('/resources'),
  stop: (id) => api.post(`/actions/stop?resource_id=${id}`),
};

export const metricService = {
  getLive: () => api.get('/metrics/live'),
  getTimeSeries: (range) => api.get(`/metrics/timeseries?range_days=${range}`),
};

export const reportService = {
  list: () => api.get('/reports'),
  generate: (title) => api.post(`/reports/generate?title=${title}`),
};

export default api;
