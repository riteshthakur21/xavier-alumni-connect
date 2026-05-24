'use strict';

const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const svc = require('../services/notification.service');

const router = Router();
router.use(authMiddleware);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip  = (page - 1) * limit;
    const [notifications, unread] = await Promise.all([
      svc.getForUser(req.user.id, { skip, take: limit }),
      svc.countUnread(req.user.id),
    ]);
    res.json({ notifications, unreadCount: unread });
  } catch (err) {
    console.error('[Notification] GET /', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count  (MUST be before /:id)
router.get('/unread-count', async (req, res) => {
  try {
    const count = await svc.countUnread(req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// PATCH /api/notifications/read-all  (MUST be before /:id)
router.patch('/read-all', async (req, res) => {
  try {
    await svc.markAllRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    await svc.markRead(req.params.id, req.user.id);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    await svc.remove(req.params.id, req.user.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
