import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const AI_BASE = `${API_BASE}/ai`;
const REQUEST_TIMEOUT_MS = 20000;
const AUTH_TIMEOUT_MS = 12000;

const api = axios.create({
  baseURL: API_BASE,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

const isAuthEndpoint = (url = '') => url.includes('/auth/login') || url.includes('/auth/register');

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sevadrishti_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isAuthEndpoint(error.config?.url)) {
      localStorage.removeItem('sevadrishti_token');
      localStorage.removeItem('sevadrishti_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const aiApi = axios.create({
  baseURL: AI_BASE,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request for aiApi
aiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('sevadrishti_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses for aiApi
aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sevadrishti_token');
      localStorage.removeItem('sevadrishti_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ====== AUTH ======
export const authService = {
  register: (data) => api.post('/auth/register', data, { timeout: AUTH_TIMEOUT_MS }),
  login: (data) => api.post('/auth/login', data, { timeout: AUTH_TIMEOUT_MS }),
  getMe: () => api.get('/auth/me'),
};

// ====== VOLUNTEERS ======
export const volunteerService = {
  create: (data) => api.post('/volunteers', data),
  getAll: (params) => api.get('/volunteers', { params }),
  getById: (id) => api.get(`/volunteers/${id}`),
  update: (id, data) => api.put(`/volunteers/${id}`, data),
  delete: (id) => api.delete(`/volunteers/${id}`),
  getAvailable: (params) => api.get('/volunteers/available', { params }),
  getByZone: (zoneId) => api.get(`/volunteers/by-zone/${zoneId}`),
  getMyProfile: () => api.get('/volunteers/me'),
};

// ====== ZONES ======
export const zoneService = {
  create: (data) => api.post('/zones', data),
  getAll: () => api.get('/zones'),
  getById: (id) => api.get(`/zones/${id}`),
  update: (id, data) => api.put(`/zones/${id}`, data),
  delete: (id) => api.delete(`/zones/${id}`),
  getStats: () => api.get('/zones/stats'),
  updateCrowdDensity: (id, density) => api.put(`/zones/${id}/crowd-density`, { density }),
};

// ====== SHIFTS ======
export const shiftService = {
  create: (data) => api.post('/shifts', data),
  getAll: (params) => api.get('/shifts', { params }),
  getByVolunteer: (volunteerId) => api.get(`/shifts/volunteer/${volunteerId}`),
  update: (id, data) => api.put(`/shifts/${id}`, data),
  requestSwap: (data) => api.post('/shifts/swap-request', data),
};

// ====== INCIDENTS ======
export const incidentService = {
  create: (data) => api.post('/incidents', data),
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  updateStatus: (id, status) => api.put(`/incidents/${id}/status`, { status }),
  mobilize: (id) => api.post(`/incidents/${id}/mobilize`),
};

// ====== ALLOCATIONS ======
export const allocationService = {
  assign: (data) => api.post('/allocations/assign', data),
  getByZone: (zoneId) => api.get(`/allocations/zone/${zoneId}`),
  getAll: (params) => api.get('/allocations', { params }),
  update: (id, data) => api.put(`/allocations/${id}`, data),
};

// ====== DASHBOARD ======
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getActivityFeed: () => api.get('/dashboard/activity-feed'),
};

// ====== AI SERVICE ======
export const aiService = {
  skillMatch: (data) => aiApi.post('/skill-match', data),
  suggestTags: (data) => aiApi.post('/suggest-tags', data),
  optimizeAllocation: (data) => aiApi.post('/optimize-allocation', data),
  predictFatigue: (data) => aiApi.post('/predict-fatigue', data),
  bulkFatigue: (data) => aiApi.post('/bulk-fatigue', data),
  findResponders: (data) => aiApi.post('/incident-responders', data),
  rebalanceZones: (data) => aiApi.post('/rebalance-zones', data),
  analyze: (data) => aiApi.post('/analyze', data),
  health: () => aiApi.get('/health'),
};

export default api;
