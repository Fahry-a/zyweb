import axios from 'axios';
import Swal from 'sweetalert2'; // Tambahkan import ini

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor tetap sama
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

// Response interceptor dengan perbaikan
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post('/auth/refresh-token');
        const { token } = response.data;

        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Handle suspended account - Perbaikan di sini
    if (error.response?.status === 403 && error.response?.data?.message?.includes('suspended')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      await Swal.fire({
        icon: 'error',
        title: 'Account Suspended',
        text: 'Your account has been suspended. Please contact administrator for more information.',
        confirmButtonText: 'OK'
      });
      
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Auth functions dengan perbaikan
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    // Tangani suspended account di sini juga
    if (error.response?.status === 403 && error.response?.data?.message?.includes('suspended')) {
      await Swal.fire({
        icon: 'error',
        title: 'Account Suspended',
        text: 'Your account has been suspended. Please contact administrator for more information.',
        confirmButtonText: 'OK'
      });
    }
    throw error;
  }
};

// ... rest of the code remains the same ...

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (passwords) => {
  try {
    const response = await api.post('/auth/change-password', passwords);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAccount = async (password) => {
  try {
    const response = await api.delete('/auth/delete-account', { data: { password } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// User functions
export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin functions
export const getUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const suspendUser = async (userId) => {
  try {
    const response = await api.put(`/admin/users/${userId}/suspend`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unsuspendUser = async (userId) => {
  try {
    const response = await api.put(`/admin/users/${userId}/unsuspend`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLogs = async () => {
  try {
    const response = await api.get('/admin/logs');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;