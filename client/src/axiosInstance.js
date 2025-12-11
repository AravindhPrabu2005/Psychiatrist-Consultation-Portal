import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://ebwvrxp1jg.execute-api.eu-north-1.amazonaws.com/dev',
});


export default axiosInstance;

// https://ebwvrxp1jg.execute-api.eu-north-1.amazonaws.com/dev
// http://localhost:8000