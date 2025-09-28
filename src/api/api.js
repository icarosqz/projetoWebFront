// src/api/api.js
import axios from 'axios';

const apiClient = axios.create({
  // ATENÇÃO: Mudamos a forma de acessar a variável de ambiente para o padrão do Vite
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Interceptor para adicionar o token de autenticação em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    // Em um app React puro (client-side), não precisamos mais verificar se 'window' existe.
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;