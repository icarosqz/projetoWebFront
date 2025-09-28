// src/api/carrinhoService.js
import apiClient from './api';

export const getCartItems = async () => {
  // ... (todo o resto do seu código original)
  try {
    const response = await apiClient.get('/api/v1/carrinho');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar itens do carrinho:", error.response?.data || error.message);
    throw error;
  }
};

export const addItemToCart = async (productId, quantity = 1) => {
  try {
    const response = await apiClient.post('/api/v1/carrinho/itens', {
      produto_id: productId,  // Deveria ser um número
      quantidade: quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar item ao carrinho:", error.response?.data || error.message);
    throw error;
  }
};

export const removeItemFromCart = async (productId) => {
  try {
    await apiClient.delete(`/api/v1/carrinho/itens/${productId}`);
  } catch (error) {
    console.error("Erro ao remover item do carrinho:", error.response?.data || error.message);
    throw error;
  }
};

export const updateItemQuantity = async (productId, quantity) => {
    try {
        const response = await apiClient.put(`/api/v1/carrinho/itens/${productId}`, {
            quantidade: quantity,
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar item no carrinho:", error.response?.data || error.message);
        throw error;
    }
};