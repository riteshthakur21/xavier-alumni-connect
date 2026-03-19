'use strict';

const repo = require('../repositories/chat.repository');
const { encrypt, decrypt, isEncrypted } = require('../utils/encryption');

// Lazy-require to avoid circular dependency (connection.service → chat.service if ever added).
// Call isConnected() — it only imports at first invocation.
const getIsConnected = () => require('./connection.service').isConnected;

// ── Decryption helpers ────────────────────────────────────────────────────────

/**
 * Safely decrypt a single message's content field.
 *
 * Three cases handled gracefully:
 *
 *   1. Soft-deleted messages  → content is '' in DB; return '' unchanged.
 *   2. Legacy plain-text rows → written before encryption was enabled;
 *                               detected via isEncrypted() heuristic;
 *                               returned as-is with a dev-mode warning.
 *   3. Decryption failure     → wrong key, tampered ciphertext, or corrupted
 *                               DB value; return a safe placeholder and log
 *                               the error.  Never crash or leak partial data.
 *
 * @param   {{ content: string, isDeleted?: boolean, id?: string }} message
 * @returns {string}  Plaintext, empty string, or safe error placeholder
 */
function safeDecrypt(message) {
  const { content, isDeleted, id } = message;

  // ── Case 1: Soft-deleted ─────────────────────────────────────────────────
  if (isDeleted || content === '') return '';

  // ── Case 2: Legacy plain-text (pre-encryption) ───────────────────────────
  if (!isEncrypted(content)) {
    // Only warn in non-production; avoids log noise on a first-clean deployment
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[Chat] Message ${id ?? '(unknown)'} is stored as plain text. ` +
        'Encryption was not applied at write time (legacy row).'
      );
    }
    return content;
  }

  // ── Case 3: Encrypted — attempt decryption ───────────────────────────────
  try {
    return decrypt(content);
  } catch (err) {
    // Auth tag mismatch = tampered data or wrong key.
    // Log for ops alerting; never return partial/corrupt plaintext.
    console.error(
      `[Chat] Decryption failed for message ${id ?? '(unknown)'}. ` +
      `Reason: ${err.message}`
    );
    return '[This message could not be decrypted]';
  }
}

/**
 * Return a new message object with its content field decrypted.
 * Never mutates the original object passed in.
 *
 * @param   {object} message  Raw DB message row
 * @returns {object}          Cloned message with decrypted content
 */
function decryptMessage(message) {
  return { ...message, content: safeDecrypt(message) };
}

/**
 * Decrypt all messages in a paginated result set.
 * Only the slice returned from the repository is decrypted —
 * never the full conversation history.
 *
 * @param   {{ messages: object[], nextCursor: string|null }} result
 * @returns {{ messages: object[], nextCursor: string|null }}
 */
function decryptMessagePage(result) {
  return {
    ...result,
    messages: result.messages.map(decryptMessage),
  };
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Get or create a 1-1 conversation between two users.
 * Prevents duplicate conversations by checking existence first.
 *
 * @param {string} requesterId  - User initiating the chat
 * @param {string} targetUserId - Other participant
 * @returns {Conversation}
 */
const getOrCreateConversation = async (requesterId, targetUserId) => {
  if (requesterId === targetUserId) {
    throw Object.assign(new Error('Cannot start a conversation with yourself'), {
      status: 400,
    });
  }

  // ── Connection gate ───────────────────────────────────────────────────────
  // Chat is only permitted between mutually connected users.
  const connected = await getIsConnected()(requesterId, targetUserId);
  if (!connected) {
    throw Object.assign(
      new Error('You can only start a conversation with a connected user. Send a connection request first.'),
      { status: 403 }
    );
  }

  const existing = await repo.findOneToOneConversation(requesterId, targetUserId);
  if (existing) return existing;

  return repo.createConversation(requesterId, targetUserId);
};

/**
 * Retrieve all conversations for a user with last-message preview.
 * The last-message content is decrypted before being returned.
 */
const getConversations = async (userId) => {
  const conversations = await repo.getUserConversations(userId);

  return conversations.map((conv) => {
    const other   = conv.members.find((m) => m.userId !== userId);
    const rawLast = conv.messages[0] || null;

    // Decrypt last-message preview (shown in conversation list sidebar).
    // If the last message is soft-deleted, safeDecrypt returns '' which
    // is then displayed as "This message was deleted" on the client.
    const lastMessage = rawLast ? decryptMessage(rawLast) : null;

    return {
      id:          conv.id,
      updatedAt:   conv.updatedAt,
      participant: other?.user ?? null,
      lastMessage,
    };
  });
};

/**
 * Paginated message history for a conversation.
 * Decrypts only the returned page — never the full history.
 * Throws 403 if the requesting user is not a member.
 */
const getMessages = async (conversationId, userId, { limit, cursor } = {}) => {
  const isMember = await repo.isConversationMember(conversationId, userId);
  if (!isMember) {
    throw Object.assign(new Error('Access denied to this conversation'), {
      status: 403,
    });
  }

  // Check whether the two users are still connected.
  const participants = await repo.getConversationParticipants(conversationId);
  const otherUserId  = participants.find((id) => id !== userId);
  let isConnected    = true;
  if (otherUserId) {
    isConnected = await getIsConnected()(userId, otherUserId);
  }

  const result = await repo.getMessages(conversationId, { limit, cursor });

  // Decrypt only the paginated slice fetched from the repository.
  return { ...decryptMessagePage(result), connected: isConnected };
};

/**
 * Encrypt, persist, and return a new message.
 *
 * Encryption happens in this service layer — the repository receives only
 * the ciphertext and never sees plaintext content.
 *
 * The returned message has decrypted content so the socket layer can emit
 * the original plaintext to connected clients without a second decrypt step.
 */
const sendMessage = async ({ conversationId, senderId, content }) => {
  if (!content || content.trim().length === 0) {
    throw Object.assign(new Error('Message content cannot be empty'), {
      status: 400,
    });
  }
  if (content.length > 2000) {
    throw Object.assign(new Error('Message too long (max 2000 chars)'), {
      status: 400,
    });
  }

  const isMember = await repo.isConversationMember(conversationId, senderId);
  if (!isMember) {
    throw Object.assign(new Error('Access denied to this conversation'), {
      status: 403,
    });
  }

  // ── Connection gate (re-check on every message) ───────────────────────────
  // Prevents message delivery if the connection was removed after the
  // conversation was created.
  const participants = await repo.getConversationParticipants(conversationId);
  const otherUserId  = participants.find((id) => id !== senderId);
  if (otherUserId) {
    const connected = await getIsConnected()(senderId, otherUserId);
    if (!connected) {
      throw Object.assign(
        new Error('You are no longer connected with this user. Messaging is not allowed.'),
        { status: 403 }
      );
    }
  }

  // Encrypt before DB write — the repository stores only ciphertext.
  const encryptedContent = encrypt(content.trim());

  const savedMessage = await repo.createMessage({
    conversationId,
    senderId,
    content: encryptedContent,
  });

  // Decrypt immediately after save so callers (socket, REST) work with
  // plaintext.  This avoids a second DB round-trip.
  return decryptMessage(savedMessage);
};

/**
 * Mark messages as seen and return count updated.
 */
const markAsSeen = async (conversationId, userId) => {
  const isMember = await repo.isConversationMember(conversationId, userId);
  if (!isMember) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }
  return repo.markMessagesAsSeen(conversationId, userId);
};

/**
 * Check membership without throwing — used by the socket handler.
 */
const verifyMembership = (conversationId, userId) =>
  repo.isConversationMember(conversationId, userId);

/**
 * Soft-delete a message.
 * The repository sets content='' and isDeleted=true — no decryption needed.
 */
const deleteMessage = async (messageId, userId) => {
  return repo.softDeleteMessage(messageId, userId);
};

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsSeen,
  verifyMembership,
  deleteMessage,
};
