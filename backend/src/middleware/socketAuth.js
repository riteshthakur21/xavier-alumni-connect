const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Socket.io authentication middleware.
 * Validates JWT from handshake auth or query and attaches user to socket.
 *
 * Client must send:  socket = io(URL, { auth: { token: "Bearer <jwt>" } })
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    // Accept token from auth object or query string (websocket fallback)
    const raw =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      socket.handshake.query?.token;

    if (!raw) {
      return next(new Error('AUTH_NO_TOKEN'));
    }

    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new Error('AUTH_INVALID_TOKEN'));
    }

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return next(new Error('AUTH_BAD_PAYLOAD'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isVerified: true, status: true },
    });

    if (!user) {
      return next(new Error('AUTH_USER_NOT_FOUND'));
    }

    // Block non-admin accounts that are not APPROVED
    if (user.role !== 'ADMIN') {
      if (user.status === 'PENDING') return next(new Error('AUTH_ACCOUNT_PENDING'));
      if (user.status === 'REJECTED') return next(new Error('AUTH_ACCOUNT_REJECTED'));
    }

    // Attach to socket for all subsequent handlers
    socket.user = user;
    next();
  } catch (err) {
    console.error('[socketAuth] Unexpected error:', err.message);
    next(new Error('AUTH_ERROR'));
  }
};

module.exports = socketAuthMiddleware;
