import axios from 'axios';

// Get API URL from env, default to local proxy or local server
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';


export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors, e.g. token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // If 401 (Unauthorized/Expired Token), we log out
      if (error.response.status === 401) {
        localStorage.removeItem('careflow_token');
        localStorage.removeItem('careflow_user');
        // If we are not on the login/register pages, redirect to login
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login?expired=true';
        }
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ success: false, message: 'Network connection error' });
  }
);
