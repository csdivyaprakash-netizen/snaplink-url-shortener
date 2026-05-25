import api from './axios';

export const createUrl = (data) => api.post('/urls', data);
export const getUserUrls = () => api.get('/urls');
export const deleteUrl = (id) => api.delete(`/urls/${id}`);
export const updateUrl = (id, data) => api.patch(`/urls/${id}`, data);
export const getUrlAnalytics = (id) => api.get(`/urls/${id}/analytics`);
export const getPublicStats = (shortCode) => api.get(`/urls/${shortCode}/public-stats`);
