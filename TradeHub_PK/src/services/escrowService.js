import api from './api';

export const getEscrowByBid = async (bidId) => {
  const response = await api.get(`/escrow/bid/${bidId}`);
  return response.data;
};

export const releaseEscrow = async (escrowId) => {
  const response = await api.put(`/escrow/${escrowId}/release`);
  return response.data;
};