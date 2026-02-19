import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
});


export default axiosInstance;

// https://psycare.aravindhprabu.me/
// http://localhost:8000