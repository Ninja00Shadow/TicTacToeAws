import axios from 'axios';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();
const token = cookies.get('user-token');

const axiosInstance = axios.create({
  baseURL: !!process.env.REACT_APP_BACKEND_URL ? 'http://${process.env.REACT_APP_API_IP}:8000' : 'http://localhost:8000',
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export default axiosInstance;