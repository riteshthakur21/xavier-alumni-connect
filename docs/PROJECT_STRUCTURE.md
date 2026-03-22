# Xavier AlumniConnect — Project Structure

## 📁 Complete File Structure

```
xavier-alumni-connect/
│
├── .gitignore
├── setup.sh                                  # Local dev setup script
│
├── backend/                                  # Express.js Backend API
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma                     # Full DB schema (11 models)
│   │   └── migrations/
│   │       ├── 20260214163601_add_target_audience/migration.sql
│   │       └── 20260221160641_add_reset_token/migration.sql
│   │
│   └── src/
│       ├── server.js                         # Express + Socket.io entry point
│       │
│       ├── routes/                           # REST API route definitions
│       │   ├── auth.js                       # Register, login, OTP verify, reset password
│       │   ├── alumni.js                     # Profile CRUD + stats
│       │   ├── admin.js                      # Pending, verify, delete, stats, users list
│       │   ├── chat.routes.js                # Conversations, messages, delete message
│       │   ├── connection.routes.js          # Send, accept, reject, cancel, disconnect, status
│       │   ├── events.js                     # Events CRUD + registration + participants
│       │   ├── jobs.js                       # Jobs board CRUD
│       │   ├── stories.js                    # Alumni stories + admin moderation
│       │   ├── users.js                      # Directory listing
│       │   ├── export.js                     # CSV export with filters (batch, dept, role)
│       │   └── reports.js                    # Reports
│       │
│       ├── controllers/
│       │   ├── chat.controller.js
│       │   └── connection.controller.js
│       │
│       ├── services/
│       │   ├── chat.service.js               # encrypt/decrypt on save/fetch
│       │   └── connection.service.js         # isConnected check
│       │
│       ├── repositories/
│       │   ├── chat.repository.js            # Prisma queries for messages
│       │   └── connection.repository.js      # Prisma queries for connections
│       │
│       ├── socket/
│       │   └── socket.js                     # Socket.io: joinConversation, sendMessage, markSeen, typing, presence
│       │
│       ├── middleware/
│       │   ├── auth.js                       # JWT middleware (REST)
│       │   └── socketAuth.js                 # JWT middleware (Socket.io)
│       │
│       └── utils/
│           ├── encryption.js                 # AES-256-GCM encrypt/decrypt/isEncrypted
│           ├── cloudinary.js                 # Cloudinary + multer-storage-cloudinary
│           ├── email.js                      # Brevo API email sender
│           └── upload.js                     # Local multer config
│
│
├── frontend/                                 # Next.js 14 Frontend
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   │
│   ├── public/
│   │   ├── xavier-logo.png
│   │   └── icons/
│   │       ├── email.png
│   │       ├── instagram.png
│   │       ├── linkedin.png
│   │       └── school.png
│   │
│   └── src/
│       │
│       ├── app/                              # Next.js App Router pages
│       │   ├── layout.tsx                    # Root layout (Navbar + AuthProvider + Toaster)
│       │   ├── globals.css
│       │   ├── icon.png
│       │   │
│       │   ├── page.tsx                      # Home / Landing page
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx             # Smart role lock by batch year
│       │   ├── verify-email/page.tsx         # Email OTP verification
│       │   ├── forgot-password/page.tsx
│       │   ├── reset-password/page.tsx
│       │   │
│       │   ├── dashboard/
│       │   │   ├── page.tsx                  # Stats + connection requests
│       │   │   └── profile/page.tsx          # Edit own profile
│       │   │
│       │   ├── directory/page.tsx            # Alumni directory with filters
│       │   ├── alumni/[id]/page.tsx          # Public alumni profile
│       │   ├── profile/[id]/page.tsx         # Profile with Connect / Chat CTA
│       │   │
│       │   ├── connections/page.tsx          # My connections list
│       │   │
│       │   ├── chat/page.tsx                 # Real-time AES-encrypted chat
│       │   │
│       │   ├── stories/
│       │   │   ├── page.tsx                  # Stories feed
│       │   │   └── [id]/page.tsx             # Single story detail
│       │   │
│       │   ├── events/
│       │   │   ├── page.tsx                  # Events listing + register
│       │   │   ├── create/page.tsx           # Create event (Admin only)
│       │   │   └── [id]/participants/page.tsx
│       │   │
│       │   ├── jobs/
│       │   │   ├── page.tsx
│       │   │   └── create/page.tsx           # Post job (Alumni/Admin only)
│       │   │
│       │   └── admin/page.tsx                # Overview / Pending / Users / Reports
│       │
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── chat/
│       │   │   ├── ChatWindow.tsx            # WhatsApp-style UI: bubbles, ticks, typing
│       │   │   └── ConversationList.tsx
│       │   ├── stories/
│       │   │   ├── StoriesFeed.tsx
│       │   │   ├── StoryForm.tsx
│       │   │   └── SeeMoreButton.tsx
│       │   └── admin/
│       │       └── UsersTab.tsx              # Paginated searchable user table
│       │
│       ├── contexts/
│       │   └── AuthContext.tsx               # Auth state + axios interceptor
│       │
│       ├── hooks/
│       │   └── useChatSocket.ts              # Socket.io custom hook
│       │
│       └── lib/
│           └── socket.ts                     # Socket.io client singleton
│
│
└── docs/
    ├── API.md                                # REST + WebSocket API reference
    ├── PROJECT_REPORT.md                     # Technical architecture report
    └── README.md                             # Setup and deployment guide
```

---

## 🗃️ Database Models

| Model | Purpose |
|-------|---------|
| `User` | Core user — email, passwordHash, role, rollNo, isVerified, emailVerified, emailOtp, status |
| `AlumniProfile` | batchYear, department, company, jobTitle, photoUrl, bio, skills[], contactPublic |
| `Conversation` | 1-to-1 chat room |
| `ConversationMember` | userId ↔ conversationId membership |
| `Message` | content stored **AES-256-GCM encrypted** at rest |
| `ConnectionRequest` | PENDING / ACCEPTED / REJECTED request between users |
| `UserConnection` | Bidirectional accepted connections (A→B + B→A rows) |
| `Story` | PENDING / APPROVED / REJECTED alumni stories |
| `Job` | Job/internship postings by alumni or admin |
| `Event` | targetAudience (ALL / ALUMNI / STUDENT) |
| `EventRegistration` | userId ↔ eventId, unique constraint |

**Enums:** `Role` (ADMIN/ALUMNI/STUDENT) · `UserStatus` (UNVERIFIED/PENDING/APPROVED/REJECTED) · `ConnectionStatus` (PENDING/ACCEPTED/REJECTED) · `StoryStatus` (PENDING/APPROVED/REJECTED)

---

## ✅ Features At-a-Glance

| Feature | Details |
|---------|---------|
| Auth | JWT 7-day, bcrypt 12 rounds, Email OTP verification |
| Registration | Roll No validation `[A-Z]+[0-9]{7}`, smart role lock |
| Admin Panel | Approve/reject with Brevo email, CSV export, user search |
| Directory | Search + batch/dept/role filters, auth-gated actions |
| Connections | 9 endpoints — send/accept/reject/cancel/disconnect/mutual |
| Chat | Socket.io + AES-256-GCM encrypted, presence, typing, read receipts |
| Stories | Submit → Admin review → Public feed |
| Events | Audience filter, registration, participants page |
| Jobs | Post by alumni/admin, delete by owner/admin |
| Email | Brevo API — OTP, approve, reject, password reset |
| Media | Cloudinary — profile photos + event banners |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS, Lucide React |
| Backend | Node.js, Express.js, Socket.io 4.x |
| Database | PostgreSQL (Neon DB) via Prisma ORM |
| Auth | JWT + bcryptjs |
| Encryption | Node.js `crypto` — AES-256-GCM |
| Media | Cloudinary |
| Email | Brevo API |
| Validation | express-validator, Zod |
| Deployment | Vercel (FE) + Render (BE) |
| Keep-alive | cron-job.org → `/ping` every 5 min |

---

## 🔧 Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in values
npx prisma db push
npm run dev             # → http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev             # → http://localhost:3000
```

**Backend `.env` required keys:**
```
DATABASE_URL            # Neon PostgreSQL connection string
JWT_SECRET              # min 32 chars
MESSAGE_SECRET_KEY      # exactly 64 hex chars (256-bit AES key)
BREVO_API_KEY
EMAIL_USER
FRONTEND_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

*Built with ❤️ for St. Xavier's College, Patna*