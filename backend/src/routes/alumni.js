const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, alumniMiddleware } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

const router = express.Router();
const prisma = new PrismaClient();

// Get all alumni (public access)
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      batchYear, 
      department, 
      company, 
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {
      isVerified: true,
      alumniProfile: {
        isNot: null
      }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { alumniProfile: { company: { contains: search, mode: 'insensitive' } } },
        { alumniProfile: { jobTitle: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (batchYear) {
      where.alumniProfile.batchYear = parseInt(batchYear);
    }

    if (department) {
      where.alumniProfile.department = { contains: department, mode: 'insensitive' };
    }

    if (company) {
      where.alumniProfile.company = { contains: company, mode: 'insensitive' };
    }

    const alumni = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        alumniProfile: {
          select: {
            batchYear: true,
            department: true,
            company: true,
            jobTitle: true,
            photoUrl: true,
            location: true,
            contactPublic: true
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      alumni,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ error: 'Failed to fetch alumni' });
  }
});

// Get single alumni profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alumni = await prisma.user.findUnique({
      where: { 
        id,
        isVerified: true 
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        alumniProfile: true
      }
    });

    if (!alumni || !alumni.alumniProfile) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    // Hide contact info if not public and not the owner
    if (!alumni.alumniProfile.contactPublic && req.user?.id !== id) {
      alumni.email = null;
      alumni.alumniProfile.linkedinUrl = null;
    }

    res.json({ alumni });

  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ error: 'Failed to fetch alumni' });
  }
});

// Update alumni profile
router.put('/:id', authMiddleware,  upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user owns this profile
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { 
      name, 
      company, 
      jobTitle, 
      linkedinUrl, 
      bio, 
      location, 
      skills,
      contactPublic 
    } = req.body;

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id },
        data: { name }
      });
    }

    // Update alumni profile
    const updateData = {
      company,
      jobTitle,
      linkedinUrl,
      bio,
      location,
      contactPublic: contactPublic === 'true'
    };

    // Handle skills array
    if (skills) {
      try {
        updateData.skills = JSON.parse(skills);
      } catch (e) {
        updateData.skills = skills.split(',').map(skill => skill.trim());
      }
    }

    // Handle photo upload
    if (req.file) {
      // req.file.path mein Cloudinary ka 'https' wala asli link hota hai
      updateData.photoUrl = req.file.path; 
    }

    const updatedProfile = await prisma.alumniProfile.update({
      where: { userId: id },
      data: updateData
    });

    res.json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile 
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Profile Update Route (With Photo)
router.put('/update-profile', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };

    // Agar photo upload hui hai, toh uska URL database mein daalo
    if (req.file) {
      updateData.photoUrl = req.file.path; // Cloudinary ka link yahan hota hai
    }

    const profile = await prisma.alumniProfile.update({
      where: { userId },
      data: updateData
    });

    res.json({ message: 'Profile updated with photo! 📸', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get alumni statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalAlumni = await prisma.user.count({
      where: { 
        role: 'ALUMNI',
        isVerified: true 
      }
    });

    const totalByBatch = await prisma.alumniProfile.groupBy({
      by: ['batchYear'],
      _count: true,
      orderBy: { batchYear: 'desc' }
    });

    const totalByDepartment = await prisma.alumniProfile.groupBy({
      by: ['department'],
      _count: true,
      orderBy: { _count: 'desc' }
    });

    const totalByCompany = await prisma.alumniProfile.groupBy({
      by: ['company'],
      _count: true,
      orderBy: { _count: 'desc' },
      take: 10
    });

    res.json({
      totalAlumni,
      byBatch: totalByBatch,
      byDepartment: totalByDepartment,
      byCompany: totalByCompany
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get Current User Profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await prisma.alumniProfile.findUnique({
      where: { userId: req.user.id }
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;