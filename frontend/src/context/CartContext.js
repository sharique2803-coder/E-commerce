import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await getCart();
      setCartItems(data.items || []);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = useCallback(async (productId, quantity = 1) => {
    try {
      const { data } = await addToCart(productId, quantity);
      setCartItems(data.items || []);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add to cart');
    }
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    try {
      const { data } = await updateCartItem(productId, quantity);
      setCartItems(data.items || []);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update cart');
    }
  }, []);

  const removeItem = useCallback(async (productId) => {
    try {
      const { data } = await removeFromCart(productId);
      setCartItems(data.items || []);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to remove item');
    }
  }, []);

  const emptyCart = useCallback(async () => {
    try {
      await clearCart();
      setCartItems([]);
    } catch (err) {
      throw new Error('Failed to clear cart');
    }
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, loading, addItem, updateItem, removeItem, emptyCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
