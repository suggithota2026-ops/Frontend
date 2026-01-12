import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isProduction = import.meta.env.PROD;

const api = axios.create({
    baseURL: (isProduction && apiBaseUrl) ? apiBaseUrl : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('--- API DEBUG ---');
console.log('Mode:', import.meta.env.MODE);
console.log('Is Production:', isProduction);
console.log('Env VITE_API_BASE_URL:', apiBaseUrl);
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
