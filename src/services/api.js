import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your Railway/production URL when deployed
export const API_URL = 'https://bagguy-backend-production-b6b7.up.railway.app';

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

// Auto-attach JWT token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('bagGuyToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login:  (data) => api.post('/api/auth/login', data),
  me:     ()     => api.get('/api/auth/me'),
  connectWallet: (walletAddress) => api.post('/api/auth/connect-wallet', { walletAddress }),
};

export const scanAPI = {
  scan: (barcode, storeId) => api.post('/api/scan', { barcode, storeId }),
};

export const rewardsAPI = {
  get:    ()       => api.get('/api/rewards'),
  redeem: (stars)  => api.post('/api/rewards/redeem', { stars }),
  earn:   (action) => api.post('/api/rewards/earn', { action }),
};

export const subscriptionsAPI = {
  tiers:    ()     => api.get('/api/subscriptions/tiers'),
  checkout: (tier) => api.post('/api/subscriptions/checkout', { tier }),
};

export default api;
