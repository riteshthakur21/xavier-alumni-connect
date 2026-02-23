const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// 1. Get Pending Users (Alumni + Students) ⏳
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { 
        // 👇 FIX: Ab ye Alumni aur Student dono ko check karega
        role: { in: ['ALUMNI', 'STUDENT'] },
        isVerified: false 
      },
      include: {
        alumniProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Frontend ko 'pendingAlumni' naam se hi data bhej rahe hain taaki code na fate
    res.json({ pendingAlumni: pendingUsers });

  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

// // 2. Verify User (Approve/Reject) ✅❌
// router.post('/verify/:id', authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { action } = req.body; // 'approve' or 'reject'

//     if (!['approve', 'reject'].includes(action)) {
//       return res.status(400).json({ error: 'Invalid action' });
//     }

//     if (action === 'approve') {
//       // Approve User
//       await prisma.user.update({
//         where: { id },
//         data: { isVerified: true }
//       });

//       res.json({ message: 'User approved successfully' });
//     } else {
//       // Reject User - delete (cascade will delete profile)
//       await prisma.user.delete({
//         where: { id }
//       });

//       res.json({ message: 'User registration rejected' });
//     }

//   } catch (error) {
//     console.error('Error verifying user:', error);
//     res.status(500).json({ error: 'Failed to verify user' });
//   }
// });

// 2. Verify User (Approve/Reject) ✅❌
router.post('/verify/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (action === 'approve') {
      await prisma.user.update({
        where: { id },
        data: { isVerified: true }
      });
      return res.json({ message: 'User approved successfully' });
    } 
    
    else if (action === 'reject') {
      // --- 💣 SAB KUCH SAAF KARO PEHLE ---
      
      // 1. Delete Event Registrations (Jo user ne join kiye hain)
      await prisma.eventRegistration.deleteMany({ where: { userId: id } });

      // 2. Delete Jobs (Jo user ne post ki hain)
      await prisma.job.deleteMany({ where: { postedById: id } });

      // 3. Delete Events (Jo user ne create kiye hain)
      await prisma.event.deleteMany({ where: { postedById: id } });

      // 4. Delete Alumni Profile (Wese schema mein cascade hai, par double safety ke liye)
      await prisma.alumniProfile.deleteMany({ where: { userId: id } });

      // 5. Final Step: Delete User Account
      await prisma.user.delete({
        where: { id }
      });

      return res.json({ message: 'User registration rejected and all traces removed!' });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('REJECT ERROR:', error);
    res.status(500).json({ error: 'Database constraint failed. Still linked to other data.' });
  }
});


// 3. Delete User 🗑️
router.delete('/alumni/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 4. Get System Statistics 📊
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    
    const totalAlumni = await prisma.user.count({
      where: { role: 'ALUMNI' }
    });
    
    const verifiedAlumni = await prisma.user.count({
      where: { role: 'ALUMNI', isVerified: true }
    });

    // 👇 FIX: Stats me bhi ab Students count honge agar wo pending hain
    const pendingVerifications = await prisma.user.count({
      where: { 
        role: { in: ['ALUMNI', 'STUDENT'] },
        isVerified: false 
      }
    });

    const totalStudents = await prisma.user.count({
      where: { role: 'STUDENT' }
    });
    
    const totalEvents = await prisma.event.count();

    const recentRegistrations = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true
      }
    });

    res.json({
      totalUsers,
      totalAlumni,
      verifiedAlumni,
      pendingAlumni: pendingVerifications, // Name same rakha hai taaki frontend na toote
      totalStudents,
      totalEvents,
      recentRegistrations
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// 5. Get All Users (List View) 👥
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { rollNo: { contains: search, mode: 'insensitive' } } // 👈 Ab ye kaam karega
      ];
    }
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        rollNo: true,    // 👈 Ye tumhare User model mein hai
        createdAt: true,
        alumniProfile: {
          select: {
            batchYear: true,
            department: true,
            // profileImage: true, // 👈 Agar ye field AlumniProfile mein hai toh yahan add karo
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;