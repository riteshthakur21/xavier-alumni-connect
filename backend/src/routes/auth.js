const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const router = express.Router();
const prisma = new PrismaClient();

const generateEmailOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const buildEmailOtpTemplate = (otpCode, recipientName = 'Member') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Xavier AlumniConnect account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4efe6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1410;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4efe6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid rgba(26, 20, 16, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(26, 20, 16, 0.04);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid rgba(26, 20, 16, 0.08); background-color: #ffffff;">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #c4821a; font-weight: 600; margin-bottom: 4px;">
                Portal Authentication
              </div>
              <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: normal; color: #1a1410; letter-spacing: -0.5px;">
                Xavier AlumniConnect
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="font-size: 16px; font-weight: 600; color: #1a1410; margin-top: 0; margin-bottom: 12px; font-family: Georgia, serif;">
                Hello ${recipientName},
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #5c4d37; margin: 0 0 24px 0;">
                Welcome to <strong>Xavier AlumniConnect</strong> for St. Xavier&apos;s College, Patna. To verify your email address and continue registration, please enter the security verification code below:
              </p>

              <!-- OTP Code Display -->
              <div style="text-align: center; margin: 28px 0;">
                <div style="display: inline-block; letter-spacing: 10px; font-size: 32px; font-family: 'Courier New', Courier, monospace; font-weight: 700; color: #1a1410; background-color: #fdf8ed; border: 1px solid #c4821a; border-radius: 12px; padding: 14px 28px; box-shadow: 0 2px 8px rgba(196, 130, 26, 0.12);">
                  ${otpCode}
                </div>
                <div style="font-size: 11px; font-family: 'Courier New', monospace; color: #7d6a4f; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px;">
                  Valid for 10 minutes
                </div>
              </div>

              <div style="background-color: #fcfbf9; border-left: 3px solid #c4821a; padding: 12px 16px; border-radius: 6px; margin-top: 24px;">
                <p style="font-size: 12px; line-height: 1.5; color: #7d6a4f; margin: 0;">
                  <strong>Security Note:</strong> If you did not initiate this request, please ignore this email. Never share your verification code with anyone.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #fcfbf9; border-top: 1px solid rgba(26, 20, 16, 0.08); text-align: center;">
              <p style="font-size: 12px; color: #7d6a4f; margin: 0 0 4px 0; font-family: Georgia, serif;">
                St. Xavier&apos;s College, Patna
              </p>
              <p style="font-size: 11px; color: #a08c6e; margin: 0; font-family: 'Courier New', monospace;">
                &copy; ${new Date().getFullYear()} Xavier AlumniConnect &middot; All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP resend requests. Please try again later.' }
});

router.post('/send-otp', async (req, res) => {
  try {
    const { name, email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    await prisma.emailOtp.deleteMany({
      where: { email: normalizedEmail }
    });

    const otp = generateEmailOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        email: normalizedEmail,
        otp,
        name,
        expiresAt
      }
    });

    await sendEmail({
      email: normalizedEmail,
      subject: 'Verify your Xavier AlumniConnect account',
      message: buildEmailOtpTemplate(otp, name)
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const otpRecord = await prisma.emailOtp.findFirst({
      where: { email: normalizedEmail }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    await prisma.emailOtp.deleteMany({
      where: { email: normalizedEmail }
    });

    const verifiedToken = jwt.sign(
      { email: normalizedEmail, name: otpRecord.name, emailVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      success: true,
      verifiedToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'OTP verification failed' });
  }
});

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

    const {
      name,
      email,
      password,
      role,
      batchYear,
      department,
      rollNo,
      company,
      jobTitle,
      linkedinUrl,
      bio,
      verifiedToken,
      googleId
    } = req.body;

    if (verifiedToken) {
      try {
        const decoded = jwt.verify(verifiedToken, process.env.JWT_SECRET);
        if (!decoded?.emailVerified) {
          return res.status(400).json({ error: 'Email verification required' });
        }
        if (decoded.email !== email) {
          return res.status(400).json({ error: 'Email does not match verified token' });
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid or expired verified token' });
      }
    } else if (!googleId) {
      return res.status(400).json({ error: 'Email verification required' });
    }

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

        isVerified: true,
        emailVerified: true,
        status: 'PENDING',
        googleId: googleId || undefined
      }
    });

    // Create alumni profile
    const photoUrl = req.file ? req.file.path : null;

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

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Your account is pending admin approval.',
      email: user.email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    if (user.emailOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (!user.emailOtpExpiry || user.emailOtpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP expired. Please register again or request a new OTP' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        status: 'PENDING',
        emailOtp: null,
        emailOtpExpiry: null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified! Your account is pending admin approval.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ error: 'Email verification failed' });
  }
});

router.post('/resend-otp', resendOtpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const emailOtp = generateEmailOtp();
    const emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailOtp, emailOtpExpiry }
    });

    await sendEmail({
      email: user.email,
      subject: 'Verify your Xavier AlumniConnect account',
      message: buildEmailOtpTemplate(emailOtp, user.name)
    });

    return res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Failed to resend OTP' });
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

    // Block non-admin users whose account is not yet approved
    if (user.role !== 'ADMIN') {
      if (!user.emailVerified) {
        return res.status(403).json({
          error: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email first.',
          email: user.email
        });
      }
      if (user.status === 'PENDING' || !user.isVerified) {
        return res.status(403).json({
          error: 'Your account is pending admin approval. Please wait until an admin verifies your profile.',
          code: 'PENDING_APPROVAL'
        });
      }
      if (user.status === 'REJECTED') {
        return res.status(403).json({
          error: 'Your account registration was rejected. Please contact the admin or try registering again.',
          code: 'REJECTED'
        });
      }
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

    // Academic Heritage Styled HTML Message
    const message = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4efe6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1410;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4efe6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid rgba(26, 20, 16, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(26, 20, 16, 0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid rgba(26, 20, 16, 0.08); background-color: #ffffff;">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #c4821a; font-weight: 600; margin-bottom: 4px;">
                Account Security
              </div>
              <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: normal; color: #1a1410; letter-spacing: -0.5px;">
                Xavier AlumniConnect
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="font-size: 16px; font-weight: 600; color: #1a1410; margin-top: 0; margin-bottom: 12px; font-family: Georgia, serif;">
                Password Reset Request
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #5c4d37; margin: 0 0 24px 0;">
                We received a request to reset the password for your <strong>Xavier AlumniConnect</strong> account. Click the button below to choose a new password:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background-color: #1a1410; color: #f4efe6; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border: 1px solid #3d3222; box-shadow: 0 2px 8px rgba(26, 20, 16, 0.12);">
                  Reset Your Password &rarr;
                </a>
              </div>

              <div style="background-color: #fcfbf9; border-left: 3px solid #c4821a; padding: 12px 16px; border-radius: 6px; margin-top: 24px;">
                <p style="font-size: 12px; line-height: 1.5; color: #7d6a4f; margin: 0;">
                  <strong>Note:</strong> This link is valid for <strong>1 hour</strong> only. If you did not request this change, you can safely ignore this email; your account credentials remain unchanged.
                </p>
              </div>

              <p style="font-size: 11px; line-height: 1.4; color: #a08c6e; margin-top: 20px; margin-bottom: 0; word-break: break-all;">
                If the button above does not work, copy and paste this link into your browser:<br />
                <a href="${resetUrl}" style="color: #c4821a; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #fcfbf9; border-top: 1px solid rgba(26, 20, 16, 0.08); text-align: center;">
              <p style="font-size: 12px; color: #7d6a4f; margin: 0 0 4px 0; font-family: Georgia, serif;">
                St. Xavier&apos;s College, Patna
              </p>
              <p style="font-size: 11px; color: #a08c6e; margin: 0; font-family: 'Courier New', monospace;">
                &copy; ${new Date().getFullYear()} Xavier AlumniConnect &middot; All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    // Email bhej do!
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request · Xavier AlumniConnect',
      message,
    });

    res.json({ message: 'Reset link sent to your email.' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Email not sent. Please check server configuration.' });
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
      return res.status(400).json({ error: 'Invalid or expired token.' });
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

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

    // --- 🛡️ SUCCESS EMAIL TEMPLATE ---
    const successMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Successfully</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4efe6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1410;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4efe6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid rgba(26, 20, 16, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(26, 20, 16, 0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid rgba(26, 20, 16, 0.08); background-color: #ffffff;">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #3a5c3e; font-weight: 600; margin-bottom: 4px;">
                Security Confirmation
              </div>
              <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: normal; color: #1a1410; letter-spacing: -0.5px;">
                Xavier AlumniConnect
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 36px;">
              <div style="background-color: #f3f7f4; border: 1px solid rgba(58, 92, 62, 0.25); border-left: 4px solid #3a5c3e; border-radius: 8px; padding: 16px; margin: 0 0 20px 0;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #2d4530; font-family: Georgia, serif;">
                  Password Changed Successfully
                </p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #3d5c41; line-height: 1.5;">
                  The password for your account has been updated securely.
                </p>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #5c4d37; margin: 0 0 24px 0;">
                You can now use your new password to sign in to the Xavier AlumniConnect portal:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${loginUrl}" style="background-color: #1a1410; color: #f4efe6; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border: 1px solid #3d3222; box-shadow: 0 2px 8px rgba(26, 20, 16, 0.12);">
                  Sign In to Your Account &rarr;
                </a>
              </div>

              <div style="background-color: #fcfbf9; border: 1px solid rgba(26, 20, 16, 0.08); padding: 12px 16px; border-radius: 6px; margin-top: 24px;">
                <p style="font-size: 12px; line-height: 1.5; color: #7d6a4f; margin: 0;">
                  <strong>Security Advisory:</strong> If you did not make this change, please contact the alumni administrator immediately to protect your profile.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #fcfbf9; border-top: 1px solid rgba(26, 20, 16, 0.08); text-align: center;">
              <p style="font-size: 12px; color: #7d6a4f; margin: 0 0 4px 0; font-family: Georgia, serif;">
                St. Xavier&apos;s College, Patna
              </p>
              <p style="font-size: 11px; color: #a08c6e; margin: 0; font-family: 'Courier New', monospace;">
                &copy; ${new Date().getFullYear()} Xavier AlumniConnect &middot; Security first.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
