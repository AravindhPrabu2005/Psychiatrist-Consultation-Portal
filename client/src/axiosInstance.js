import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://psycare.onrender.com',
});

export default axiosInstance;

// https://psycare.onrender.com
// http://localhost:8000