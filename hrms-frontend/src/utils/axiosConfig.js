import axios from 'axios';

// Set base URL
axios.defaults.baseURL = 'http://localhost:5000';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common response patterns
axios.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.config?.url, error.response?.data || error.message);
    }
    
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axios;