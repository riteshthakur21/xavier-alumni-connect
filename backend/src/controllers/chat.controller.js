const { z } = require('zod');
const chatService = require('../services/chat.service');

// ─── Validation schemas ───────────────────────────────────────────────────────

const createConversationSchema = z.object({
  targetUserId: z.string().uuid('targetUserId must be a valid UUID'),
});

const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .refine((v) => v > 0 && v <= 50, 'limit must be between 1 and 50'),
  cursor: z.string().datetime({ offset: true }).optional().or(z.literal('')).transform((v) => v || null),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /chat/conversations
 * Returns all conversations for the authenticated user.
 */
const getConversations = async (req, res) => {
  try {
    const conversations = await chatService.getConversations(req.user.id);
    res.json({ success: true, data: conversations });
  } catch (err) {
    console.error('[chat.controller] getConversations:', err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
};

/**
 * GET /chat/messages/:conversationId?limit=20&cursor=<ISO_timestamp>
 * Paginated message history. cursor = ISO datetime of oldest loaded message.
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId || !/^[0-9a-f-]{36}$/.test(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversationId' });
    }

    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { limit, cursor } = parsed.data;
    const result = await chatService.getMessages(conversationId, req.user.id, {
      limit,
      cursor,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[chat.controller] getMessages:', err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
};

/**
 * POST /chat/create-conversation
 * Body: { targetUserId: UUID }
 * Gets existing or creates new 1-1 conversation.
 */
const createConversation = async (req, res) => {
  try {
    const parsed = createConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const conversation = await chatService.getOrCreateConversation(
      req.user.id,
      parsed.data.targetUserId
    );

    res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    console.error('[chat.controller] createConversation:', err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
};

/**
 * DELETE /chat/messages/:messageId
 * Soft-deletes a message (sender only).
 * Emits `messageDeleted` to the conversation room via Socket.io.
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId || !/^[0-9a-f-]{36}$/.test(messageId)) {
      return res.status(400).json({ error: 'Invalid messageId' });
    }

    const message = await chatService.deleteMessage(messageId, req.user.id);

    // Notify everyone in the conversation room in real-time
    const io = req.app.get('io');
    if (io) {
      io.to(`conv:${message.conversationId}`).emit('messageDeleted', {
        messageId: message.id,
        conversationId: message.conversationId,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[chat.controller] deleteMessage:', err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
};

module.exports = { getConversations, getMessages, createConversation, deleteMessage };
