const express = require('express');
const router = express.Router();
const { getConversation, getConversationsList, sendMessage, deleteMessage } = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getConversationsList);
router.get('/:otherUserId', protect, getConversation);
router.post('/', protect, sendMessage);
router.delete('/message/:messageId', protect, deleteMessage);

module.exports = router;