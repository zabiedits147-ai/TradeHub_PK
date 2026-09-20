import api from './api';

export const getMarketInsights = async () => {
  const response = await api.get('/insights');
  return response.data;
};

export const getTradingVolume = async () => {
  const response = await api.get('/insights/volume');
  return response.data;
};