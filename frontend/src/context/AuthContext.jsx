import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = () => {
      const userInfo = localStorage.getItem('shopez_userInfo');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/users/login', { email, password });
      setUser(data);
      localStorage.setItem('shopez_userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const { data } = await api.post('/api/users', { name, email, password, phone });
      setUser(data);
      localStorage.setItem('shopez_userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shopez_userInfo');
    // Clear cart context token etc if needed by refreshing
    window.location.href = '/login';
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/api/users/profile', profileData);
      setUser(data);
      localStorage.setItem('shopez_userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, error: message };
    }
  };

  // Address operations
  const addAddress = async (addressData) => {
    try {
      const { data } = await api.post('/api/users/addresses', addressData);
      const updatedUser = { ...user, addresses: data };
      setUser(updatedUser);
      localStorage.setItem('shopez_userInfo', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, error: message };
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      const { data } = await api.put(`/api/users/addresses/${addressId}`, addressData);
      const updatedUser = { ...user, addresses: data };
      setUser(updatedUser);
      localStorage.setItem('shopez_userInfo', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, error: message };
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(`/api/users/addresses/${addressId}`);
      const updatedUser = { ...user, addresses: data };
      setUser(updatedUser);
      localStorage.setItem('shopez_userInfo', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, error: message };
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const { data } = await api.put(`/api/users/addresses/${addressId}/default`);
      const updatedUser = { ...user, addresses: data };
      setUser(updatedUser);
      localStorage.setItem('shopez_userInfo', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
