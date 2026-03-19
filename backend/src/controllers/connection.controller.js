'use strict';

/**
 * Connection Controller
 *
 * Thin HTTP adapter — extracts params, calls the service,
 * and formats responses. No business logic lives here.
 */

const svc = require('../services/connection.service');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const handle = (fn) => async (req, res) => {
  try {
    const result = await fn(req);
    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error('[Connection]', err);
    res.status(status).json({ error: err.message });
  }
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// POST /connections/send/:userId
const sendRequest = handle((req) =>
  svc.sendRequest(req.user.id, req.params.userId)
);

// POST /connections/accept/:requestId
const acceptRequest = handle((req) =>
  svc.acceptRequest(req.params.requestId, req.user.id)
);

// POST /connections/reject/:requestId
const rejectRequest = handle((req) =>
  svc.rejectRequest(req.params.requestId, req.user.id)
);

// POST /connections/cancel/:requestId
const cancelRequest = handle((req) =>
  svc.cancelRequest(req.params.requestId, req.user.id)
);

// GET /connections/my
const getMyConnections = handle((req) =>
  svc.getMyConnections(req.user.id, req.query)
);

// GET /connections/pending
const getPendingRequests = handle((req) =>
  svc.getPendingRequests(req.user.id, req.query)
);

// GET /connections/sent
const getSentRequests = handle((req) =>
  svc.getSentRequests(req.user.id, req.query)
);

// GET /connections/status/:userId
const getConnectionStatus = handle((req) =>
  svc.getConnectionStatus(req.user.id, req.params.userId)
);

// GET /connections/mutual/:userId
const getMutualConnections = handle((req) =>
  svc.getMutualConnections(req.user.id, req.params.userId, req.query)
);

// DELETE /connections/disconnect/:userId
const disconnect = handle((req) =>
  svc.disconnect(req.user.id, req.params.userId)
);

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getMyConnections,
  getPendingRequests,
  getSentRequests,
  getMutualConnections,
  getConnectionStatus,
  disconnect,
};
