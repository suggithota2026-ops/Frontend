import axios from 'axios';

// Use import.meta.env for Vite, with a fallback to process.env if needed
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || (typeof process !== 'undefined' ? process.env.VITE_API_BASE_URL : undefined);
const isProduction = import.meta.env.PROD;

// Ensure the URL ends with /api if it's an external URL
let finalBaseUrl = '/api';
if (isProduction && rawBaseUrl) {
    finalBaseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`;
}

const api = axios.create({
    baseURL: finalBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('--- API DEBUG ---');
console.log('Mode:', import.meta.env.MODE);
console.log('Raw Env Value:', rawBaseUrl);
console.log('Resolved BaseURL:', api.defaults.baseURL);
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
