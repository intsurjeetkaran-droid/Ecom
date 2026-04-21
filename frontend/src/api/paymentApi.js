/**
 * Payment API  –  Module 6: Payment (Manual UPI)
 * -------------------------------------------------
 * recordPayment(orderId)           → POST /api/payments/record
 * getMyPayments(params)            → GET  /api/payments/my
 * getPaymentByOrder(orderId)       → GET  /api/payments/order/:orderId
 * updatePaymentDetails(data)     → PUT  /api/payments/seller/details  (JSON — base64 QR image)
 * getSellerPaymentDetails(sellerId)→ GET  /api/payments/seller/:sellerId
 * getAllPayments(params)           → GET  /api/payments  (admin)
 * -------------------------------------------------
 */

import api from './axios';

// Seller manually records a confirmed payment
export const recordPayment = (orderId) =>
  api.post('/payments/record', { orderId });

// Buyer or seller — own payment history
export const getMyPayments = (params) =>
  api.get('/payments/my', { params });

// Payment record for a specific order
export const getPaymentByOrder = (orderId) =>
  api.get(`/payments/order/${orderId}`);

// Seller saves UPI/bank details + optional base64 QR image
export const updatePaymentDetails = (data) =>
  api.put('/payments/seller/details', data);

// Get a seller's payment details (shown to buyer before paying)
export const getSellerPaymentDetails = (sellerId) =>
  api.get(`/payments/seller/${sellerId}`);

// Admin — all payments with optional status filter + pagination
export const getAllPayments = (params) =>
  api.get('/payments', { params });
