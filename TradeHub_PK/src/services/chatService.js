import api from './api';

export const getConversationsList = async () => {
  const response = await api.get('/chat');
  return response.data;
};

export const getConversation = async (otherUserId) => {
  const response = await api.get(`/chat/${otherUserId}`);
  return response.data;
};

export const deleteMessage = async (messageId, mode) => {
  const response = await api.delete(`/chat/message/${messageId}`, { data: { mode } });
  return response.data;
};