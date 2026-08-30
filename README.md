# 🎓 Xavier AlumniConnect

<div align="center">

![Xavier AlumniConnect Logo](frontend/public/xavier-logo.png)

### **Next-Generation Alumni Networking & Career Platform**
*Dedicated to the students, graduates, and faculty of St. Xavier's College, Patna*

[![Next.js](https://img.shields.io/badge/Next.js-14.0.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.1-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-010101?style=flat-square&logo=socket.io)](https://socket.io/)

</div>

---

## 🏛️ Project Overview

**Xavier AlumniConnect** is a full-stack, production-grade alumni networking ecosystem. Built specifically for collegiate institutions, it bridges the divide between active students and global alumni across industries through verified connections, encrypted 1:1 real-time messaging, community reflections, job referrals, events, and administrative moderation.

### 👥 Target Audiences & Permissions
- **🎓 Students:** Discover verified seniors in top global organizations, request 1:1 mentorship connections, register for alumni masterclasses, read career journeys, and participate in encrypted direct chats.
- **💼 Alumni:** Expand professional networks, recruit campus talent, post job and internship openings, share alumni stories, and mentor upcoming batches.
- **🛡️ Administrators:** Moderate registrations, approve/reject alumni applications, verify student rolls, moderate community stories, view demographic analytics, and generate filtered CSV reports.

---

## 📸 Application Interface & Experience

### 1. Interactive Editorial Split-Stage Homepage
*Living constellation node canvas, verified network badges, 60fps spotlight carousel, and community metrics panel.*

<div align="center">
  <img src="frontend/public/Images/Screenshot 2026-08-27 220458.png" alt="Xavier AlumniConnect Hero Section" width="100%" />
</div>

---

### 2. Dual-Panel Authentication Portal
*Secure registration and sign-in with 2-step verification, warm parchment editorial panels, and institutional trust signals.*

<div align="center">
  <img src="frontend/public/Images/Screenshot 2026-08-27 220534.png" alt="Xavier AlumniConnect Authentication Portal" width="100%" />
</div>

---

### 3. Alumni Stories & Member Profile Spotlights
*Long-form narrative publishing, class year distinctions, verified member badges, and smooth modal-driven interactions.*

<div align="center">
  <img src="frontend/public/Images/Screenshot 2026-08-27 220634.png" alt="Xavier AlumniConnect Story Article" width="100%" />
</div>

---

### 4. Editorial Error & Uncharted Route States
*Warm linen 404 experience with curated quick-jump portals and institutional aesthetics.*

<div align="center">
  <img src="frontend/public/Images/Screenshot 2026-08-27 220857.png" alt="Xavier AlumniConnect 404 Page" width="100%" />
</div>

---

## 🎨 Design System: Academic Heritage & Editorial Walnut

The application follows an institutional **Academic Heritage & Editorial Walnut** design language:

| Design Token | Value | Semantic Role |
|---|---|---|
| **Linen Canvas** | `#f4efe6` / `#fbf9f5` | Warm, non-sterile paper surface background |
| **Parchment Surface** | `#e8dfd0` | Secondary card accents and interactive chip fills |
| **Espresso Ink** | `#1a1410` | Primary display headlines, high-contrast buttons, and rules |
| **Warm Umber** | `#5c4d37` / `#7d6a4f` | Secondary body text, timestamps, and mono labels |
| **Heritage Gold** | `#c4821a` / `#e8a93c` | Active highlights, focus rings, and verified status marks |
| **Academic Moss** | `#3a5c3e` | Alumni badges and verified account indicators |

### ✒️ Typography
- **Headings & Display:** Cormorant Garamond / Classical Serif (`font-serif`)
- **Body & Controls:** Inter / DM Sans (`font-sans`)
- **Metadata & Badges:** JetBrains Mono / IBM Plex Mono (`font-mono`)

---

## 🛠️ Full-Stack Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) | React 18, TypeScript, Tailwind CSS |
| **Icons & Micro-interactions** | Lucide React | High-contrast, scalable vector icons |
| **Client State & HTTP** | React Context + Axios | Clean API abstraction & toast feedback (`react-hot-toast`) |
| **Real-Time Client** | Socket.IO Client 4.8.3 | Live websocket room subscription & typing indicators |
| **Backend Runtime** | Node.js + Express 4.18 | RESTful controllers, rate limiting, and security middleware |
| **ORM & Database** | Prisma 5.1.1 + PostgreSQL | Hosted on Neon Serverless Postgres |
| **Encryption Engine** | AES-256-GCM (Cipher) | End-to-end payload encryption for stored chat messages |
| **Email Service** | Brevo REST API | Transactional OTPs, welcome letters, and reset tokens |
| **Asset Storage** | Cloudinary | Secure multi-format image CDN and avatar storage |
| **Deployment** | Vercel (FE) + Render (BE) | Auto-deploy pipelines with 5-minute health cron keep-alive |

---

## 🔐 2-Step Verification & Registration Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as New Student / Alumnus
    participant App as Frontend (Next.js)
    participant API as Backend (Express)
    participant DB as Neon PostgreSQL
    participant Brevo as Brevo SMTP API
    actor Admin as College Administrator

    User->>App: Submits Registration Form
    App->>API: POST /api/auth/register
    API->>DB: Create User (status: UNVERIFIED, emailVerified: false)
    API->>Brevo: Dispatch 6-digit OTP email
    API-->>App: Redirect to /verify-email
    User->>App: Enters 6-digit OTP
    App->>API: POST /api/auth/verify-email
    API->>DB: Update status to PENDING, emailVerified = true
    Note over API,DB: User is now visible in Admin Dashboard
    Admin->>App: Reviews application in Admin Portal
    Admin->>API: POST /api/admin/verify/:id (action: approve)
    API->>DB: Update status to APPROVED, isVerified = true
    API->>Brevo: Dispatch Welcome & Activation Email
    User->>App: Signs in at /login (JWT Token Issued)
```

---

## ✨ Core Platform Modules

| Module | Features & Capabilities |
|---|---|
| **🔐 Auth & Access** | Email OTP verification, admin approval gates, password reset tokens, role-based protection (`ADMIN`, `ALUMNI`, `STUDENT`). |
| **👥 Alumni Directory** | Multi-faceted search by name, department (`BCA`, `BBA`, `BA-JMC`), batch year (`2009–2026`), and company. |
| **🤝 Connection Mesh** | LinkedIn-style invitation system with Pending, Accepted, and Rejected state management. |
| **💬 Encrypted Chat** | AES-256-GCM authenticated message encryption at rest with live typing indicators and socket room management. |
| **📖 Alumni Stories** | Community narrative feed with custom modal confirmation, review workflows, and full article view. |
| **💼 Job Board** | Curated job and internship postings created by verified alumni and administration. |
| **📅 Events & Reunions** | Interactive calendar for campus homecomings, webinars, and RSVP tracking. |
| **🛡️ Admin Suite** | User verification workbench, story moderation queue, and filtered CSV export downloads. |

---

## 🗄️ Database Architecture

### Key Database Models (Prisma)

```prisma
model User {
  id              String         @id @default(uuid())
  name            String
  email           String         @unique
  passwordHash    String
  role            Role           @default(STUDENT) // ADMIN | ALUMNI | STUDENT
  status          UserStatus     @default(UNVERIFIED) // UNVERIFIED | PENDING | APPROVED | REJECTED
  isVerified      Boolean        @default(false)
  emailVerified   Boolean        @default(false)
  emailOtp        String?
  emailOtpExpiry  DateTime?
  rollNo          String?        @unique
  alumniProfile   AlumniProfile?
  stories         Story[]
  jobs            Job[]
  events          Event[]
  createdAt       DateTime       @default(now())
}

model AlumniProfile {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  batchYear     Int
  department    String
  company       String?
  jobTitle      String?
  linkedinUrl   String?
  photoUrl      String?
  bio           String?
  location      String?
  skills        String[]
  contactPublic Boolean  @default(true)
}

model Message {
  id             String   @id @default(uuid())
  conversationId String
  senderId       String
  content        String   // AES-256-GCM Encrypted at rest
  isSeen         Boolean  @default(false)
  isDeleted      Boolean  @default(false)
  createdAt      DateTime @default(now())

  @@index([conversationId, createdAt])
}
```

---

## 📡 API Endpoint Reference

All protected endpoints require the HTTP header: `Authorization: Bearer <JWT_TOKEN>`

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student or alumnus and dispatch OTP
- `POST /api/auth/verify-email` — Verify 6-digit OTP (moves status to `PENDING`)
- `POST /api/auth/resend-otp` — Request fresh OTP (rate-limited)
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Retrieve active session user
- `POST /api/auth/forgot-password` — Send reset password email
- `POST /api/auth/reset-password` — Set new password with reset token

### Alumni Directory (`/api/alumni`)
- `GET /api/alumni` — Filtered alumni list (`department`, `batchYear`, `search`)
- `GET /api/alumni/:id` — Retrieve full profile details
- `PUT /api/alumni/:id` — Update personal profile details
- `POST /api/alumni/upload-photo` — Upload photo to Cloudinary CDN

### Real-time Chat (`/api/chat`)
- `GET /api/chat/conversations` — Retrieve all active chat threads
- `GET /api/chat/messages/:convId` — Retrieve decrypted message history
- `POST /api/chat/messages` — Send encrypted direct message

### Stories & Reflections (`/api/stories`)
- `GET /api/stories` — Retrieve published approved stories
- `GET /api/stories/:id` — Retrieve single story article
- `POST /api/stories` — Submit story for admin review
- `DELETE /api/stories/:id` — Delete story (author or admin only)

### Admin Operations (`/api/admin`)
- `GET /api/admin/pending` — Fetch registrations awaiting approval
- `POST /api/admin/verify/:userId` — Approve or reject pending user
- `GET /api/admin/stats` — Platform demographic & participation metrics
- `GET /api/export/alumni` — Generate filtered CSV export

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **PostgreSQL Database:** Local Postgres or Neon Cloud DB
- **API Keys:** Brevo SMTP & Cloudinary account

### 1. Clone the Repository
```bash
git clone https://github.com/riteshthakur21/xavier-alumni-connect.git
cd xavier-alumni-connect
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env

# Sync schema with database (Do not use prisma migrate in development)
npx prisma db push

# Launch development server
npm run dev
# Server running at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create local environment config
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Launch Next.js dev server
npm run dev
# Application running at http://localhost:3000
```

---

## 🔑 Environment Configuration

### Backend Configuration (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@neon.tech/alumnidb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-token-key"
MESSAGE_SECRET_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" # 64 hex chars
FRONTEND_URL="http://localhost:3000"
BREVO_API_KEY="xkeysib-your-brevo-api-key"
EMAIL_USER="noreply@xaviers.ac.in"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

### Frontend Configuration (`frontend/.env.local`)
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚢 Production Deployment

### Frontend Deployment (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Add Environment Variable: `NEXT_PUBLIC_API_URL=https://<your-render-backend-url>`.
4. Deploy.

### Backend Deployment (Render)
1. Create a **Web Service** on [Render](https://render.com).
2. Set Root Directory to `backend`, Build Command: `npm install`, Start Command: `npm run dev` (or `node src/server.js`).
3. Add all backend environment variables.
4. Set up an automated 5-minute health check at [cron-job.org](https://cron-job.org) targeting `https://<your-render-backend-url>/ping` to prevent instance idling.

---

<div align="center">

**Developed with precision for St. Xavier's College Alumni Community**  
*Built by Ritesh Thakur · Batch of 2024*

</div>
