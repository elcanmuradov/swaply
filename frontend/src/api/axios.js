import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(

  (response) => response,
  (error) => {
    const requestUrl = error?.config?.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/login')
      || requestUrl.includes('/auth/register')
      || requestUrl.includes('/auth/send-code')
      || requestUrl.includes('/auth/verify');

    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');

      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default api;
