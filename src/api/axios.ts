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
        return Promise.reject(error);
    }
);

export default api;
