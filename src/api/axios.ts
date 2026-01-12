import axios from 'axios';

// Backend URL - use Render for deployed builds, /api for local dev
const BACKEND_URL = 'https://prk-smile-backend-2cqu.onrender.com/api';
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

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
