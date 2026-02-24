const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../utils/upload');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const router = express.Router();
const prisma = new PrismaClient();

// Register validation
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('batchYear').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid batch year required'),
  body('department').trim().isLength({ min: 2 }).withMessage('Department required'),

  // 👇 CHANGE 1: Roll Number Validation added here
  body('rollNo')
    .trim()
    .notEmpty().withMessage('Roll Number is required')
    .matches(/^[A-Z]+[0-9]{7}$/).withMessage('Invalid Roll No! Format should be like BBA2023001'),

  body('company').optional().trim(),
  body('jobTitle').optional().trim(),
  body('linkedinUrl').optional({ checkFalsy: true }).isURL().withMessage('Valid LinkedIn URL required'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters')
];

// Register endpoint
router.post('/register', upload.single('photo'), registerValidation, async (req, res) => {

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, batchYear, department, rollNo, company, jobTitle, linkedinUrl, bio } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role === 'ALUMNI' ? 'ALUMNI' : 'STUDENT',

        // 👇 CHANGE 2: Roll Number ab User table me save hoga
        rollNo: rollNo,

        isVerified: false
      }
    });

    // Create alumni profile
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    await prisma.alumniProfile.create({
      data: {
        userId: user.id,
        batchYear: parseInt(batchYear),
        department,
        rollNo: rollNo,
        company,
        jobTitle,
        linkedinUrl,
        photoUrl,
        bio
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful. Please wait for admin verification.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        alumniProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        alumniProfile: user.alumniProfile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        alumniProfile: true
      }
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        alumniProfile: user.alumniProfile
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "No account found with this email address." });
    }

    // Token aur Expiry generate karo
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 ghante ke liye valid

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry: expiry }
    });
    // 🌐 Frontend URL .env se aayega. Agar nahi mila toh default localhost manega.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Naya secure link
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Sundar HTML Message
    const message = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: auto; color: #334155;">
    <h2 style="color: #2563eb; margin-top: 0;">Xavier AlumniConnect 🎓</h2>
    <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
    <p style="font-size: 16px; line-height: 1.6;">We received a request to reset the password for your account. Please click the button below to set a new password:</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        Reset Password
      </a>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #64748b;">
      <strong>Note:</strong> This link is valid for <b>1 hour</b> only. If you did not request this change, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
    
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">
      &copy; ${new Date().getFullYear()} Xavier AlumniConnect. All rights reserved.
    </p>
  </div>
`;

    // Email bhej do!
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message,
    });

    res.json({ message: 'Reset link sent to your email! 📧' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Email not send. Pls check Server .' });
  }
});

// 2. Reset Password - Set new password & send confirmation
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token! ❌' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Password Update logic
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    // --- 🛡️ SUCCESS EMAIL TEMPLATE ---
    const successMessage = `
      <div style="font-family: sans-serif; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: auto; color: #334155;">
        <h2 style="color: #10b981; margin-top: 0;">Password Changed Successfully! ✅</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.6;">This is a confirmation that the password for your <b>Xavier AlumniConnect</b> account has been successfully changed.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
          <p style="margin: 0; font-size: 14px; color: #475569;">
            <b>Security Alert:</b> If you did not make this change, please contact our support team immediately or secure your account.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Go to Login
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; ${new Date().getFullYear()} Xavier AlumniConnect. Security first.</p>
      </div>
    `;

    // Email bhej do!
    await sendEmail({
      email: user.email,
      subject: 'Security Alert: Password Changed - Xavier AlumniConnect',
      message: successMessage,
    });

    res.json({ message: 'Password updated successfully and confirmation email sent! ✅' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;