const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

// ── Encryption key validation (crashes on startup if key is missing/invalid) ──
// Runs before any route or socket handler is registered, so the server never
// starts in a state where messages cannot be encrypted or decrypted.
require('./utils/encryption');

// ── Route imports ──────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/auth');
const alumniRoutes  = require('./routes/alumni');
const adminRoutes   = require('./routes/admin');
const eventRoutes   = require('./routes/events');
const reportRoutes  = require('./routes/reports');
const userRoutes    = require('./routes/users');
const exportRoutes  = require('./routes/export');
const chatRoutes        = require('./routes/chat.routes');       // Real-time chat REST
const connectionRoutes  = require('./routes/connection.routes'); // LinkedIn-style connections

// ── Socket.io layer ────────────────────────────────────────────────────────────
const socketAuthMiddleware      = require('./middleware/socketAuth');
const { registerSocketHandlers } = require('./socket/socket');

// ── App & HTTP server ──────────────────────────────────────────────────────────
const app        = express();
const httpServer = http.createServer(app); // Socket.io must share the HTTP server
const PORT       = process.env.PORT || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.set('trust proxy', 1);

// ── Socket.io server ───────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Graceful ping/pong to detect dead connections
  pingTimeout: 20000,
  pingInterval: 25000,
  // Allow both WebSocket and long-polling transports
  transports: ['websocket', 'polling'],
});

// JWT authentication for every socket connection
io.use(socketAuthMiddleware);

// Register all socket event handlers
registerSocketHandlers(io);

// Expose `io` on app so controllers/services can emit if needed
app.set('io', io);

// ── Express security & global middleware ───────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── REST routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/alumni',  alumniRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/events',  eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/jobs',    require('./routes/jobs'));
app.use('/api/export',  exportRoutes);
app.use('/api/chat',        chatRoutes);        // Chat REST endpoints
app.use('/api/connections', connectionRoutes);   // Connection request system
app.use('/api/stories',     require('./routes/stories')); // Alumni stories

// ── Health / keep-alive ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Alumni Management System API is running' });
});

app.get('/ping', (req, res) => res.status(200).send('Server is awake!'));

// ── Error & 404 handlers ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start ──────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready`);
  console.log(`Message encryption: AES-256-GCM enabled`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});