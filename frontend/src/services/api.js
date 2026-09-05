import axios from 'axios';

export const getApiBaseUrl = () => {
  return localStorage.getItem('heathealth_backend_url') || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
};

export const setCustomApiBaseUrl = (url) => {
  if (url) {
    let clean = url.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api')) clean += '/api';
    localStorage.setItem('heathealth_backend_url', clean);
  } else {
    localStorage.removeItem('heathealth_backend_url');
  }
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT access token & sync baseURL
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = localStorage.getItem('heathealth_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle token refresh if 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('heathealth_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${getApiBaseUrl()}/auth/token/refresh/`, { refresh: refreshToken });
          if (res.data?.access) {
            localStorage.setItem('heathealth_access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('heathealth_access_token');
          localStorage.removeItem('heathealth_refresh_token');
          localStorage.removeItem('heathealth_user');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register/', data),
  verifyEmail: (data) => api.post('/auth/verify-email/', data),
  resendVerification: (data) => api.post('/auth/resend-verification/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/me/', data),
  forgotPassword: (data) => api.post('/auth/forgot-password/', data),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),

  // Admin Verification Management
  getVerifications: (status) => api.get('/auth/admin/verifications/', { params: { status } }),
  reviewVerification: (id, action, data) => api.post(`/auth/admin/verifications/${id}/${action}/`, data),
};

// Weather Services
export const weatherService = {
  getCurrent: (lat = 17.6868, lon = 83.2185) => api.get('/weather/current/', { params: { lat, lon } }),
  getForecast: (lat = 17.6868, lon = 83.2185) => api.get('/weather/forecast/', { params: { lat, lon } }),
};

// GIS & Location Services
export const gisService = {
  getWardsGeoJSON: () => api.get('/gis/wards/'),
  getWardRiskList: () => api.get('/gis/ward-risk/'),
  getHotspots: () => api.get('/gis/hotspots/'),
  updateLocation: (latitude, longitude, accuracy) => api.post('/location/update/', { latitude, longitude, accuracy }),
  checkRisk: (latitude, longitude) => api.post('/location/check-risk/', { latitude, longitude }),
};

// Machine Learning & Explainability Services
export const mlService = {
  getCurrentPrediction: (lat, lon) => api.get('/predictions/current/', { params: { lat, lon } }),
  getExplainability: () => api.get('/predictions/explain/'),
};

// Simulation Sandbox
export const simulationService = {
  run: (data) => api.post('/simulation/run/', data),
};

// Alerts & Decision Support
export const alertService = {
  getAlerts: () => api.get('/alerts/'),
  markRead: (id) => api.post(`/alerts/${id}/read/`),
  getInterventions: () => api.get('/interventions/'),
  getEmergencyPriorities: () => api.get('/emergency/priorities/'),
  getActionPlan: () => api.get('/action-plan/'),
};

// Web Push Notification Registration
export const notificationService = {
  subscribe: (subscription) => api.post('/notifications/subscribe/', subscription),
};

// Health Check
export const systemService = {
  getHealth: () => api.get('/health/'),
  getAdminStats: () => api.get('/dashboard/admin/'),
  getCitizenDashboard: (lat, lon) => api.get('/dashboard/citizen/', { params: { lat, lon } }),
  getAuthorityDashboard: () => api.get('/dashboard/authority/'),
};

export default api;
