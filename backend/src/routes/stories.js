const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// 1. POST / — Submit a new story (any logged-in user)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    if (title.length > 100) {
      return res.status(400).json({ error: 'Title must be 100 characters or less' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ error: 'Content must be 2000 characters or less' });
    }

    const story = await prisma.story.create({
      data: {
        title,
        content,
        authorId: req.user.id,
      },
    });

    res.status(201).json({ message: 'Story submitted for review!', story });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to submit story' });
  }
});

// 2. GET / — Get all APPROVED stories (public)
router.get('/', async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            alumniProfile: {
              select: { photoUrl: true },
            },
          },
        },
      },
    });

    res.json({ stories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// 3. GET /pending — Get pending stories (Admin only)
// IMPORTANT: This route MUST come before /:id
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({ stories });
  } catch (error) {
    console.error('Error fetching pending stories:', error);
    res.status(500).json({ error: 'Failed to fetch pending stories' });
  }
});

// 4. GET /:id — Get single APPROVED story (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const story = await prisma.story.findFirst({
      where: { id, status: 'APPROVED' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            alumniProfile: {
              select: { photoUrl: true, department: true, batchYear: true },
            },
          },
        },
      },
    });

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json({ story });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

// 5. PATCH /:id/status — Approve or Reject (Admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    }

    const story = await prisma.story.update({
      where: { id },
      data: { status },
    });

    res.json({ message: `Story ${status.toLowerCase()} successfully`, story });
  } catch (error) {
    console.error('Error updating story status:', error);
    res.status(500).json({ error: 'Failed to update story status' });
  }
});

// 6. DELETE /:id — Delete own story (author or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const story = await prisma.story.findUnique({ where: { id } });

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    if (req.user.role !== 'ADMIN' && story.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this story' });
    }

    await prisma.story.delete({ where: { id } });
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

module.exports = router;
