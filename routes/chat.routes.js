const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middlewares/auth');

// API lấy lịch sử tin nhắn: /api/chats/history/:partnerId
router.get('/history/:partnerId', verifyToken, chatController.getHistory);
router.get('/conversations', verifyToken, chatController.getConversations);
router.delete('/:conversationId', verifyToken, chatController.deleteConversation);
router.post('/group', verifyToken, chatController.createGroup);
router.post('/group/:id/members', verifyToken, chatController.addMembers);
router.get('/group/:id/members', verifyToken, chatController.getMembers);
router.delete('/group/:id/members/:userId', verifyToken, chatController.removeMember);
router.delete('/group/:id', verifyToken, chatController.disbandGroup);
router.get('/:conversationId/messages', verifyToken, chatController.getMessagesByConversation);

module.exports = router;