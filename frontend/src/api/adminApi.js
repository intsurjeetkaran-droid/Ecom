/**
 * Admin API  –  Module 7: Admin Panel
 * -------------------------------------------------
 * getAnalytics()  → GET /api/admin/analytics
 * -------------------------------------------------
 */

import api from './axios';

// Full platform analytics — users, products, orders, payments, recent activity
export const getAnalytics = () => api.get('/admin/analytics');
