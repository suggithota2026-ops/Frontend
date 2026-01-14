import axios from 'axios';

// Backend URL - use Render for deployed builds, /api for local dev
const BACKEND_URL = 'https://prk-smile-backend.onrender.com/api';
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Don't redirect here, let components handle it
            // window.location.href = '/login';
        }
        
        // Handle 403 Forbidden - insufficient permissions
        if (error.response?.status === 403) {
            console.log('Insufficient permissions - NOT clearing token');
            // Do NOT clear tokens for permission errors, user is still authenticated
            // Only lack required permissions for specific action
            
            // Don't redirect here, let components handle it
            // window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api;
