import api from './api';

export const getMyLedger = async () => {
  const response = await api.get('/ledger');
  return response.data;
};

export const createLedgerEntry = async (retailerId, amountOwed, dueDate) => {
  const response = await api.post('/ledger', { retailerId, amountOwed, dueDate });
  return response.data;
};

export const sendReminder = async (ledgerId) => {
  const response = await api.put(`/ledger/${ledgerId}/remind`);
  return response.data;
};