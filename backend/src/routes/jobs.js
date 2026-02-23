const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// 1. Get All Jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        postedBy: {
          select: { 
            name: true, 
            email: true, 
            role: true, 
            id: true,
            // 👇 Ye naya section add kiya hai
            alumniProfile: {
              select: { id: true } // Ab humein asli Alumni ID milegi
            }
          } 
        }
      }
    });
    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// 2. Post a New Job (Sirf Alumni/Admin ke liye) 🔒
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, company, location, type, description, applyLink } = req.body;

    // Check: Kya user Alumni ya Admin hai?
    if (req.user.role !== 'ALUMNI' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only Alumni can post jobs!' });
    }

    const job = await prisma.job.create({
      data: {
        title,
        company,
        location,
        type,         // e.g. "Full-time" or "Internship"
        description,
        applyLink,
        postedById: req.user.id // Jo user logged-in hai, uska ID
      }
    });

    res.status(201).json({ message: 'Job posted successfully!', job });

  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to post job' });
  }
});


// 3. Delete Job (Admin or Owner Only) 🗑️
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Pehle job dhoondo
    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Check: Kya delete karne wala Admin hai ya wahi banda hai jisne post kiya?
    if (req.user.role !== 'ADMIN' && job.postedById !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    // Delete karo
    await prisma.job.delete({ where: { id } });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;