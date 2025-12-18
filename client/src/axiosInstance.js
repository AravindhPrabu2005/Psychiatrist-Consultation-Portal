import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
});


export default axiosInstance;

// https://0azyu9zvog.execute-api.ap-south-1.amazonaws.com/dev
// http://localhost:8000