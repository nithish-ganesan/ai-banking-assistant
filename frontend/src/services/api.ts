import axios from 'axios';

export const AUTH_EXPIRED_EVENT = 'ai-bank-auth-expired';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ai-bank-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';
    if ((status === 401 || status === 403) && !requestUrl.includes('/auth/')) {
      localStorage.removeItem('ai-bank-token');
      localStorage.removeItem('ai-bank-user');
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);
