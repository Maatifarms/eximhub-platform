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
    resetPassword: (email) => api.post('/auth/reset-password', { email }),
    googleLogin: (googleToken) => api.post('/auth/google', { googleToken }),
};

export const discoveryApi = {
    search: (industry, country, product_keyword, company_size, limit, company_name) => 
        api.post('/discovery/search', { industry, country, product_keyword, company_size, limit, company_name }),
    getDirectory: (params) => api.get('/discovery/directory', { params }),
    getContactById: (id) => api.get(`/discovery/contacts/${id}`),
    getTrends: () => api.get('/discovery/trends'),
    getAnalytics: () => api.get('/discovery/analytics'),
};

export const marketIntelligenceApi = {
    search: (filters) => api.post('/market-intelligence/search', filters),
    getOverview: () => api.get('/market-intelligence/overview'),
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

export const siteApi = {
    submitContactInquiry: (data) => api.post('/site/contact', data),
};

export default api;
