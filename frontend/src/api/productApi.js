/**
 * Product API  –  Module 3: Product Management
 * -------------------------------------------------
 * getProducts(params)         → GET /api/products          (search, category, page, limit)
 * getProductById(id)          → GET /api/products/:id
 * getMyProducts()             → GET /api/products/my
 * getAllProducts(params)      → GET /api/products/all      (admin, status filter)
 * createProduct(data)           → POST /api/products         (JSON — base64 images in body)
 * updateProduct(id, data)        → PUT /api/products/:id      (JSON — can include base64 images)
 * deleteProduct(id)           → DELETE /api/products/:id
 * updateProductStatus(id, s)  → PUT /api/products/:id/status
 * -------------------------------------------------
 */

import api from './axios';

// Buyer feed — approved products with optional search/category/pagination
export const getProducts = (params) => api.get('/products', { params });

// Single product detail
export const getProductById = (id) => api.get(`/products/${id}`);

// Seller's own products (all statuses)
export const getMyProducts = () => api.get('/products/my');

// Admin — all products with optional status filter
export const getAllProducts = (params) => api.get('/products/all', { params });

// Create product — send base64 images in JSON body
export const createProduct = (data) =>
  api.post('/products', data);

// Edit product — can include updated base64 images
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

// Delete product
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Admin approve / reject
export const updateProductStatus = (id, status) =>
  api.put(`/products/${id}/status`, { status });
