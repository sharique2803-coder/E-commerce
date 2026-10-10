import api from './axios';

export const fetchProducts = (params) => api.get('/products', { params });
export const fetchFeaturedProducts = () => api.get('/products/featured');
export const fetchCategories = () => api.get('/products/categories');
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const createReview = (id, data) => api.post(`/products/${id}/reviews`, data);
