'use strict';

const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/connection.controller');

const router = Router();

// All connection routes require a valid, approved JWT
router.use(authMiddleware);

// ── Send / manage requests ────────────────────────────────────────────────────
router.post('/send/:userId',     ctrl.sendRequest);
router.post('/accept/:requestId', ctrl.acceptRequest);
router.post('/reject/:requestId', ctrl.rejectRequest);
router.post('/cancel/:requestId', ctrl.cancelRequest);
router.delete('/disconnect/:userId', ctrl.disconnect);

// ── Query endpoints (paginated) ───────────────────────────────────────────────
router.get('/status/:userId',      ctrl.getConnectionStatus);
router.get('/my',                  ctrl.getMyConnections);
router.get('/pending',             ctrl.getPendingRequests);
router.get('/sent',                ctrl.getSentRequests);
router.get('/mutual/:userId',      ctrl.getMutualConnections);

module.exports = router;
