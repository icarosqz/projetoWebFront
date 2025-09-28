
import apiClient from './api';

export const loginUser = async (email, senha) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', senha);
  const response = await apiClient.post('/api/v1/auth/token',
  params, {headers: { 'Content-Type': 'application/x-www-form-urlencoded' },});
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await apiClient.post('/api/v1/auth/register', userData);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await apiClient.get(`/api/v1/auth/verify-email?token=${token}`);
  return response.data;
};