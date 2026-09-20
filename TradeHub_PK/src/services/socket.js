import { io } from 'socket.io-client';

// Socket.IO ke liye usually root URL use hota hai, /api ke bagair
const SOCKET_URL = 'http://192.168.1.74:5000';
let socket = null;

export const initSocket = (userId) => {
  if (socket) return socket;
  socket = io(SOCKET_URL, { transports: ['websocket'] });
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    socket.emit('joinRoom', userId);
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};