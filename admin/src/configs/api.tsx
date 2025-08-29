import axios from 'axios';
import { toast } from 'react-toastify';
import { logoutGlobal } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Lỗi không xác định';

    if (status === 401 && message === 'Token đã hết hạn') {
      await logoutGlobal();
      toast.error('Phiên hết hạn, vui lòng đăng nhập lại.');
      return Promise.reject(error);
    }

    if (status === 403 && message === 'Token không hợp lệ') {
      await logoutGlobal();
      toast.error('Token không hợp lệ, vui lòng đăng nhập lại.');
      return Promise.reject(error);
    }

    console.error('API Response Error:', status, message);
    return Promise.reject(error);
  }
);

export default api;
