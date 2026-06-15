import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-fetch cart and wishlist when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart(null);
      setWishlist(null);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/cart');
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/api/wishlist');
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return { success: false, error: 'Please login to add items to cart.' };
    try {
      const { data } = await api.post('/api/cart', { productId, quantity });
      setCart(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const updateCartItem = async (itemId, quantity, saveForLater) => {
    try {
      const { data } = await api.put(`/api/cart/${itemId}`, { quantity, saveForLater });
      setCart(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/api/cart/${itemId}`);
      setCart(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await api.delete('/api/cart');
      setCart(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) return { success: false, error: 'Please login to use wishlist.' };
    try {
      const { data } = await api.post('/api/wishlist/toggle', { productId });
      setWishlist(data);
      
      const isInWishlist = data.products.some(p => p._id.toString() === productId);
      return { success: true, isInWishlist };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  // Derived states
  const activeCartItems = cart?.items?.filter(item => !item.saveForLater) || [];
  const savedForLaterItems = cart?.items?.filter(item => item.saveForLater) || [];

  const cartItemsCount = activeCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist?.products?.length || 0;

  // Pricing calculations
  const itemsPrice = activeCartItems.reduce((acc, item) => {
    const price = item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  // Standard E-Commerce rules: Free shipping over $100, otherwise $10. Tax is 8.25%
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 10;
  const taxPrice = Math.round(itemsPrice * 0.0825 * 100) / 100;
  const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        activeCartItems,
        savedForLaterItems,
        cartItemsCount,
        wishlistCount,
        prices: {
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice
        },
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        toggleWishlist,
        fetchCart,
        fetchWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
