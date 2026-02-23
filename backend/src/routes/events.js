const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary'); // Local file upload ke liye multer ka wrapper

const router = express.Router();
const prisma = new PrismaClient();

// 1. Get All Events (Filtered by Role) 🎯
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.role; // ADMIN, STUDENT, or ALUMNI

    const where = {};

    // Filter logic: Admin sees everything, others see 'ALL' + their specific role
    if (userRole !== 'ADMIN') {
      where.OR = [
        { targetAudience: 'ALL' },
        { targetAudience: userRole }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        // 'postedBy' वही है जो आपने schema.prisma में लिखा है
        postedBy: {
          select: { name: true, role: true }
        },
        // Registrations भी ले आओ ताकि 'Who's Joining' वाला हिस्सा चले
        registrations: {
          include: {
            user: {
              select: { id: true, name: true, role: true }
            }
          }
        }
      }
    });

    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

//  Naya Route: Participants ki list nikalne ke liye
router.get('/:id/participants', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            // Profile se Batch aur Dept nikalne ke liye
            alumniProfile: {
              select: {
                batchYear: true,
                department: true,
                photoUrl: true
              }
            }
          }
        }
      }
    });

    // Data ko clean karke sirf user objects bhejo
    const participants = registrations.map(reg => reg.user);
    res.json({ participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to load participants' });
  }
});

// 2. Create Event (With Audience) 📝
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    // 👇 FormData use karte waqt data 'req.body' mein aata hai
    const { title, description, date, location, targetAudience } = req.body;

    // Validation: Check karo koi field khali toh nahi
    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Missing required fields (Title, Description, or Date)' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location: location || '',
        targetAudience: targetAudience || 'ALL', // Naya field
        imageUrl: req.file ? req.file.path : null, // Cloudinary photo
        postedById: req.user.id // User ID middleware se aa rahi hai
      }
    });

    res.status(201).json({ message: 'Event created successfully!', event });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get Single Event
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

// // 3. Create Event (Admin Only) ➕
// router.post('/', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
//   try {
//     const { title, description, date, location } = req.body;

//     if (!title || !description || !date) {
//       return res.status(400).json({ error: 'Title, description, and date are required' });
//     }

//     const event = await prisma.event.create({
//       data: {
//         title,
//         description,
//         date: new Date(date),
//         location,
//         imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        
//         // 👇 Ye Line Missing thi, isliye error aa raha tha!
//         postedById: req.user.id 
//       }
//     });

//     res.status(201).json({ message: 'Event created successfully', event });
//   } catch (error) {
//     console.error('Error creating event:', error);
//     res.status(500).json({ error: 'Failed to create event' });
//   }
// });

// 4. Update Event (Admin Only) ✏️
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, isActive } = req.body;

    const updateData = {
      title, description, location,
      isActive: isActive !== undefined ? isActive === 'true' : undefined
    };

    if (date) updateData.date = new Date(date);
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;

    const event = await prisma.event.update({
      where: { id },
      data: updateData
    });

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// 5. Delete Event (Admin Only) 🗑️
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

// 6. Register for Event (Verified Users Only) ✋
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 🕵️‍♂️ 1. Pehle check karo user verified hai ya nahi
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true }
    });

    if (!user?.isVerified) {
      return res.status(403).json({ 
        error: 'Registration Blocked! 🛑',
        message: 'Bhai, pehle Admin se verify ho jao! Aapka account abhi pending hai.' 
      });
    }

    // 2. Duplicate Check (Purana feature)
    const existing = await prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId: id } }
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already registered!' });
    }

    // 3. Create Registration
    await prisma.eventRegistration.create({
      data: { userId, eventId: id }
    });

    res.json({ message: 'Successfully registered! 🎉' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

module.exports = router;