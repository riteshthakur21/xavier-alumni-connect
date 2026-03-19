const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── Conversations ────────────────────────────────────────────────────────────

/**
 * Find an existing 1-1 conversation between two users.
 * Uses a double-join to find conversations where BOTH userIds are members.
 */
const findOneToOneConversation = async (userAId, userBId) => {
  // Find conversation IDs that userA is a member of
  const result = await prisma.$queryRaw`
    SELECT cm1."conversationId"
    FROM conversation_members cm1
    INNER JOIN conversation_members cm2
      ON cm1."conversationId" = cm2."conversationId"
    WHERE cm1."userId"  = ${userAId}
      AND cm2."userId"  = ${userBId}
    LIMIT 1
  `;
  if (!result || result.length === 0) return null;

  return prisma.conversation.findUnique({
    where: { id: result[0].conversationId },
    include: {
      members: {
        include: {
          user: {
              select: {
                id: true,
                name: true,
                email: true,
                alumniProfile: { select: { photoUrl: true } },
              },
            },
        },
      },
    },
  });
};

/**
 * Create a new conversation and add both members atomically.
 */
const createConversation = async (userAId, userBId) => {
  return prisma.conversation.create({
    data: {
      members: {
        create: [{ userId: userAId }, { userId: userBId }],
      },
    },
    include: {
      members: {
        include: {
          user: {
              select: {
                id: true,
                name: true,
                email: true,
                alumniProfile: { select: { photoUrl: true } },
              },
            },
        },
      },
    },
  });
};

/**
 * Get all conversations for a user, ordered by most recent message.
 * Includes the other member's info and the last message preview.
 */
const getUserConversations = async (userId) => {
  return prisma.conversation.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      members: {
        include: {
          user: {
              select: {
                id: true,
                name: true,
                email: true,
                alumniProfile: { select: { photoUrl: true } },
              },
            },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          content: true,
          isSeen: true,
          createdAt: true,
          senderId: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

/**
 * Verify that a user is a member of a conversation.
 */
const isConversationMember = async (conversationId, userId) => {
  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return !!member;
};

/**
 * Return all userId values that belong to a given conversation.
 * Used by the chat service to find the other participant for connection checks.
 */
const getConversationParticipants = async (conversationId) => {
  const members = await prisma.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
};

// ─── Messages ─────────────────────────────────────────────────────────────────

/**
 * Persist a new message.
 */
const createMessage = async ({ conversationId, senderId, content }) => {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, content },
      include: {
        sender: {
        select: {
          id: true,
          name: true,
          email: true,
          alumniProfile: { select: { photoUrl: true } },
        },
      },
      },
    }),
    // Bump conversation updatedAt so ordering stays correct
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return message;
};

/**
 * Paginated message fetch (cursor-based, newest first internally then reversed).
 *
 * @param {string} conversationId
 * @param {object} options  { limit: number, cursor: string|null }
 * @returns {{ messages: Message[], nextCursor: string|null }}
 */
const getMessages = async (conversationId, { limit = 20, cursor = null } = {}) => {
  const take = Math.min(limit, 50); // Hard cap at 50

  const where = { conversationId };
  if (cursor) {
    where.createdAt = { lt: new Date(cursor) }; // Messages older than cursor
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          alumniProfile: { select: { photoUrl: true } },
        },
      },
    },
  });

  // Return in chronological order for UI
  const ordered = messages.reverse();
  const nextCursor =
    messages.length === take ? messages[0].createdAt.toISOString() : null;

  return { messages: ordered, nextCursor };
};

/**
 * Mark all unseen messages in a conversation (not sent by the current user) as seen.
 * Returns number of updated rows.
 */
const markMessagesAsSeen = async (conversationId, userId) => {
  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      isSeen: false,
      senderId: { not: userId },
    },
    data: { isSeen: true },
  });
  return result.count;
};

/**
 * Soft-delete a message: set isDeleted=true, wipe content.
 * Only the original sender is allowed.
 */
const softDeleteMessage = async (messageId, senderId) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) {
    throw Object.assign(new Error('Message not found'), { status: 404 });
  }
  if (message.senderId !== senderId) {
    throw Object.assign(new Error('You can only delete your own messages'), { status: 403 });
  }
  return prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true, content: '' },
  });
};

module.exports = {
  findOneToOneConversation,
  createConversation,
  getUserConversations,
  isConversationMember,
  getConversationParticipants,
  createMessage,
  getMessages,
  markMessagesAsSeen,
  softDeleteMessage,
};
