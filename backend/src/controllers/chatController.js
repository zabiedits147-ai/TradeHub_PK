const Message = require('../models/Message');
const mongoose = require('mongoose');

// @route  GET /api/chat/:otherUserId
// @desc   Get full conversation history between logged-in user and another user
exports.getConversation = async (req, res) => {
  try {
    const myId = req.user.id;
    const { otherUserId } = req.params;

   const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
      deletedFor: { $ne: myId },
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/chat
// @desc   Get list of all conversations (last message with each contact)
exports.getConversationsList = async (req, res) => {
  try {
    const myId = new mongoose.Types.ObjectId(req.user.id);

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: myId }, { receiver: myId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', myId] }, '$receiver', '$sender'],
          },
          lastMessage: { $first: '$text' },
          lastMessageTime: { $first: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'contact',
        },
      },
      { $unwind: '$contact' },
      {
        $project: {
          contactId: '$_id',
          shopName: '$contact.shopName',
          mobileNumber: '$contact.mobileNumber',
          lastMessage: 1,
          lastMessageTime: 1,
        },
      },
      { $sort: { lastMessageTime: -1 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/chat
// @desc   Send a message (also used as fallback if socket fails)
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user.id;

    const message = await Message.create({ sender: senderId, receiver: receiverId, text });

    // Emit via Socket.io for real-time delivery
    const io = req.app.get('io');
    io.to(`user_${receiverId}`).emit('receiveMessage', message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// @route  DELETE /api/chat/message/:messageId
// @desc   Delete a message — mode: 'me' (hide for me only) or 'everyone' (sender only, visible to both as deleted)
exports.deleteMessage = async (req, res) => {
  try {
    const myId = req.user.id;
    const { messageId } = req.params;
    const { mode } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (mode === 'everyone') {
      if (message.sender.toString() !== myId) {
        return res.status(403).json({ message: 'You can only delete your own messages for everyone.' });
      }
      message.isDeletedForEveryone = true;
      message.text = 'This message was deleted';
      await message.save();

      const io = req.app.get('io');
      io.to(`user_${message.sender}`).emit('messageDeleted', { messageId, mode: 'everyone' });
      io.to(`user_${message.receiver}`).emit('messageDeleted', { messageId, mode: 'everyone' });
    } else {
      if (!message.deletedFor.some((id) => id.toString() === myId)) {
        message.deletedFor.push(myId);
        await message.save();
      }
    }

    res.status(200).json({ message: 'Message deleted', mode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};