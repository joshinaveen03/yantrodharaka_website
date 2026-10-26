import api from './client';

export const authApi = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  me: () => api.get('/api/auth/me'),
};

export const notificationsApi = {
  list: (page = 1, pageSize = 10) =>
    api.get(`/api/notifications?page=${page}&page_size=${pageSize}`),
  get: (id) => api.get(`/api/notifications/${id}`),
  adminList: (page = 1, pageSize = 20) =>
    api.get(`/api/notifications/admin/all?page=${page}&page_size=${pageSize}`),
  create: (formData) => api.post('/api/notifications', formData),
  update: (id, formData) => api.put(`/api/notifications/${id}`, formData),
  delete: (id) => api.delete(`/api/notifications/${id}`),
};

export const coursesApi = {
  list: (page = 1) => api.get(`/api/courses?page=${page}&page_size=12`),
  get: (id) => api.get(`/api/courses/${id}`),
  adminList: (page = 1) => api.get(`/api/courses/admin/all?page=${page}&page_size=20`),
  create: (data) => api.post('/api/courses', data),
  update: (id, data) => api.put(`/api/courses/${id}`, data),
  delete: (id) => api.delete(`/api/courses/${id}`),
};

export const materialsApi = {
  list: (page = 1, subject = '', course = '') =>
    api.get(`/api/materials?page=${page}&page_size=12&subject=${subject}&course=${course}`),
  adminList: (page = 1) => api.get(`/api/materials/admin/all?page=${page}&page_size=20`),
  upload: (formData) => api.post('/api/materials', formData),
  update: (id, formData) => api.put(`/api/materials/${id}`, formData),
  delete: (id) => api.delete(`/api/materials/${id}`),
};

export const eventsApi = {
  list: (page = 1) => api.get(`/api/events?page=${page}&page_size=10`),
  get: (id) => api.get(`/api/events/${id}`),
  adminList: (page = 1) => api.get(`/api/events/admin/all?page=${page}&page_size=20`),
  create: (formData) => api.post('/api/events', formData),
  update: (id, formData) => api.put(`/api/events/${id}`, formData),
  delete: (id) => api.delete(`/api/events/${id}`),
};

export const contactApi = {
  submit: (data) => api.post('/api/contact', data),
  adminList: (page = 1) => api.get(`/api/contact/admin/all?page=${page}&page_size=20`),
  markRead: (id) => api.put(`/api/contact/admin/${id}/mark-read`),
  getSettings: () => api.get('/api/contact/settings'),
  updateSettings: (data) => api.put('/api/contact/settings', data),
};

export const paymentsApi = {
  submit: (data) => api.post('/api/payments', data),
  get: (ref) => api.get(`/api/payments/${ref}`),
  adminList: (page = 1, q = '') => api.get(`/api/payments/admin/all?page=${page}&page_size=20&q=${encodeURIComponent(q)}`),
  delete: (id) => api.delete(`/api/payments/${id}`),
  getSettings: () => api.get('/api/payments/settings'),
  updateSettings: (data) => api.put('/api/payments/settings', data),
  getPackages: () => api.get('/api/payments/packages'),
  adminListPackages: () => api.get('/api/payments/admin/packages'),
  createPackage: (data) => api.post('/api/payments/admin/packages', data),
  updatePackage: (id, data) => api.put(`/api/payments/admin/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/api/payments/admin/packages/${id}`),
};

export const galleryApi = {
  list: (category = '') => api.get(`/api/gallery${category ? `?category=${category}` : ''}`),
  adminList: () => api.get('/api/gallery/admin/all'),
  create: (formData) => api.post('/api/gallery', formData),
  update: (id, formData) => api.put(`/api/gallery/${id}`, formData),
  delete: (id) => api.delete(`/api/gallery/${id}`),
};

export const adminApi = {
  stats: () => api.get('/api/admin/stats'),
};


