const chatService = require('../services/chat.service');
const chatRepo    = require('../repositories/chat.repository');

// Lazy-require to avoid any circular dependency issues at module load time.
const getIsConnected = () => require('../services/connection.service').isConnected;

/**
 * Online users registry.
 *
 * Structure:
 *   onlineUsers: Map<userId: string, socketId: string>
 *
 * In a multi-instance (clustered) setup replace with a Redis adapter.
 * socket.io-redis: https://github.com/socketio/socket.io-redis-adapter
 */
const onlineUsers = new Map();

/**
 * Register all Socket.io event handlers.
 *
 * @param {import('socket.io').Server} io
 */
const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    const { user } = socket; // Attached by socketAuth middleware
    console.log(`[socket] connected  user=${user.id}  socket=${socket.id}`);

    // ── Mark user online ────────────────────────────────────────────────────
    onlineUsers.set(user.id, socket.id);
    socket.broadcast.emit('userOnline', { userId: user.id });

    // ── joinConversation ────────────────────────────────────────────────────
    /**
     * Client emits: { conversationId: string }
     * Server joins socket to room `conv:<conversationId>`.
     * Denies if user is not a member of that conversation.
     */
    socket.on('joinConversation', async ({ conversationId } = {}) => {
      try {
        if (!conversationId || typeof conversationId !== 'string') {
          return socket.emit('error', { event: 'joinConversation', message: 'conversationId required' });
        }

        // ── Membership check ────────────────────────────────────────────────
        const isMember = await chatService.verifyMembership(conversationId, user.id);
        if (!isMember) {
          return socket.emit('error', {
            event: 'joinConversation',
            message: 'Access denied: not a member of this conversation',
          });
        }

        // ── Connection check ─────────────────────────────────────────────────
        // Even if the user is a member, they must still be connected to the
        // other participant.  Catches the edge case where a conversation was
        // created and the connection was later removed.
        const participants = await chatRepo.getConversationParticipants(conversationId);
        const otherUserId  = participants.find((id) => id !== user.id);
        if (otherUserId) {
          const connected = await getIsConnected()(user.id, otherUserId);
          if (!connected) {
            return socket.emit('error', {
              event: 'joinConversation',
              code:  'CHAT_NOT_CONNECTED',
              message: 'You must be connected with this user to join the conversation',
            });
          }
        }

        const room = `conv:${conversationId}`;
        socket.join(room);
        console.log(`[socket] user=${user.id} joined room=${room}`);

        socket.emit('joinedConversation', { conversationId });
      } catch (err) {
        console.error('[socket] joinConversation error:', err.message);
        socket.emit('error', { event: 'joinConversation', message: 'Server error' });
      }
    });

    // ── sendMessage ─────────────────────────────────────────────────────────
    /**
     * Client emits: { conversationId: string, content: string }
     * Server:
     *   1. Persists the message
     *   2. Broadcasts `receiveMessage` to all room members (including sender)
     */
    socket.on('sendMessage', async ({ conversationId, content } = {}) => {
      try {
        if (!conversationId || !content) {
          return socket.emit('error', {
            event: 'sendMessage',
            message: 'conversationId and content are required',
          });
        }

        const message = await chatService.sendMessage({
          conversationId,
          senderId: user.id,
          content,
        });

        const room = `conv:${conversationId}`;
        io.to(room).emit('receiveMessage', message);
      } catch (err) {
        console.error('[socket] sendMessage error:', err.message);
        socket.emit('error', {
          event: 'sendMessage',
          message: err.message || 'Could not send message',
        });
      }
    });

    // ── messageSeen ─────────────────────────────────────────────────────────
    /**
     * Client emits: { conversationId: string }
     * Server marks unseen messages as seen and notifies room.
     */
    socket.on('messageSeen', async ({ conversationId } = {}) => {
      try {
        if (!conversationId) return;

        const count = await chatService.markAsSeen(conversationId, user.id);
        if (count > 0) {
          const room = `conv:${conversationId}`;
          io.to(room).emit('messagesSeen', { conversationId, seenBy: user.id });
        }
      } catch (err) {
        console.error('[socket] messageSeen error:', err.message);
        socket.emit('error', { event: 'messageSeen', message: 'Server error' });
      }
    });

    // ── typing ──────────────────────────────────────────────────────────────
    /**
     * Client emits: { conversationId: string }
     * Broadcasts to others in the room (not back to sender).
     */
    socket.on('typing', ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(`conv:${conversationId}`).emit('typing', {
        conversationId,
        userId: user.id,
        userName: user.name,
      });
    });

    // ── stopTyping ──────────────────────────────────────────────────────────
    socket.on('stopTyping', ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(`conv:${conversationId}`).emit('stopTyping', {
        conversationId,
        userId: user.id,
      });
    });

    // ── deleteMessage ────────────────────────────────────────────────────────
    /**
     * Client emits: { messageId: string, conversationId: string }
     * Server soft-deletes the message and broadcasts `messageDeleted` to room.
     */
    socket.on('deleteMessage', async ({ messageId, conversationId } = {}) => {
      try {
        if (!messageId || !conversationId) return;
        await chatService.deleteMessage(messageId, user.id);
        io.to(`conv:${conversationId}`).emit('messageDeleted', { messageId, conversationId });
      } catch (err) {
        console.error('[socket] deleteMessage error:', err.message);
        socket.emit('error', {
          event: 'deleteMessage',
          message: err.message || 'Could not delete message',
        });
      }
    });

    // ── disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[socket] disconnected  user=${user.id}  reason=${reason}`);
      onlineUsers.delete(user.id);
      socket.broadcast.emit('userOffline', { userId: user.id });
    });

    // ── connection error ────────────────────────────────────────────────────
    socket.on('error', (err) => {
      console.error(`[socket] socket-level error  user=${user.id}:`, err.message);
    });
  });
};

/**
 * Check whether a user is currently online.
 * Useful for REST endpoints that need presence info.
 */
const isUserOnline = (userId) => onlineUsers.has(userId);

/**
 * Get the raw online-users map (read-only reference).
 */
const getOnlineUsers = () => onlineUsers;

module.exports = { registerSocketHandlers, isUserOnline, getOnlineUsers };
