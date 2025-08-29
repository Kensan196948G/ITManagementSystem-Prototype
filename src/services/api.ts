import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Base URL for API - 環境変数から取得、デフォルトはlocalhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth data but don't force redirect - let React Router handle it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      // Let the auth context handle the redirect
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    // Log error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });
  }
);

// Generic API methods
export const apiClient = {
  get: <T = any>(url: string, params?: any): Promise<T> => 
    api.get(url, { params }).then((response) => response.data),
  
  post: <T = any>(url: string, data?: any): Promise<T> => 
    api.post(url, data).then((response) => response.data),
  
  put: <T = any>(url: string, data?: any): Promise<T> => 
    api.put(url, data).then((response) => response.data),
  
  patch: <T = any>(url: string, data?: any): Promise<T> => 
    api.patch(url, data).then((response) => response.data),
  
  delete: <T = any>(url: string): Promise<T> => 
    api.delete(url).then((response) => response.data),
};

export default api;