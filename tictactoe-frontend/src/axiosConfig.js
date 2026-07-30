import axios from 'axios';
import { Cookies } from 'react-cookie';
import { API_URL } from './config';

const cookies = new Cookies();

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = cookies.get('user-token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
