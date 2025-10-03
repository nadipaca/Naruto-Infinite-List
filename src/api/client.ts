import axios from "axios";

// Try this working API endpoint
export const api = axios.create({
  baseURL: "https://dattebayo-api.onrender.com",
  timeout: 15000,
  headers: { 
    Accept: "application/json",
    "Content-Type": "application/json"
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // console.log('Making request to:', config.baseURL + config.url, config.params);
    return config;
  },
  (error) => {
    // console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // console.log('Response received:', response.status, response.data);
    return response;
  },
  (error) => {
    // console.error('Response error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);