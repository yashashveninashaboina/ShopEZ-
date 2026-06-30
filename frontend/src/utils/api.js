import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

// Interceptor to automatically attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('shopez_userInfo')
      ? JSON.parse(localStorage.getItem('shopez_userInfo'))
      : null;
      
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
