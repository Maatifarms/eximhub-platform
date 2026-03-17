import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
    baseURL: API_BASE,
});

// Add Interceptor for JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('exim_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    signup: (data) => api.post('/auth/signup', data),
    changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const discoveryApi = {
    search: (industry, country, product_keyword, company_size, limit, company_name) => 
        api.post('/discovery/search', { industry, country, product_keyword, company_size, limit, company_name }),
    getTrends: () => api.get('/discovery/trends'),
    getAnalytics: () => api.get('/discovery/analytics'),
};

export const creditsApi = {
    reveal: (contactIds) => api.post('/credits/reveal', { contactIds }),
    getBalance: () => api.get('/credits/balance'),
    getMyContacts: () => api.get('/credits/my-contacts'),
};

export const marketplaceApi = {
    getBooks: () => api.get('/marketplace/books'),
    buyBook: (bookId, paymentId) => api.post('/marketplace/buy-book', { bookId, paymentId }),
    getLibrary: () => api.get('/marketplace/library'),
    downloadBook: (bookId) => api.get(`/marketplace/books/${bookId}/download`, { responseType: 'blob' }),
    upgrade: (planId, paymentId) => api.post('/marketplace/upgrade', { planId, paymentId }),
};

export const adminApi = {
    uploadContacts: (formData) => api.post('/admin/upload/contacts', formData),
    getCompanies: () => api.get('/admin/companies'),
    getContacts: () => api.get('/admin/contacts'),
};

export default api;
