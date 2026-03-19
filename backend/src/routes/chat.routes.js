const express = require('express');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('../middleware/auth');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

// Rate-limit specifically for chat REST endpoints
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 requests / minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' },
});

router.use(chatLimiter);

// All chat routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all conversations for the logged-in user
 * @access  Private
 */
router.get('/conversations', chatController.getConversations);

/**
 * @route   GET /api/chat/messages/:conversationId
 * @query   limit  (default 20, max 50)
 * @query   cursor (ISO datetime — fetch messages older than this)
 * @desc    Paginated message history for a conversation
 * @access  Private (members only)
 */
router.get('/messages/:conversationId', chatController.getMessages);

/**
 * @route   POST /api/chat/create-conversation
 * @body    { targetUserId: UUID }
 * @desc    Get or create a 1-1 conversation with another user
 * @access  Private
 */
router.post('/create-conversation', chatController.createConversation);

/**
 * @route   DELETE /api/chat/messages/:messageId
 * @desc    Soft-delete a message (sender only)
 * @access  Private
 */
router.delete('/messages/:messageId', chatController.deleteMessage);

module.exports = router;
