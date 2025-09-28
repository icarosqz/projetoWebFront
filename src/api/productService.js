// src/api/productService.js
import apiClient from './api';

/**
 * Fetches the list of all products.
 * Corresponds to: GET /api/v1/produtos
 */
export const getProducts = async () => {
  try {
    const response = await apiClient.get('/api/v1/produtos');
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches a single product by its ID.
 * Corresponds to: GET /api/v1/produtos/{produto_id}
 */
export const getProductById = async (productId) => {
    try {
      const response = await apiClient.get(`/api/v1/produtos/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error.response?.data || error.message);
      throw error;
    }
  };

/**
 * Fetches all categories.
 * Corresponds to: GET /api/v1/categorias
 */
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/api/v1/categorias');
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches all tags.
 * Corresponds to: GET /api/v1/tags
 */
export const getTags = async () => {
  try {
    const response = await apiClient.get('/api/v1/tags');
    return response.data;
  } catch (error) {
    console.error("Error fetching tags:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Creates a new product in the logged-in seller's store.
 * Corresponds to: POST /api/v1/produtos/minha-loja
 */
export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/api/v1/produtos/minha-loja', productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Uploads images for a specific product.
 * Corresponds to: POST /api/v1/produtos/{produto_id}/imagens
 */
export const uploadProductImages = async (productId, files) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  try {
    const response = await apiClient.post(`/api/v1/produtos/${productId}/imagens`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading product images:", error.response?.data || error.message);
    throw error;
  }
};