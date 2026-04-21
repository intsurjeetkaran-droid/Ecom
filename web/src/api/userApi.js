import api from './axios';
export const getProfile    = ()     => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const becomeSeller  = ()     => api.put('/users/become-seller');
export const getAllUsers    = (p)    => api.get('/users', { params: p });
export const toggleBlock   = (id)   => api.put(`/users/${id}/block`);
