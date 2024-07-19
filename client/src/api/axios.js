import axios from "axios";
//API
const API_URL_BASE = import.meta.env.VITE_API_URL_BASE;

const axiosInstance = axios.create({
  baseURL: `${API_URL_BASE}`,
  withCredentials: true
})

export default axiosInstance;