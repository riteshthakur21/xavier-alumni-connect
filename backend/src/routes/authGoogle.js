// Google Cloud Console setup required:
// 1. Create project at console.cloud.google.com
// 2. Enable Google+ API / People API
// 3. OAuth 2.0 Credentials → Authorized redirect URIs: http://localhost:5000/api/auth/google/callback
// 4. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect(`${FRONTEND_URL}/auth/google/error?reason=unknown`);
    }

    if (!user) {
      const profile = info?.profile;
      if (!profile?.email) {
        return res.redirect(`${FRONTEND_URL}/auth/google/error?reason=unknown`);
      }

      const params = new URLSearchParams({
        fromGoogle: 'true',
        googleId: profile.googleId || '',
        email: profile.email || '',
        name: profile.name || '',
        picture: profile.picture || '',
      });

      return res.redirect(`${FRONTEND_URL}/register?${params.toString()}`);
    }

    const googleProfile = info?.profile;
    let dbUser = user;
    const shouldUpdateVerification = !user.isVerified;
    const shouldUpdateGoogleId = !user.googleId && googleProfile?.googleId;

    if (shouldUpdateVerification || shouldUpdateGoogleId) {
      dbUser = await prisma.user.update({
        where: { email: user.email },
        data: {
          ...(shouldUpdateVerification ? { isVerified: true } : {}),
          ...(shouldUpdateGoogleId ? { googleId: googleProfile.googleId } : {}),
        },
        include: { alumniProfile: true },
      });
    }

    if (dbUser.status !== 'APPROVED') {
      const reason = dbUser.status === 'REJECTED' ? 'rejected' : 'pending';
      return res.redirect(`${FRONTEND_URL}/auth/google/error?reason=${reason}`);
    }

    const token = jwt.sign(
      { userId: dbUser.id, email: dbUser.email, role: dbUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const encodedUser = Buffer.from(
      JSON.stringify({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        profileImage: dbUser.alumniProfile?.photoUrl || null,
        isVerified: dbUser.isVerified,
        alumniProfile: dbUser.alumniProfile || null,
      })
    ).toString('base64');

    return res.redirect(
      `${FRONTEND_URL}/auth/google/success?token=${encodeURIComponent(token)}&user=${encodeURIComponent(encodedUser)}`
    );
  })(req, res, next);
});

router.post('/google/link', async (req, res) => {
  try {
    const { googleId, email } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'googleId and email are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.googleId && user.googleId !== googleId) {
      return res.status(400).json({ error: 'Google account already linked' });
    }

    const conflict = await prisma.user.findUnique({ where: { googleId } });
    if (conflict && conflict.email !== email) {
      return res.status(400).json({ error: 'Google account already linked to another user' });
    }

    await prisma.user.update({
      where: { email },
      data: { googleId },
    });

    return res.json({ success: true, message: 'Google account linked successfully.' });
  } catch (error) {
    console.error('Google link error:', error);
    return res.status(500).json({ error: 'Failed to link Google account' });
  }
});

module.exports = router;
