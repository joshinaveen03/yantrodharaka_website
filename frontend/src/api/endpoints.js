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
};

export const paymentsApi = {
  submit: (data) => api.post('/api/payments', data),
  get: (ref) => api.get(`/api/payments/${ref}`),
  adminList: (page = 1, q = '') => api.get(`/api/payments/admin/all?page=${page}&page_size=20&q=${encodeURIComponent(q)}`),
};

export const adminApi = {
  stats: () => api.get('/api/admin/stats'),
};

