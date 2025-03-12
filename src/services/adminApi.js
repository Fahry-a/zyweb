import api from './api';

export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getAdminStatistics = async () => {
  const response = await api.get('/admin/statistics');
  return response.data;
};