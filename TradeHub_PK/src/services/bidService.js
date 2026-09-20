import api from './api';

export const createBid = async (productId, offerAmount) => {
  const response = await api.post('/bids', { productId, offerAmount });
  return response.data;
};

export const getBidsForProduct = async (productId) => {
  const response = await api.get(`/bids/product/${productId}`);
  return response.data;
};

export const respondToBid = async (bidId, action, counterAmount) => {
  const response = await api.put(`/bids/${bidId}/respond`, { action, counterAmount });
  return response.data;
};