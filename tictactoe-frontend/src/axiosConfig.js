import axios from 'axios';
import { Cookies } from 'react-cookie';
import { API_URL } from './config';

const cookies = new Cookies();
const token = cookies.get('user-token');

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export default axiosInstance;
