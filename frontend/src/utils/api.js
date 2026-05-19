import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 15000,
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export async function saveBear(bearData) {
  return api.post('/bears', bearData);
}

export async function getBear(id) {
  return api.get(`/bears/${id}`);
}

export async function getBears() {
  return api.get('/bears');
}

export async function updateBear(id, bearData) {
  return api.put(`/bears/${id}`, bearData);
}

export async function deleteBear(id) {
  return api.delete(`/bears/${id}`);
}

export async function addToCart(bearId, quantity = 1) {
  return api.post(`/bears/${bearId}/cart`, { quantity });
}

export async function getCart() {
  return api.get('/bears/cart/all');
}

export async function uploadAudio(audioBlob) {
  const form = new FormData();
  form.append('audio', audioBlob, 'recording.webm');
  return api.post('/upload/audio', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function uploadImage(imageBlob) {
  const form = new FormData();
  form.append('image', imageBlob, 'bear.png');
  return api.post('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export default api;

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export async function placeOrder(orderData) {
  return api.post('/orders', orderData);
}

export async function getOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  return api.get(`/orders${query ? '?' + query : ''}`);
}

export async function getOrder(id) {
  return api.get(`/orders/${id}`);
}

export async function updateOrderStatus(id, status, adminNote, trackingNumber) {
  return api.patch(`/orders/${id}/status`, { status, adminNote, trackingNumber });
}

export async function deleteOrder(id) {
  return api.delete(`/orders/${id}`);
}

export async function getOrderStats() {
  return api.get('/orders/stats');
}
