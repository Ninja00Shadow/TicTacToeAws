import axios from 'axios';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();
const token = cookies.get('user-token');

const axiosInstance = axios.create({
  baseURL: !!process.env.REACT_APP_API_IP ? 'http://${process.env.REACT_APP_API_IP}:8000' : 'http://44.205.169.11:8000',
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export default axiosInstance;