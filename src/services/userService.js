import api from './api';

export const UserService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  // Suspend user
  suspendUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/suspend`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to suspend user');
    }
  },

  // Unsuspend user
  unsuspendUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/unsuspend`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unsuspend user');
    }
  }
};

export default UserService;