/**
 * Order API  –  Module 5: Order Management
 * -------------------------------------------------
 * createOrder(productId)          → POST /api/orders
 * getBuyerOrders()                → GET  /api/orders/buyer
 * getSellerOrders(params)         → GET  /api/orders/seller
 * getOrderById(id)                → GET  /api/orders/:id
 * submitPaymentProof(id, data)   → POST /api/orders/:id/submit-payment  (JSON — base64 screenshot)
 * verifyPayment(id, action, note) → PUT  /api/orders/:id/verify
 * completeOrder(id)               → PUT  /api/orders/:id/complete
 * cancelOrder(id)                 → PUT  /api/orders/:id/cancel
 * getAllOrders(params)             → GET  /api/orders  (admin)
 * -------------------------------------------------
 */

import api from './axios';

// Buyer places an order for a product
export const createOrder = (productId) =>
  api.post('/orders', { productId });

// Buyer's own orders
export const getBuyerOrders = () =>
  api.get('/orders/buyer');

// Seller's orders — optional ?status= filter
export const getSellerOrders = (params) =>
  api.get('/orders/seller', { params });

// Single order detail (buyer, seller, or admin)
export const getOrderById = (id) =>
  api.get(`/orders/${id}`);

// Buyer submits payment proof (transactionId + optional base64 screenshot)
export const submitPaymentProof = (id, data) =>
  api.post(`/orders/${id}/submit-payment`, data);

// Seller confirms or rejects payment
export const verifyPayment = (id, action, note = '') =>
  api.put(`/orders/${id}/verify`, { action, note });

// Seller marks order as completed/delivered
export const completeOrder = (id) =>
  api.put(`/orders/${id}/complete`);

// Buyer cancels order (only if still 'initiated')
export const cancelOrder = (id) =>
  api.put(`/orders/${id}/cancel`);

// Admin — all orders with optional status filter + pagination
export const getAllOrders = (params) =>
  api.get('/orders', { params });
