'use strict';

/**
 * Connection Repository
 *
 * Raw data-access layer — NO business logic here.
 * All business rules (who can accept, duplicate prevention, etc.)
 * belong in connection.service.js.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── Shared user select (keeps response payloads lean) ────────────────────────
const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  alumniProfile: {
    select: { photoUrl: true, department: true, batchYear: true, company: true, jobTitle: true },
  },
};

// ─── Connection Request Queries ───────────────────────────────────────────────

/**
 * Find any request between two users regardless of direction.
 * Used for duplicate detection before creating a new request.
 */
const findRequestBetween = (userAId, userBId) =>
  prisma.connectionRequest.findFirst({
    where: {
      OR: [
        { senderId: userAId, receiverId: userBId },
        { senderId: userBId, receiverId: userAId },
      ],
    },
  });

/**
 * Find a specific request by primary key with sender/receiver populated.
 */
const findRequestById = (requestId) =>
  prisma.connectionRequest.findUnique({
    where: { id: requestId },
    include: {
      sender:   { select: USER_SELECT },
      receiver: { select: USER_SELECT },
    },
  });

/**
 * Persist a new PENDING request.
 */
const createRequest = (senderId, receiverId) =>
  prisma.connectionRequest.create({
    data: { senderId, receiverId },
    include: { receiver: { select: USER_SELECT } },
  });

/**
 * Accept a connection request.
 *
 * Runs inside a single serializable transaction:
 *   1. Update request status → ACCEPTED
 *   2. Upsert (sender → receiver) row in user_connections
 *   3. Upsert (receiver → sender) row in user_connections
 *
 * Using upsert instead of create makes the operation idempotent —
 * a duplicate call (race condition) will silently succeed without
 * throwing a unique-constraint error.
 *
 * @param {string} requestId
 * @param {string} senderId   — original request sender
 * @param {string} receiverId — original request receiver (the one accepting)
 * @returns {ConnectionRequest} updated request
 */
const acceptRequest = (requestId, senderId, receiverId) =>
  prisma.$transaction(
    async (tx) => {
      // ── 1. Update status ─────────────────────────────────────────────────
      const updated = await tx.connectionRequest.update({
        where: { id: requestId },
        data:  { status: 'ACCEPTED' },
      });

      // ── 2 & 3. Insert both directions (idempotent) ───────────────────────
      await tx.userConnection.upsert({
        where:  { userId_connectionId: { userId: senderId,   connectionId: receiverId } },
        update: {},
        create: { userId: senderId,   connectionId: receiverId },
      });

      await tx.userConnection.upsert({
        where:  { userId_connectionId: { userId: receiverId, connectionId: senderId } },
        update: {},
        create: { userId: receiverId, connectionId: senderId },
      });

      return updated;
    },
    // Serializable isolation prevents two concurrent accepts on the same request
    { isolationLevel: 'Serializable' }
  );

/**
 * Set request status to REJECTED (does not delete; preserves audit trail).
 */
const rejectRequest = (requestId) =>
  prisma.connectionRequest.update({
    where: { id: requestId },
    data:  { status: 'REJECTED' },
  });

/**
 * Delete the request record entirely (used on cancel by sender).
 * Allows the same pair to send a new request later.
 */
const cancelRequest = (requestId) =>
  prisma.connectionRequest.delete({ where: { id: requestId } });

// ─── Connection List Queries ──────────────────────────────────────────────────

/**
 * Paginated list of accepted connections for a user.
 * Returns the "other" user object directly (projection on `connection` side).
 *
 * @returns {{ items: User[], total: number }}
 */
const getConnections = async (userId, { skip = 0, take = 20 } = {}) => {
  const [rows, total] = await Promise.all([
    prisma.userConnection.findMany({
      where:   { userId },
      include: { connection: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.userConnection.count({ where: { userId } }),
  ]);

  return { items: rows.map((r) => r.connection), total };
};

/**
 * Paginated PENDING requests received by a user.
 *
 * @returns {{ items: ConnectionRequest[], total: number }}
 */
const getPendingReceived = async (userId, { skip = 0, take = 20 } = {}) => {
  const where = { receiverId: userId, status: 'PENDING' };

  const [items, total] = await Promise.all([
    prisma.connectionRequest.findMany({
      where,
      include: { sender: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.connectionRequest.count({ where }),
  ]);

  return { items, total };
};

/**
 * Paginated PENDING requests sent by a user.
 *
 * @returns {{ items: ConnectionRequest[], total: number }}
 */
const getSentRequests = async (userId, { skip = 0, take = 20 } = {}) => {
  const where = { senderId: userId, status: 'PENDING' };

  const [items, total] = await Promise.all([
    prisma.connectionRequest.findMany({
      where,
      include: { receiver: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.connectionRequest.count({ where }),
  ]);

  return { items, total };
};

// ─── Connection existence check ───────────────────────────────────────────────

/**
 * Verify that BOTH directions exist in user_connections:
 *   (userAId → userBId)  AND  (userBId → userAId)
 *
 * A single-direction check is sufficient after a clean accept, but the
 * JOIN-based query below acts as a data-integrity guard: if somehow only
 * one direction was written (partial failure before our upsert approach),
 * this will correctly return false and block chat access.
 *
 * @param {string} userAId
 * @param {string} userBId
 * @returns {Promise<boolean>}
 */
const checkConnection = async (userAId, userBId) => {
  // Self-connections can never exist, short-circuit immediately.
  if (userAId === userBId) return false;

  const row = await prisma.userConnection.findUnique({
    where: {
      userId_connectionId: {
        userId: userAId,
        connectionId: userBId,
      },
    },
  });

  return row !== null;
};

// ─── Mutual Connections ───────────────────────────────────────────────────────

/**
 * Return users who are connected to BOTH userAId AND userBId.
 *
 * Uses two INNER JOINs on the adjacency-list table to find the intersection
 * in a single round-trip — no N+1 queries.
 *
 * @returns {{ items: object[], total: number }}
 */
const getMutualConnections = async (userAId, userBId, { skip = 0, take = 20 } = {}) => {
  // Prisma raw needs integer literals; validate at service before reaching here.
  const safeTake = Math.min(Number(take), 50);
  const safeSkip = Math.max(Number(skip), 0);

  const [items, countRows] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        ap."photoUrl",
        ap.department,
        ap."batchYear"
      FROM   user_connections uca
      JOIN   user_connections ucb
        ON   uca."connectionId" = ucb."connectionId"
      JOIN   users u
        ON   u.id = uca."connectionId"
      LEFT JOIN alumni_profiles ap
        ON   ap."userId" = u.id
      WHERE  uca."userId" = ${userAId}
        AND  ucb."userId" = ${userBId}
      ORDER  BY u.name
      LIMIT  ${safeTake}
      OFFSET ${safeSkip}
    `,
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS total
      FROM   user_connections uca
      JOIN   user_connections ucb
        ON   uca."connectionId" = ucb."connectionId"
      WHERE  uca."userId" = ${userAId}
        AND  ucb."userId" = ${userBId}
    `,
  ]);

  return { items, total: countRows[0]?.total ?? 0 };
};

/**
 * Remove a connection between two users.
 *
 * Runs inside a serializable transaction:
 *   1. Delete UserConnection row (A → B)
 *   2. Delete UserConnection row (B → A)
 *   3. Delete the ConnectionRequest between them (allows fresh re-connect later)
 *
 * @param {string} userAId
 * @param {string} userBId
 */
const disconnectUsers = (userAId, userBId) =>
  prisma.$transaction(
    async (tx) => {
      // Delete both directions from the adjacency list
      await tx.userConnection.deleteMany({
        where: {
          OR: [
            { userId: userAId, connectionId: userBId },
            { userId: userBId, connectionId: userAId },
          ],
        },
      });

      // Remove the request row so either user can send a fresh request later
      await tx.connectionRequest.deleteMany({
        where: {
          OR: [
            { senderId: userAId, receiverId: userBId },
            { senderId: userBId, receiverId: userAId },
          ],
        },
      });
    },
    { isolationLevel: 'Serializable' }
  );

module.exports = {
  findRequestBetween,
  findRequestById,
  createRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getConnections,
  getPendingReceived,
  getSentRequests,
  checkConnection,
  getMutualConnections,
  disconnectUsers,
};
