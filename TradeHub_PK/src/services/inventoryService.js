import api from './api';

export const getInventory = async () => {
  const response = await api.get('/inventory');
  return response.data;
};

export const scanBarcode = async (barcode) => {
  try {
    const response = await api.get(`/inventory/scan/${barcode}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { notFound: true };
    }
    throw error;
  }
};

export const addInventoryItem = async (barcode, productName, quantity, unit) => {
  const response = await api.post('/inventory', { barcode, productName, quantity, unit });
  return response.data;
};

export const adjustQuantity = async (itemId, change) => {
  const response = await api.put(`/inventory/${itemId}/adjust`, { change });
  return response.data;
};