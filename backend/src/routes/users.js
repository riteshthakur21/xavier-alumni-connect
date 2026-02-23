const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// 1. Get All VERIFIED Users (Directory ke liye)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isVerified: true  // <--- YAHAN HAI MAGIC (Sirf Verified log dikhenge) 🔒
      },
      include: {
        alumniProfile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.alumniProfile?.department || 'N/A',
      batchYear: user.alumniProfile?.batchYear || '',
      currentCompany: user.alumniProfile?.company || '',
      jobTitle: user.alumniProfile?.jobTitle || '',
      profileImage: user.alumniProfile?.photoUrl || null,
    }));

    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch directory' });
  }
});

// 2. Get Single VERIFIED User Profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Yahan bhi check lagaya ki banda Verified hai ya nahi
    const user = await prisma.user.findFirst({
      where: { 
        id: id,
        isVerified: true // <--- LOCK LAGA DIYA 🔒
      },
      include: { alumniProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found or not verified' });
    }

    const formattedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.alumniProfile?.department || 'N/A',
        batchYear: user.alumniProfile?.batchYear || '',
        currentCompany: user.alumniProfile?.company || '',
        jobTitle: user.alumniProfile?.jobTitle || '',
        profileImage: user.alumniProfile?.photoUrl || null,
        linkedinUrl: user.alumniProfile?.linkedinUrl || '',
        bio: user.alumniProfile?.bio || '',
        location: user.alumniProfile?.location || '',
        skills: user.alumniProfile?.skills || [] 
    };

    res.json({ user: formattedUser });
  } catch (error) {
    console.error('Error fetching single user:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;

// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const router = express.Router();

// const prisma = new PrismaClient();

// // 1. Get All VERIFIED Users (Directory ke liye)
// router.get('/', async (req, res) => {
//   try {
//     const users = await prisma.user.findMany({
//       where: {
//         isVerified: true  // <--- YAHAN HAI MAGIC (Sirf Verified log dikhenge) 🔒
//       },
//       include: {
//         alumniProfile: true
//       },
//       orderBy: {
//         createdAt: 'desc'
//       }
//     });

//     const formattedUsers = users.map(user => ({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       department: user.alumniProfile?.department || 'N/A',
//       batchYear: user.alumniProfile?.batchYear || '',
//       currentCompany: user.alumniProfile?.company || '',
//       jobTitle: user.alumniProfile?.jobTitle || '',
//       profileImage: user.alumniProfile?.photoUrl || null,
//     }));

//     res.json({ users: formattedUsers });
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ error: 'Failed to fetch directory' });
//   }
// });

// // 2. Get Single User Profile (Lock Hata Diya ✅)
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // 👇 FIX: isVerified: true wala check hata diya taaki Admin pending users ko bhi dekh sake
//     const user = await prisma.user.findUnique({
//       where: { 
//         id: id 
//         // isVerified: true  <-- ISSE HATA DIYA 🔓
//       },
//       include: { alumniProfile: true }
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const formattedUser = {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isVerified: user.isVerified, // Ye bhi bhej do taaki frontend par 'Pending' badge dikha sako
//         department: user.alumniProfile?.department || 'N/A',
//         batchYear: user.alumniProfile?.batchYear || '',
//         currentCompany: user.alumniProfile?.company || '',
//         jobTitle: user.alumniProfile?.jobTitle || '',
//         profileImage: user.alumniProfile?.photoUrl || null,
//         linkedinUrl: user.alumniProfile?.linkedinUrl || '',
//         bio: user.alumniProfile?.bio || '',
//         location: user.alumniProfile?.location || '',
//         skills: user.alumniProfile?.skills || [] 
//     };

//     res.json({ user: formattedUser });
//   } catch (error) {
//     console.error('Error fetching single user:', error);
//     res.status(500).json({ error: 'Failed to fetch profile' });
//   }
// });

// module.exports = router;