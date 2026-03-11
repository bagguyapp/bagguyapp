import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('bagGuyToken');
      if (token) {
        const res = await authAPI.me();
        setUser(res.data);
      }
    } catch (e) {
      await AsyncStorage.removeItem('bagGuyToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    await AsyncStorage.setItem('bagGuyToken', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (email, password, name) => {
    const res = await authAPI.signup({ email, password, name });
    await AsyncStorage.setItem('bagGuyToken', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('bagGuyToken');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      setUser(res.data);
      return res.data;
    } catch (e) {}
  };

  const tierLabel = {
    free: 'Member',
    silver: 'VIP Silver',
    gold: 'VIP Gold',
    platinum: 'VIP Platinum Elite',
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading, refreshUser, tierLabel }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
