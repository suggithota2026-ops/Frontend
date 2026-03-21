import axios from 'axios';

// Backend URL: from env (Vercel/Render) or fallback for local/production
const BACKEND_URL =
  (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'https://backend-ho7i.onrender.com') + '/api';
const isDev = import.meta.env.DEV;

const api = axios.create({
    baseURL: isDev ? '/api' : BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('--- API DEBUG ---');
console.log('Hostname:', window.location.hostname);
console.log('Is Dev:', isDev);
console.log('Active BaseURL:', api.defaults.baseURL);
console.log('-----------------');

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
            console.log('Unauthorized access - clearing token');
            console.log('Error details:', error.response?.data?.message || 'No error message');
            console.log('Request URL:', error.request?.responseURL);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Don't redirect here, let components handle it
            // window.location.href = '/login';
        }
        
        // Handle 403 Forbidden - insufficient permissions
        if (error.response?.status === 403) {
            console.log('Insufficient permissions - NOT clearing token');
            console.log('Error details:', error.response?.data?.message || 'No error message');
            console.log('Request URL:', error.request?.responseURL);
            // Do NOT clear tokens for permission errors, user is still authenticated
            // Only lack required permissions for specific action
            
            // Don't redirect here, let components handle it
            // window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api;
