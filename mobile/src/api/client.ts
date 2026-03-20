import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Production API Base URL
const BASE_URL = 'https://api.eximhub.pro/api';

export let currentUserTier = 'Free';

export function setTier(tier?: string | null) {
  const normalized = String(tier || '').trim().toLowerCase();
  currentUserTier = !normalized || normalized === 'trial' || normalized === 'free' ? 'Free' : String(tier);
}

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

export const getSampleInquiries = async () => {
  return Promise.resolve({
    data: [
      {
        id: 1,
        product: 'Ceramic Tiles',
        quantity: '2 containers',
        destination_country: 'Germany',
        buyer_type: 'Importer',
        inquiry_date: new Date().toISOString(),
      },
      {
        id: 2,
        product: 'Spice Mixes',
        quantity: '5 MT',
        destination_country: 'UAE',
        buyer_type: 'Distributor',
        inquiry_date: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  });
};
