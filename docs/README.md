# Alumni Management System

A comprehensive web-based platform for managing alumni relationships, networking, and community engagement.

## 🎓 Project Overview

AlumniConnect is a full-stack application that enables colleges to:
- Maintain comprehensive alumni records
- Manage alumni events and networking opportunities
- Facilitate connections between alumni and students
- Provide administrative oversight and verification
- Generate reports and analytics

## ✨ Key Features

### 🔐 Multi-Role Authentication System
- **Admin**: Full system management and oversight
- **Alumni**: Profile management and networking
- **Students**: Limited access to alumni directory

### 👥 Alumni Management
- Registration with comprehensive profile details
- Admin verification system
- Advanced search and filtering
- Profile management and updates

### 📅 Event Management
- Create and manage alumni events
- Public event listing with registration
- Event categorization and filtering

### 📊 Reports & Analytics
- CSV export functionality
- Batch-wise alumni reports
- Company-based alumni tracking
- Verification status reports

### 🔒 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- API rate limiting
- Role-based access control
- Input validation and sanitization

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Prisma ORM
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Query** for data management

## 📁 Project Structure

```
alumni-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database schema
│   └── uploads/             # File storage
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   └── utils/           # Frontend utilities
│   └── public/              # Static assets
└── docs/                    # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn package manager

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Setup database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

## 🔗 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Alumni Endpoints
- `GET /api/alumni` - List alumni (with search/filter)
- `GET /api/alumni/:id` - Get single alumni profile
- `PUT /api/alumni/:id` - Update alumni profile

### Admin Endpoints
- `GET /api/admin/pending` - Get pending verifications
- `POST /api/admin/verify/:id` - Verify/reject alumni
- `DELETE /api/admin/alumni/:id` - Delete alumni
- `GET /api/admin/stats` - Get system statistics

### Events Endpoints
- `GET /api/events` - List events
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Reports Endpoints
- `GET /api/export/alumni` - Export alumni data (CSV)
- `GET /api/export/batch/:year` - Export batch-specific data
- `GET /api/export/company/:company` - Export company-specific data

## 🎨 User Interface

### Pages
- **Home** - Landing page with features and statistics
- **Login** - Authentication page
- **Register** - Alumni registration form
- **Dashboard** - User dashboard with quick actions
- **Directory** - Alumni search and browsing
- **Profile** - Individual alumni profiles
- **Events** - Event listings and management
- **Admin** - Administrative dashboard

### Design System
- Modern, clean interface with professional aesthetics
- Responsive design for all device sizes
- Consistent color scheme and typography
- Accessible UI components
- Smooth animations and transitions

## 🔐 Security Considerations

- All passwords are hashed using bcrypt with salt rounds
- JWT tokens with 7-day expiration
- Rate limiting on API endpoints
- Input validation on all forms
- File upload restrictions (images only, size limits)
- Role-based access control throughout the application
- CORS configuration for cross-origin requests

## 📊 Database Schema

### Users Table
- id, name, email, passwordHash, role, isVerified, createdAt

### AlumniProfiles Table
- id, userId, batchYear, department, rollNo, company, jobTitle, linkedinUrl, photoUrl, bio, location, skills, contactPublic

### Events Table
- id, title, description, date, location, imageUrl, isActive, createdAt

## 🚀 Deployment

### Backend Deployment
- Support for Railway, Render, Heroku
- Environment variable configuration
- Database migration scripts
- Health check endpoints

### Frontend Deployment
- Optimized for Vercel deployment
- Static generation for performance
- Environment-specific configurations
- CDN integration for assets

## 🔧 Configuration

### Environment Variables
```env
# Backend
PORT=5000
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NODE_ENV="production"
FRONTEND_URL="https://your-frontend-url"

# Frontend
NEXT_PUBLIC_API_URL="https://your-backend-url/api"
```

## 📈 Performance Optimizations

- Database indexing for search queries
- Image optimization and compression
- API response caching
- Frontend code splitting
- Lazy loading for images
- Debounced search inputs

## 🧪 Testing

- Unit tests for API endpoints
- Integration tests for authentication
- Frontend component testing
- End-to-end testing workflows

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Touch-friendly interface elements
- Optimized forms for mobile input
- Responsive image handling
- Progressive web app features

## 🎯 Future Enhancements

- Real-time chat system
- Mentorship matching
- Job posting board
- AI-powered alumni suggestions
- Mobile application
- Advanced analytics dashboard
- Integration with social media platforms
- Email notification system
- Event RSVP management
- Alumni donation tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for the alumni community**