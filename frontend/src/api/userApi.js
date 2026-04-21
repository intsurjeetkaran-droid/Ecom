/**
 * User API  –  Module 2: User Management
 * -------------------------------------------------
 * getProfile()        → GET  /api/users/profile
 * updateProfile(data) → PUT  /api/users/profile
 * becomeSeller()      → PUT  /api/users/become-seller
 * getAllUsers()        → GET  /api/users             (admin)
 * toggleBlock(id)     → PUT  /api/users/:id/block   (admin)
 * -------------------------------------------------
 */

import api from './axios';

// Fetch the currently logged-in user's profile
export const getProfile = () => api.get('/users/profile');

// Update name and/or avatar
export const updateProfile = (data) => api.put('/users/profile', data);

// Upgrade current buyer account to seller
export const becomeSeller = () => api.put('/users/become-seller');

// Admin: fetch all users (supports ?page=&limit=)
export const getAllUsers = (params) => api.get('/users', { params });

// Admin: toggle block/unblock for a user by ID
export const toggleBlock = (id) => api.put(`/users/${id}/block`);
