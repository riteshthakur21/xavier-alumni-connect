'use strict';

/**
 * Connection Service
 *
 * All business logic for the LinkedIn-style connection system.
 * Repository calls are the only place that touches the database.
 */

const repo = require('../repositories/connection.repository');
const { validate: isUUID } = require('uuid');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a paginated response envelope.
 * All list endpoints return the same shape so the client never surprises.
 */
const paginate = ({ items, total, page, limit }) => ({
  data: items,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  },
});

/**
 * Parse and clamp pagination query params.
 */
const parsePaging = (query) => {
  const page  = Math.max(1, parseInt(query.page  || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || '20', 10)));
  return { page, limit, skip: (page - 1) * limit, take: limit };
};

/**
 * Throw a structured error with an HTTP status code attached.
 */
const fail = (status, message) => {
  const err  = new Error(message);
  err.status = status;
  throw err;
};

/**
 * Validate that a value looks like a v4 UUID.
 * Prevents raw SQL injection and nonsense DB queries.
 */
const requireUUID = (value, label = 'id') => {
  if (!value || !isUUID(value)) fail(400, `Invalid ${label}: must be a valid UUID`);
};

// ─── Send Request ─────────────────────────────────────────────────────────────

/**
 * Send a connection request from `senderId` to `targetId`.
 *
 * Validation order (each check hits the DB at most once):
 *   1. UUID format check (no DB hit)
 *   2. Self-request guard (no DB hit)
 *   3. Existing-connection check
 *   4. Existing-request check (covers both PENDING and ACCEPTED in either direction)
 */
const sendRequest = async (senderId, targetId) => {
  requireUUID(targetId, 'targetId');

  if (senderId === targetId) fail(400, 'You cannot send a connection request to yourself');

  // ── Check if already connected ───────────────────────────────────────────
  const alreadyConnected = await repo.checkConnection(senderId, targetId);
  if (alreadyConnected) fail(409, 'You are already connected with this user');

  // ── Check for any existing request between the pair ──────────────────────
  const existing = await repo.findRequestBetween(senderId, targetId);
  if (existing) {
    if (existing.status === 'PENDING') {
      // If THEY sent to US, tell the caller to just accept it instead
      if (existing.senderId === targetId) {
        fail(409, 'This user has already sent you a connection request. Accept it instead.');
      }
      fail(409, 'A connection request to this user is already pending');
    }
    if (existing.status === 'ACCEPTED') {
      fail(409, 'You are already connected with this user');
    }
    // REJECTED — allow re-send: delete stale rejected row first
    if (existing.status === 'REJECTED') {
      await repo.cancelRequest(existing.id);
    }
  }

  return repo.createRequest(senderId, targetId);
};

// ─── Accept Request ───────────────────────────────────────────────────────────

/**
 * Accept an incoming connection request.
 *
 * Only the RECEIVER of the original request may call this.
 * Only PENDING requests can be accepted.
 * Transaction inside repo.acceptRequest ensures atomicity.
 */
const acceptRequest = async (requestId, currentUserId) => {
  requireUUID(requestId, 'requestId');

  const request = await repo.findRequestById(requestId);
  if (!request) fail(404, 'Connection request not found');

  // Authorization: only the receiver may accept
  if (request.receiverId !== currentUserId) {
    fail(403, 'You are not authorized to accept this request');
  }

  if (request.status !== 'PENDING') {
    fail(409, `Cannot accept a request with status: ${request.status}`);
  }

  return repo.acceptRequest(requestId, request.senderId, request.receiverId);
};

// ─── Reject Request ───────────────────────────────────────────────────────────

/**
 * Reject a pending incoming request.
 * Only the receiver may reject. Status updated to REJECTED (soft — audit trail kept).
 */
const rejectRequest = async (requestId, currentUserId) => {
  requireUUID(requestId, 'requestId');

  const request = await repo.findRequestById(requestId);
  if (!request) fail(404, 'Connection request not found');

  if (request.receiverId !== currentUserId) {
    fail(403, 'You are not authorized to reject this request');
  }

  if (request.status !== 'PENDING') {
    fail(409, `Cannot reject a request with status: ${request.status}`);
  }

  return repo.rejectRequest(requestId);
};

// ─── Cancel Request ───────────────────────────────────────────────────────────

/**
 * Cancel (withdraw) a pending outgoing request.
 * Only the original SENDER may cancel. The row is hard-deleted so the
 * other user can send a fresh request later if needed.
 */
const cancelRequest = async (requestId, currentUserId) => {
  requireUUID(requestId, 'requestId');

  const request = await repo.findRequestById(requestId);
  if (!request) fail(404, 'Connection request not found');

  if (request.senderId !== currentUserId) {
    fail(403, 'You can only cancel your own connection requests');
  }

  if (request.status !== 'PENDING') {
    fail(409, `Cannot cancel a request with status: ${request.status}. Only PENDING requests can be cancelled.`);
  }

  await repo.cancelRequest(requestId);
  return { message: 'Connection request cancelled' };
};

// ─── Get Lists ────────────────────────────────────────────────────────────────

const getMyConnections = async (userId, query) => {
  const { page, limit, skip, take } = parsePaging(query);
  const { items, total } = await repo.getConnections(userId, { skip, take });
  return paginate({ items, total, page, limit });
};

const getPendingRequests = async (userId, query) => {
  const { page, limit, skip, take } = parsePaging(query);
  const { items, total } = await repo.getPendingReceived(userId, { skip, take });
  return paginate({ items, total, page, limit });
};

const getSentRequests = async (userId, query) => {
  const { page, limit, skip, take } = parsePaging(query);
  const { items, total } = await repo.getSentRequests(userId, { skip, take });
  return paginate({ items, total, page, limit });
};

const getMutualConnections = async (currentUserId, targetUserId, query) => {
  requireUUID(targetUserId, 'targetUserId');
  if (currentUserId === targetUserId) fail(400, 'Cannot get mutual connections with yourself');

  const { page, limit, skip, take } = parsePaging(query);
  const { items, total } = await repo.getMutualConnections(currentUserId, targetUserId, { skip, take });
  return paginate({ items, total, page, limit });
};

// ─── isConnected utility (re-export to avoid direct repo imports elsewhere) ───

/**
 * Check whether two users are mutually connected.
 * This is the single source of truth used by the chat system.
 *
 * @param {string} userAId
 * @param {string} userBId
 * @returns {Promise<boolean>}
 */
const isConnected = (userAId, userBId) => repo.checkConnection(userAId, userBId);

// ─── Connection Status (used by profile/directory UI) ─────────────────────────

/**
 * Return the exact relationship state between the current user and a target.
 *
 * Possible statuses:
 *   self              — target is the current user
 *   connected         — mutually connected; chat is allowed
 *   pending_sent      — current user sent a request waiting for acceptance
 *   pending_received  — target sent a request; current user can accept/reject
 *   not_connected     — no relationship; current user can send a request
 *
 * @param {string} currentUserId
 * @param {string} targetUserId
 * @returns {Promise<{ status: string, requestId?: string }>}
 */
const getConnectionStatus = async (currentUserId, targetUserId) => {
  requireUUID(targetUserId, 'targetUserId');

  if (currentUserId === targetUserId) {
    return { status: 'self' };
  }

  // Mutual connection is the most common case for active users — check first.
  const connected = await repo.checkConnection(currentUserId, targetUserId);
  if (connected) return { status: 'connected' };

  // Check if any pending request exists between the pair.
  const request = await repo.findRequestBetween(currentUserId, targetUserId);
  if (request && request.status === 'PENDING') {
    if (request.senderId === currentUserId) {
      return { status: 'pending_sent',     requestId: request.id };
    }
    return   { status: 'pending_received', requestId: request.id };
  }

  return { status: 'not_connected' };
};

// ─── Disconnect ──────────────────────────────────────────────────────────────

/**
 * Remove an accepted connection between two users.
 *
 * Only a user who is currently part of the connection may disconnect.
 * Deletes both UserConnection rows and the ConnectionRequest in a single
 * transaction so either party can send a fresh request afterwards.
 *
 * @param {string} currentUserId
 * @param {string} targetUserId
 * @returns {Promise<{ message: string }>}
 */
const disconnect = async (currentUserId, targetUserId) => {
  requireUUID(targetUserId, 'targetUserId');

  if (currentUserId === targetUserId) fail(400, 'You cannot disconnect from yourself');

  const connected = await repo.checkConnection(currentUserId, targetUserId);
  if (!connected) fail(409, 'You are not connected with this user');

  await repo.disconnectUsers(currentUserId, targetUserId);
  return { message: 'Successfully disconnected' };
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getMyConnections,
  getPendingRequests,
  getSentRequests,
  getMutualConnections,
  isConnected,
  getConnectionStatus,
  disconnect,
};
