import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

function unwrap(response) {
  return response.data;
}

function normalizeError(error) {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    'Something went wrong';

  return {
    message,
    status: error.response?.status,
    details: error.response?.data?.details,
  };
}

async function request(promise) {
  try {
    return unwrap(await promise);
  } catch (error) {
    throw normalizeError(error);
  }
}

export const productApi = {
  create: (payload) => request(apiClient.post('/products', payload)),
  list: ({ page = 1, limit = 10, search = '' } = {}) =>
    request(apiClient.get('/products', { params: { page, limit, search: search || undefined } })),
  get: (id) => request(apiClient.get(`/products/${id}`)),
  update: (id, payload) => request(apiClient.put(`/products/${id}`, payload)),
  remove: (id) => request(apiClient.delete(`/products/${id}`)),
};

export const customerApi = {
  create: (payload) => request(apiClient.post('/customers', payload)),
  list: ({ page = 1, limit = 10 } = {}) =>
    request(apiClient.get('/customers', { params: { page, limit } })),
  get: (id) => request(apiClient.get(`/customers/${id}`)),
  remove: (id) => request(apiClient.delete(`/customers/${id}`)),
};

export const orderApi = {
  create: (payload) => request(apiClient.post('/orders', payload)),
  list: ({ page = 1, limit = 10 } = {}) =>
    request(apiClient.get('/orders', { params: { page, limit } })),
  get: (id) => request(apiClient.get(`/orders/${id}`)),
  remove: (id) => request(apiClient.delete(`/orders/${id}`)),
};
