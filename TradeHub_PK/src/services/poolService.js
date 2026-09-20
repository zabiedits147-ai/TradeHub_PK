import api from './api';

export const createPool = async (productId, targetQuantity, pricePerUnit, deadline) => {
  const response = await api.post('/pools', { productId, targetQuantity, pricePerUnit, deadline });
  return response.data;
};

export const getPools = async () => {
  const response = await api.get('/pools');
  return response.data;
};

export const getPoolById = async (id) => {
  const response = await api.get(`/pools/${id}`);
  return response.data;
};

export const joinPool = async (poolId, quantity) => {
  const response = await api.post(`/pools/${poolId}/join`, { quantity });
  return response.data;
};