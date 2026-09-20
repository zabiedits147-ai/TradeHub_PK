const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Client joins their own room to receive targeted events
    socket.on('joinRoom', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room user_${userId}`);
    });

    // Real-time chat message
    socket.on('sendMessage', async ({ senderId, receiverId, text }) => {
      try {
        const message = await Message.create({ sender: senderId, receiver: receiverId, text });
        io.to(`user_${receiverId}`).emit('receiveMessage', message);
        io.to(`user_${senderId}`).emit('receiveMessage', message); // echo back to sender's other devices
      } catch (error) {
        console.error('Socket sendMessage error:', error.message);
      }
    });

    // Typing indicator
    socket.on('typing', ({ senderId, receiverId }) => {
      io.to(`user_${receiverId}`).emit('userTyping', { senderId });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};