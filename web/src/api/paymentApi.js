import api from './axios';
export const getMyPayments           = (p)    => api.get('/payments/my', { params: p });
export const getPaymentByOrder       = (id)   => api.get(`/payments/order/${id}`);
export const updatePaymentDetails    = (data) => api.put('/payments/seller/details', data);
export const getSellerPaymentDetails = (id)   => api.get(`/payments/seller/${id}`);
export const getAllPayments           = (p)    => api.get('/payments', { params: p });
