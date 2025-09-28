// src/api/orderService.js
import apiClient from './api';

/**
 * Calcula o frete para o carrinho atual com base em um endereço.
 */
export const calculateShipping = async (addressId) => {
  try {
    // Alterando para POST como estava no código original
    const response = await apiClient.post(`/api/v1/pedidos/frete/calcular?endereco_entrega_id=${addressId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao calcular o frete:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Cria um novo pedido a partir do carrinho do usuário.
 */
export const createOrderFromCart = async (addressId, shippingValue) => {
  try {
    const response = await apiClient.post('/api/v1/pedidos', {
      endereco_entrega_id: addressId,
      valor_frete: shippingValue,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar o pedido:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Busca os detalhes de um pedido específico pelo seu ID.
 */
export const getOrderDetails = async (orderId) => {
  try {
    const response = await apiClient.get(`/api/v1/pedidos/${orderId}`);
    return response.data;
  } catch (error)
 {
    console.error("Erro ao buscar detalhes do pedido:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gera a cobrança PIX para um pedido.
 */
export const payOrderWithPix = async (orderId) => {
  try {
    const response = await apiClient.post(`/api/v1/pedidos/${orderId}/pagar-pix`);
    return response.data;
  } catch (error) {
    console.error("Erro ao gerar cobrança PIX:", error.response?.data || error.message);
    throw error;
  }
};