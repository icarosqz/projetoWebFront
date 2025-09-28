import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getCartItems, addItemToCart, removeItemFromCart, updateItemQuantity} from '../api/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth?.() || { isLoading: false, isAuthenticated: true };
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCartItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCartItems();
      setItems(data || []);
    } catch (error) {
      console.error("Erro ao buscar carrinho:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) fetchCartItems();
  }, [fetchCartItems, isAuthLoading, isAuthenticated]);

  function normalizeProductId(productOrId) {
    const id = typeof productOrId === 'object' && productOrId !== null ? productOrId.id : productOrId;
    const n = parseInt(id, 10);
    if (!Number.isFinite(n)) throw new Error("productId inválido ao adicionar ao carrinho.");
    return n;
  }

  async function addItem(productOrId, quantity = 1) {
    try {
      const productId = normalizeProductId(productOrId);
      await addItemToCart(productId, quantity);
      await fetchCartItems();
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
    }
  }

  async function removeItem(productId) {
    try {
      await removeItemFromCart(productId);
      await fetchCartItems();
    } catch (error) {
      console.error("Erro ao remover produto:", error);
    }
  }

  async function updateQuantity(productId, newQuantity) {
    try {
      if (newQuantity <= 0) {
        await removeItem(productId);
      } else {
        await updateItemQuantity(productId, newQuantity);
        await fetchCartItems();
      }
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
    }
  }

  async function clearCart() {
    try {
      await fetchCartItems();
    } catch {
      setItems([]);
    }
  }

  const subtotal = items.reduce((acc, item) => {
    const price = parseFloat(item.produto?.preco || 0);
    const quantity = parseInt(item.quantidade || 0, 10);
    return acc + (price * quantity);
  }, 0);

  const cartCount = items.reduce((acc, item) => acc + parseInt(item.quantidade || 0, 10), 0);

  return (
    <CartContext.Provider value={{ items, cartCount, subtotal, isLoading, addItem, removeItem, updateQuantity, clearCart, refresh: fetchCartItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}