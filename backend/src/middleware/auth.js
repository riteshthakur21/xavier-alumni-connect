const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 1. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 2. SMART CHECK: Dono keys check karo (userId ya id)
    const userId = decoded.userId || decoded.id; 

    if (!userId) {
      console.error("Auth Error: Token payload does not contain userId or id");
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    // 3. Fetch User from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    // 👇 Terminal mein error dikhega ki kyun fail hua (Expired/Wrong Secret)
    console.error("JWT Auth Error:", error.message); 
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const alumniMiddleware = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ALUMNI' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Alumni access required' });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  alumniMiddleware
};