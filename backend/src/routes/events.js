// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const { authMiddleware, adminMiddleware } = require('../middleware/auth');
// const { upload } = require('../utils/cloudinary'); // Local file upload ke liye multer ka wrapper

// const router = express.Router();
// const prisma = new PrismaClient();

// // 1. Get All Events (Filtered by Role) 🎯
// router.get('/', authMiddleware, async (req, res) => {
//   try {
//     const userRole = req.user.role; // ADMIN, STUDENT, or ALUMNI

//     const where = {};

//     // Filter logic: Admin sees everything, others see 'ALL' + their specific role
//     if (userRole !== 'ADMIN') {
//       where.OR = [
//         { targetAudience: 'ALL' },
//         { targetAudience: userRole }
//       ];
//     }

//     const events = await prisma.event.findMany({
//       where,
//       orderBy: { date: 'asc' },
//       include: {
//         postedBy: {
//           select: { name: true, role: true }
//         },
//         registrations: {
//           include: {
//             user: {
//               select: { id: true, name: true, role: true }
//             }
//           }
//         }
//       }
//     });

//     res.json({ events });
//   } catch (error) {
//     console.error('Error fetching events:', error);
//     res.status(500).json({ error: 'Failed to fetch events' });
//   }
// });

// //  Naya Route: Participants ki list nikalne ke liye
// router.get('/:id/participants', authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const registrations = await prisma.eventRegistration.findMany({
//       where: { eventId: id },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             role: true,
//             // Profile se Batch aur Dept nikalne ke liye
//             alumniProfile: {
//               select: {
//                 batchYear: true,
//                 department: true,
//                 photoUrl: true
//               }
//             }
//           }
//         }
//       }
//     });

//     // Data ko clean karke sirf user objects bhejo
//     const participants = registrations.map(reg => reg.user);
//     res.json({ participants });
//   } catch (error) {
//     console.error('Error fetching participants:', error);
//     res.status(500).json({ error: 'Failed to load participants' });
//   }
// });

// // 2. Create Event (With Audience) 📝
// router.post('/', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
//   try {
//     // 👇 FormData use karte waqt data 'req.body' mein aata hai
//     const { title, description, date, location, targetAudience } = req.body;

//     // Validation: Check karo koi field khali toh nahi
//     if (!title || !description || !date) {
//       return res.status(400).json({ error: 'Missing required fields (Title, Description, or Date)' });
//     }

//     const event = await prisma.event.create({
//       data: {
//         title,
//         description,
//         date: new Date(date),
//         location: location || '',
//         targetAudience: targetAudience || 'ALL', // Naya field
//         imageUrl: req.file ? req.file.path : null, // Cloudinary photo
//         postedById: req.user.id // User ID middleware se aa rahi hai
//       }
//     });

//     res.status(201).json({ message: 'Event created successfully!', event });
//   } catch (error) {
//     console.error('Create Event Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // 2. Get Single Event
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const event = await prisma.event.findUnique({
//       where: { id },
//       include: {
//         postedBy: { select: { name: true } },
//         registrations: {
//           include: { user: { select: { name: true } } }
//         }
//       }
//     });

//     if (!event) return res.status(404).json({ error: 'Event not found' });
//     res.json({ event });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch event' });
//   }
// });


// // 4. Update Event (Admin Only) ✏️
// router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, date, location, isActive } = req.body;

//     const updateData = {
//       title, description, location,
//       isActive: isActive !== undefined ? isActive === 'true' : undefined
//     };

//     if (date) updateData.date = new Date(date);
//     if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;

//     const event = await prisma.event.update({
//       where: { id },
//       data: updateData
//     });

//     res.json({ message: 'Event updated successfully', event });
//   } catch (error) {
//     console.error('Error updating event:', error);
//     res.status(500).json({ error: 'Failed to update event' });
//   }
// });

// // 5. Delete Event (Admin Only) 🗑️
// router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.eventRegistration.deleteMany({ where: { eventId: id } });
//     await prisma.event.delete({ where: { id } });

//     res.json({ message: 'Event deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting event:', error);
//     res.status(500).json({ error: 'Failed to delete event' });
//   }
// });

// // 6. Register for Event (Verified Users Only) ✋
// router.post('/:id/register', authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     // 🕵️‍♂️ 1. Pehle check karo user verified hai ya nahi
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { isVerified: true }
//     });

//     if (!user?.isVerified) {
//       return res.status(403).json({ 
//         error: 'Registration Blocked! 🛑',
//         message: 'Bhai, pehle Admin se verify ho jao! Aapka account abhi pending hai.' 
//       });
//     }

//     // 2. Duplicate Check (Purana feature)
//     const existing = await prisma.eventRegistration.findUnique({
//       where: { userId_eventId: { userId, eventId: id } }
//     });

//     if (existing) {
//       return res.status(400).json({ error: 'You have already registered!' });
//     }

//     // 3. Create Registration
//     await prisma.eventRegistration.create({
//       data: { userId, eventId: id }
//     });

//     res.json({ message: 'Successfully registered! 🎉' });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: 'Failed to register' });
//   }
// });

// module.exports = router;

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

const router = express.Router();
const prisma = new PrismaClient();

// ── Helper: department check ──────────────────────────────────────────────────
// Returns false if this user should be BLOCKED based on department filter
// Returns true if user passes (or no dept filter is set)
function passesDeptFilter(batches, userRole, userDept) {
  if (!batches.departments || batches.departments.length === 0) return true; // no filter = pass

  const scope = batches.deptScope || 'BOTH';

  // Does this dept filter even apply to this user's role?
  const appliesToMe =
    scope === 'BOTH' ||
    (scope === 'ALUMNI'   && userRole === 'ALUMNI')  ||
    (scope === 'STUDENTS' && userRole === 'STUDENT');

  if (!appliesToMe) return true; // filter doesn't apply to this role = pass

  // Filter applies — check if user's dept is in the list
  return batches.departments.includes(userDept);
}

// ── 1. Get All Events (Filtered by Role + Batch + Department) ─────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userRole  = req.user.role;
    const userBatch = req.user.alumniProfile?.batchYear ?? null;
    const userDept  = req.user.alumniProfile?.department ?? null;  // NEW

    const allEvents = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        postedBy: {
          select: { name: true, role: true }
        },
        registrations: {
          include: {
            user: {
              select: { id: true, name: true, role: true }
            }
          }
        }
      }
    });

    // ── Filter logic ──────────────────────────────────────────────────────────
    const visibleEvents = allEvents.filter(event => {
      // Admin sees everything
      if (userRole === 'ADMIN') return true;

      // Parse targetBatches safely
      let batches = { alumni: [], students: [], departments: [], deptScope: 'BOTH' };
      if (event.targetBatches) {
        try { batches = { ...batches, ...JSON.parse(event.targetBatches) }; } catch {}
      }

      // ALL audience — check only department filter
      if (event.targetAudience === 'ALL') {
        return passesDeptFilter(batches, userRole, userDept);
      }

      // ALUMNI audience
      if (event.targetAudience === 'ALUMNI') {
        if (userRole !== 'ALUMNI') return false;
        // Batch check
        if (batches.alumni && batches.alumni.length > 0) {
          if (!batches.alumni.includes(userBatch)) return false;
        }
        // Department check
        return passesDeptFilter(batches, userRole, userDept);
      }

      // STUDENT audience
      if (event.targetAudience === 'STUDENT') {
        if (userRole !== 'STUDENT') return false;
        // Batch check
        if (batches.students && batches.students.length > 0) {
          if (!batches.students.includes(userBatch)) return false;
        }
        // Department check
        return passesDeptFilter(batches, userRole, userDept);
      }

      // CUSTOM — mix of alumni + student batches
      if (event.targetAudience === 'CUSTOM') {
        if (userRole === 'ALUMNI') {
          if (!batches.alumni || batches.alumni.length === 0) return false;
          if (!batches.alumni.includes(userBatch)) return false;
          return passesDeptFilter(batches, userRole, userDept);
        }
        if (userRole === 'STUDENT') {
          if (!batches.students || batches.students.length === 0) return false;
          if (!batches.students.includes(userBatch)) return false;
          return passesDeptFilter(batches, userRole, userDept);
        }
        return false;
      }

      return false;
    });

    res.json({ events: visibleEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// ── Participants list ─────────────────────────────────────────────────────────
router.get('/:id/participants', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true, name: true, role: true,
            alumniProfile: {
              select: { batchYear: true, department: true, photoUrl: true }
            }
          }
        }
      }
    });
    const participants = registrations.map(reg => reg.user);
    res.json({ participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to load participants' });
  }
});

// ── 2. Create Event ───────────────────────────────────────────────────────────
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, location, targetAudience, targetBatches, registrationLink } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Missing required fields (Title, Description, or Date)' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date:           new Date(date),
        location:       location || '',
        targetAudience: targetAudience || 'ALL',
        targetBatches:  targetBatches  || null,
        registrationLink: registrationLink || null,
        imageUrl:       req.file ? req.file.path : null,
        postedById:     req.user.id
      }
    });

    res.status(201).json({ message: 'Event created successfully!', event });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── 3. Get Single Event ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        postedBy: { select: { name: true } },
        registrations: {
          include: { user: { select: { name: true } } }
        }
      }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// ── 4. Update Event ───────────────────────────────────────────────────────────
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Nayi fields ko req.body se nikalo
    const { title, description, date, location, isActive, targetAudience, targetBatches, registrationLink } = req.body;

    // 2. updateData mein naye fields add karo
    const updateData = {
      title, 
      description, 
      location,
      targetAudience,   // <--- NAYA
      targetBatches,    // <--- NAYA
      registrationLink, // <--- NAYA
      isActive: isActive !== undefined ? isActive === 'true' : undefined
    };

    if (date) updateData.date = new Date(date);
    
    // 3. Cloudinary wala sahi path lagao (purana /uploads/ wala hata diya)
    if (req.file) {
      updateData.imageUrl = req.file.path; 
    }

    const event = await prisma.event.update({ where: { id }, data: updateData });
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});
// router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, date, location, isActive } = req.body;

//     const updateData = {
//       title, description, location,
//       isActive: isActive !== undefined ? isActive === 'true' : undefined
//     };
//     if (date)     updateData.date     = new Date(date);
//     if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;

//     const event = await prisma.event.update({ where: { id }, data: updateData });
//     res.json({ message: 'Event updated successfully', event });
//   } catch (error) {
//     console.error('Error updating event:', error);
//     res.status(500).json({ error: 'Failed to update event' });
//   }
// });


// ── 5. Delete Event ───────────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.eventRegistration.deleteMany({ where: { eventId: id } });
    await prisma.event.delete({ where: { id } });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ── 6. Register for Event ─────────────────────────────────────────────────────
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const { id }   = req.params;
    const userId   = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true }
    });

    if (!user?.isVerified) {
      return res.status(403).json({
        error: 'Registration Blocked! 🛑',
        message: 'Pehle Admin se verify ho jao!'
      });
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId: id } }
    });
    if (existing) return res.status(400).json({ error: 'Already registered!' });

    await prisma.eventRegistration.create({ data: { userId, eventId: id } });
    res.json({ message: 'Successfully registered! 🎉' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

module.exports = router;