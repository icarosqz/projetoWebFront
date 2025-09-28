import apiClient from './api';

export const getMyAddresses = async () => {
  try {
    const response = await apiClient.get('/api/v1/usuarios/me/enderecos');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar endereços:", error.response?.data || error.message);
    throw error;
  }
};

export const addMyAddress = async (addressData) => {
  try {
    const response = await apiClient.post('/api/v1/usuarios/me/enderecos', addressData);
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar endereço:", error.response?.data || error.message);
    throw error;
  }
};