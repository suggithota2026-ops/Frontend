import axios from 'axios';

// Hardcoded backend URL for production (Vercel env vars not working)
const PRODUCTION_API_URL = 'https://prk-smile-backend.onrender.com/api';

const isProduction = import.meta.env.PROD;

const api = axios.create({
    baseURL: isProduction ? PRODUCTION_API_URL : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('--- API DEBUG ---');
console.log('Mode:', import.meta.env.MODE);
console.log('Is Production:', isProduction);
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
