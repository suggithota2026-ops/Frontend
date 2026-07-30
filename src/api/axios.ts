import axios from 'axios';

// Backend URL: from env (Vercel/Render) or fallback for local/production
const BACKEND_URL =
  (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'https://backend-ho7i.onrender.com') + '/api';
const isDev = import.meta.env.DEV;

const PUBLIC_SITE_PATHS = new Set([
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-and-conditions',
]);

function isPublicWebsitePath(pathname: string): boolean {
  if (PUBLIC_SITE_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/admin') || pathname === '/login') return false;
  const first = pathname.split('/').filter(Boolean)[0];
  const legacyAdmin = new Set([
    'products',
    'categories',
    'orders',
    'hotels',
    'staff',
    'drivers',
    'billing',
    'enquiry',
    'offers',
    'brands',
    'notifications',
    'settings',
    'profile',
    'invoice',
  ]);
  if (first && legacyAdmin.has(first)) return false;
  return true;
}

function isAdminApiUrl(url?: string): boolean {
  if (!url) return false;
  return /\/admin(\/|$)/.test(url);
}

const api = axios.create({
    baseURL: isDev ? '/api' : BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — admin auth tokens only off the public site
api.interceptors.request.use(
    (config) => {
        const onPublicSite =
          typeof window !== 'undefined' && isPublicWebsitePath(window.location.pathname);

        if (onPublicSite && isAdminApiUrl(config.url)) {
            return Promise.reject(
              new Error('Admin API calls are blocked on the public website')
            );
        }

        if (onPublicSite) {
            if (config.headers) {
                delete config.headers.Authorization;
                delete (config.headers as { authorization?: string }).authorization;
            }
            return config;
        }

        const h = config.headers;
        const existing = h?.Authorization ?? (h as { authorization?: string })?.authorization;
        if (existing) {
            return config;
        }
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.message === 'Admin API calls are blocked on the public website') {
            return Promise.reject(error);
        }

        console.error('API Error:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            const onPublicSite =
              typeof window !== 'undefined' && isPublicWebsitePath(window.location.pathname);
            if (!onPublicSite) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
