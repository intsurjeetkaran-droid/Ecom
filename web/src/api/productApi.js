import api from './axios';
export const getProducts         = (p)       => api.get('/products', { params: p });
export const getProductById      = (id)      => api.get(`/products/${id}`);
export const getMyProducts       = ()        => api.get('/products/my');
export const getAllProducts       = (p)       => api.get('/products/all', { params: p });
export const createProduct       = (data)    => api.post('/products', data);
export const updateProduct       = (id, d)   => api.put(`/products/${id}`, d);
export const deleteProduct       = (id)      => api.delete(`/products/${id}`);
export const updateProductStatus = (id, s)   => api.put(`/products/${id}/status`, { status: s });
