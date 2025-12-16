import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://0azyu9zvog.execute-api.ap-south-1.amazonaws.com/dev',
});


export default axiosInstance;

// https://0azyu9zvog.execute-api.ap-south-1.amazonaws.com/dev
// http://localhost:8000