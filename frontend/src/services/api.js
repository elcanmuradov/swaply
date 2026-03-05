import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: BASE_URL,
});

// Helper to extract data from ApiResponse wrapper { success: true, data: ... }
const extractData = (response) => {
    if (response.data && response.data.success) {
        return response.data.data;
    }
    return response.data;
};

export const productService = {
    getAll: async () => {
        const response = await api.get('/');
        return extractData(response);
    },
    getByUser: async (userId) => {
        const response = await api.get(`/${userId}/`);
        return extractData(response);
    },
    getById: async (id) => {
        // Since there is no specific getById endpoint in ProductController yet, 
        // we might need to filter from getAll or wait for backend implementation.
        // For now, calling the root and filtering is a temporary workaround if needed,
        // but let's just point to a likely future endpoint or handle it gracefully.
        const response = await api.get('/');
        const products = extractData(response);
        return Array.isArray(products) ? products.find(p => p.id === parseInt(id)) : null;
    },
    create: async (productData, userId = 1) => {
        const response = await api.post(`/${userId}/`, productData);
        return response.data;
    }
};

export default api;
