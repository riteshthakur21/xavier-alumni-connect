// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const path = require('path');
// require('dotenv').config();

// const authRoutes = require('./routes/auth');
// const alumniRoutes = require('./routes/alumni');
// const adminRoutes = require('./routes/admin');
// const eventRoutes = require('./routes/events');
// const reportRoutes = require('./routes/reports');
// const userRoutes = require('./routes/users'); 
// const exportRoutes = require('./routes/export'); // Route import karo
// app.use('/api/export', exportRoutes); // Route use karo

        

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Security middleware
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use('/api/users', userRoutes);  // Routes for user management

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use('/api/', limiter);

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Static file serving
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// // API routes
// app.use('/api/auth', authRoutes);
// app.use('/api/alumni', alumniRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/events', eventRoutes);
// app.use('/api/reports', reportRoutes);
// // Routes section for job postings
// app.use('/api/jobs', require('./routes/jobs'));

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ message: 'Alumni Management System API is running' });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
// });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// 1. Saare Routes Import Karo
const authRoutes = require('./routes/auth');
const alumniRoutes = require('./routes/alumni');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users'); 
const exportRoutes = require('./routes/export'); // New export route

// 2. App Initialization (Ab ye sabse upar hai) 🚀
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Security & Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 4. API Routes (Saare features yahan hain)
app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);  // User management features
app.use('/api/jobs', require('./routes/jobs')); // Job postings feature
app.use('/api/export', exportRoutes); // Naya Export feature 📊

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Alumni Management System API is running' });
});

// 5. Error & 404 Handlers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 6. Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});