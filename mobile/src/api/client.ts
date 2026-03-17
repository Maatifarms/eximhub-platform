import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Hostinger API Base URL
// 10.0.2.2 is the alias for localhost on Android emulators
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

// 2. JWT Interceptor
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('exim_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. AUTH APIs
export const authApi = {
  login: (data: any) => apiClient.post('/auth/login', data),
  signup: (data: any) => apiClient.post('/auth/signup', data),
};

// 4. DISCOVERY APIs (MySQL Unified)
export const searchGlobal = async (industry: string, country: string, productKeyword: string, companySize: string, limit: number) => {
  return apiClient.post('/discovery/search', { industry, country, product_keyword: productKeyword, company_size: companySize, limit });
};

export const getTrends = async () => {
  return apiClient.get('/discovery/trends');
};

// 5. CREDIT SYSTEM (Phase 12)
export const revealContacts = async (contactIds: number[]) => {
  return apiClient.post('/credits/reveal', { contactIds });
};

export const getBalance = async () => {
  return apiClient.get('/credits/balance');
};

// 6. MARKETPLACE (Phase 7 & 8)
export const marketplaceApi = {
  getBooks: () => apiClient.get('/marketplace/books'),
  buyBook: (bookId: number, paymentId: string) => apiClient.post('/marketplace/buy-book', { bookId, paymentId }),
  getLibrary: () => apiClient.get('/marketplace/library'),
  upgrade: (planId: string, paymentId: string) => apiClient.post('/marketplace/upgrade', { planId, paymentId }),
};
