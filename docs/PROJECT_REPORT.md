# Xavier AlumniConnect — Project Report

## Executive Summary

Xavier AlumniConnect is a comprehensive, production-grade web platform built for St. Xavier's College, Patna. It bridges the gap between current students and alumni through a secure networking ecosystem that includes a real-time encrypted chat system, LinkedIn-style connections, alumni stories, event management, a jobs board, and a powerful admin dashboard. The platform is fully deployed on Vercel (frontend) and Render (backend) with a Neon PostgreSQL database.

---

## Project Objectives

### Primary Goals
- ✅ Secure, role-based alumni registration with admin verification
- ✅ Email OTP verification flow before account activation
- ✅ Intuitive alumni directory with search and filters
- ✅ LinkedIn-style connection request system
- ✅ End-to-end encrypted real-time chat (AES-256-GCM)
- ✅ Alumni Stories feature with admin moderation
- ✅ Event management with audience targeting
- ✅ Jobs board for alumni to post opportunities
- ✅ Role-based access control (Admin / Alumni / Student)
- ✅ CSV export and reporting for admin
- ✅ Fully responsive design across all devices

### Secondary Goals
- ✅ Application-level message encryption (beyond HTTPS)
- ✅ Email notification system via Brevo API
- ✅ Cloudinary-based media storage
- ✅ Anti-sleep mechanism for production server
- ✅ Comprehensive API and project documentation

---

## Technical Architecture

### Backend Architecture

**Runtime & Framework:** Node.js with Express.js
- RESTful API design with layered architecture (Routes → Controllers → Services → Repositories)
- Socket.io for real-time bidirectional communication
- Middleware-based request pipeline with auth, rate-limiting, and validation
- Helmet.js for security headers, CORS configuration

**Database:** PostgreSQL (hosted on Neon DB) with Prisma ORM
- Schema-first database design
- Type-safe database queries
- `npx prisma db push` workflow (no migration files)
- Indexed queries for performance on large datasets

**Authentication:** Custom JWT System
- Stateless JWT tokens (7-day expiry)
- Two-phase registration: Register → Email OTP Verify → Await Admin Approval
- Role-based access control (ADMIN, ALUMNI, STUDENT)
- Bcrypt password hashing (12 salt rounds)
- Password reset via time-limited email token

**Real-Time Engine:** Socket.io
- Connection-gated chat rooms (`conv:<conversationId>`)
- Online presence tracking via in-memory `Map<userId, socketId>`
- Real-time: message delivery, seen receipts, typing indicators, online/offline events
- Socket authentication via dedicated `socketAuth` middleware

**Security Features:**
- AES-256-GCM application-level encryption for all stored chat messages
- Rate limiting (Auth: 5/min, Chat: 60/min, General: 100/15min)
- Input validation using express-validator and Zod
- SQL injection prevention via Prisma ORM parameterized queries
- XSS protection via Helmet.js
- `trust proxy` configured for Render deployment

---

### Frontend Architecture

**Framework:** Next.js 14 with App Router
- Client-side rendering where needed, server components for static content
- Custom `AuthContext` with JWT stored in cookies via `js-cookie`
- Axios interceptor for automatic URL rewriting (localhost → production URL)

**UI & Styling:** Tailwind CSS
- Utility-first, fully custom components — no shadcn, no framer-motion
- Lucide React for iconography
- Mobile-first responsive design with `sm:`, `md:`, `lg:` breakpoints
- CSS `@keyframes` for animations

**State Management:**
- React Context API for global auth state
- React `useState` / `useEffect` for local page state
- `useChatSocket` custom hook for Socket.io event management

---

## Database Design

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│    Users     │────<│  AlumniProfiles  │     │  ConnectionRequests  │
├──────────────┤     ├──────────────────┤     ├──────────────────────┤
│ id (PK)      │     │ id (PK)          │     │ id (PK)              │
│ name         │     │ userId (FK)      │     │ senderId (FK)        │
│ email        │     │ batchYear        │     │ receiverId (FK)      │
│ passwordHash │     │ department       │     │ status               │
│ role         │     │ rollNo           │     └──────────────────────┘
│ rollNo       │     │ company          │
│ isVerified   │     │ jobTitle         │     ┌──────────────────────┐
│ emailVerified│     │ linkedinUrl      │     │  UserConnections     │
│ emailOtp     │     │ photoUrl         │     ├──────────────────────┤
│ status       │     │ bio              │     │ userId (FK)          │
│ createdAt    │     │ location         │     │ connectionId (FK)    │
└──────────────┘     │ skills[]         │     │ createdAt            │
                     │ contactPublic    │     └──────────────────────┘
                     └──────────────────┘

┌──────────────┐     ┌─────────────────────┐     ┌─────────────┐
│ Conversation │────<│ ConversationMember  │     │   Message   │
├──────────────┤     ├─────────────────────┤     ├─────────────┤
│ id (PK)      │     │ id (PK)             │     │ id (PK)     │
│ createdAt    │     │ conversationId (FK) │     │ convId (FK) │
│ updatedAt    │     │ userId (FK)         │     │ senderId    │
└──────────────┘     │ joinedAt            │     │ content*    │
                     └─────────────────────┘     │ isSeen      │
                                                  │ isDeleted   │
                                                  └─────────────┘
                                        * AES-256-GCM encrypted at rest

┌───────────┐     ┌────────────────────┐     ┌─────────────┐
│  Events   │────<│ EventRegistration  │     │   Stories   │
├───────────┤     ├────────────────────┤     ├─────────────┤
│ id (PK)   │     │ userId (FK)        │     │ id (PK)     │
│ title     │     │ eventId (FK)       │     │ title       │
│ date      │     └────────────────────┘     │ content     │
│ location  │                                │ status      │
│ imageUrl  │     ┌─────────┐               │ authorId    │
│ audience  │     │  Jobs   │               └─────────────┘
│ postedById│     └─────────┘
└───────────┘
```

### Enums
- `Role`: ADMIN, ALUMNI, STUDENT
- `UserStatus`: UNVERIFIED, PENDING, APPROVED, REJECTED
- `ConnectionStatus`: PENDING, ACCEPTED, REJECTED
- `StoryStatus`: PENDING, APPROVED, REJECTED

---

## Features Implementation

### 1. Two-Phase Registration & Email OTP

**Flow:**
1. User submits registration form (name, email, password, rollNo, batchYear, department, role, photo)
2. OTP generated and sent via **Brevo API** to registered email
3. User verifies OTP on `/verify-email` page → `emailVerified = true`
4. Account enters `PENDING` status (admin approval required)
5. Admin approves → `isVerified = true`, welcome email sent
6. Admin rejects → all linked data deleted (cascade), rejection email sent

**Technical:**
- `emailOtp` and `emailOtpExpiry` fields on User model
- Brevo SMTP API for transactional email
- Roll number format validated: regex `[A-Z]+[0-9]{7}` (e.g., `BCA2023001`)
- Dynamic role lock: if batch year ≤ 3 years ago, role auto-set to STUDENT

---

### 2. LinkedIn-Style Connection System

**Flow:**
- User A sends request → User B receives notification
- User B accepts → `UserConnection` rows inserted bidirectionally (A→B and B→A)
- Only connected users can initiate chat

**Endpoints:** send, accept, reject, cancel, disconnect, status, my-connections, pending, sent, mutual

**Technical:**
- Bidirectional adjacency list pattern in `UserConnection` model
- Both rows always inserted in a single transaction on accept
- Connection check enforced at both REST (create-conversation) and Socket.io layer (joinConversation)

---

### 3. Real-Time Encrypted Chat

**Security (AES-256-GCM):**
- Every message is encrypted **before** Prisma saves it to PostgreSQL
- Storage format: `<ivHex>:<ciphertextHex>:<authTagHex>` (colon-delimited)
- Fresh 16-byte IV generated per message (probabilistic encryption)
- GCM auth tag provides tamper detection — any modification detected on decrypt
- `MESSAGE_SECRET_KEY` = exactly 64 hex chars (256-bit key) — validated at server startup; misconfiguration crashes the process intentionally
- Backward-compatible: `isEncrypted()` heuristic handles legacy plaintext messages

**Real-Time Features:**
- WhatsApp-style UI: message bubbles, timestamps, read receipts (double ticks)
- Online/offline presence indicators
- Typing indicator (debounced)
- Soft-delete: "This message was deleted" placeholder
- Infinite scroll with cursor-based pagination (older messages on scroll up)

**Socket Events:**
- Client → Server: `joinConversation`, `sendMessage`, `markSeen`, `typing`
- Server → Client: `newMessage`, `messageSeen`, `userTyping`, `userOnline`, `userOffline`, `messageDeleted`, `error`

---

### 4. Alumni Stories

**Flow:**
1. Any logged-in user submits a story (title ≤ 100 chars, content ≤ 2000 chars)
2. Story enters `PENDING` state
3. Admin reviews in the admin panel → Approve or Reject
4. Approved stories appear on the public `/stories` page
5. Author or admin can delete at any time

**Components:** `StoriesFeed`, `StoryForm`, `SeeMoreButton`

---

### 5. Alumni Directory

**Search & Filters:** name/company full-text search, batch year, department, role (Alumni/Student)

**UI:** Card grid with glassmorphism design, hover animations, protected actions (login required to view profile or email)

**Technical:** Prisma `contains` + `mode: 'insensitive'` for case-insensitive search; pagination via `skip` + `take`

---

### 6. Event Management

- Admin creates events with banner image (Cloudinary), title, description, date, location
- `targetAudience`: ALL / ALUMNI / STUDENT — backend filters events by user role
- Verified users can register; duplicate registration blocked via `@@unique([userId, eventId])`
- Participants list accessible at `/events/:id/participants`

---

### 7. Jobs Board

- Alumni and Admins can post job/internship listings
- Students can view and apply via external link
- Only job owner or Admin can delete listings
- Job cards show poster's profile link

---

### 8. Admin Dashboard

**Tabs:**
- **Overview** — Total users, alumni, students, events, pending verifications
- **Pending** — Review registration requests with Roll No + Department + Batch details; one-click Approve/Reject with email notification
- **Users** — Paginated, searchable, filterable table of all users with verification status
- **Reports** — CSV export with filters (batch year, department, role type)

**Export columns (Alumni):** Name, Roll No, Dept, Batch, Location, Current Work, Company, Email, Role

---

## Security Implementation

| Layer | Implementation |
|-------|---------------|
| Passwords | bcrypt, 12 salt rounds |
| Authentication | JWT, 7-day expiry |
| Message storage | AES-256-GCM, unique IV per message |
| Transport | HTTPS (Render/Vercel enforce TLS) |
| Input validation | express-validator + Zod |
| SQL injection | Prevented by Prisma ORM |
| XSS | Helmet.js headers |
| Rate limiting | Per-route limits (express-rate-limit) |
| File uploads | Images only, 5MB max, Cloudinary storage |
| Proxy trust | `app.set('trust proxy', 1)` for Render |

---

## Deployment Architecture

```
User Browser
     │
     ├──[HTTPS]──► Vercel (Next.js Frontend)
     │                   │
     │                   └──[HTTPS / WSS]──► Render (Express + Socket.io)
     │                                              │
     │                                              ├──► Neon DB (PostgreSQL)
     │                                              ├──► Cloudinary (Images)
     │                                              └──► Brevo (Email)
     │
     └── cron-job.org ──[GET /ping every 5 min]──► Render (anti-sleep)
```

**Environment Variables (Render Backend):**
```
DATABASE_URL          ← Neon PostgreSQL connection string
JWT_SECRET            ← Random string, min 32 chars
MESSAGE_SECRET_KEY    ← Exactly 64 hex chars (32 bytes)
BREVO_API_KEY         ← Brevo transactional email key
EMAIL_USER            ← Verified sender email
FRONTEND_URL          ← Vercel deployment URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

## Performance Optimizations

- **Database:** Prisma indexes on `conversationId + createdAt` (messages), `userId`, `connectionId`
- **Pagination:** Cursor-based pagination for chat; offset pagination for directory/admin
- **Images:** Cloudinary auto-resize (500×500 limit), lazy loading on frontend
- **Debouncing:** Search inputs and typing indicator debounced
- **Anti-sleep:** cron-job.org pings `/ping` every 5 minutes (Render free tier)
- **Rate limiting:** Per-route limits prevent abuse without blocking legitimate traffic

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS, Lucide React |
| Backend | Node.js, Express.js, Socket.io |
| Database | PostgreSQL (Neon DB), Prisma ORM |
| Auth | JWT, bcryptjs |
| Encryption | Node.js `crypto` — AES-256-GCM |
| Email | Brevo API (Sendinblue) |
| Media | Cloudinary |
| Validation | express-validator, Zod |
| Deployment | Vercel (FE) + Render (BE) |
| DevOps | cron-job.org (keep-alive) |

---

## Project Timeline

### Phase 1 — Core Platform ✅
- Database design and Prisma schema
- JWT authentication + role-based access
- Alumni registration and admin verification
- Alumni directory with search/filters
- Event management system
- Jobs board
- Admin dashboard with CSV export

### Phase 2 — Networking & Communication ✅
- LinkedIn-style connection request system
- Real-time Socket.io chat infrastructure
- AES-256-GCM end-to-end message encryption
- WhatsApp-style chat UI with presence, typing, read receipts
- Alumni Stories with admin moderation

### Phase 3 — Production Hardening ✅
- Email OTP verification flow
- Brevo transactional email (approve/reject/reset/confirm)
- Cloudinary media storage
- Render + Vercel deployment
- Anti-sleep cron job
- Proxy trust configuration

### Phase 4 — Future Enhancements 📋
- AI-powered alumni suggestions and mentorship matching
- Mobile application (React Native)
- Push notifications
- Donation management module
- Multi-language support

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Server spin-down on free tier | cron-job.org pings `/ping` every 5 min |
| Encryption key misconfiguration | Server crashes on startup if key invalid |
| Stale Prisma client on Render | `postinstall: prisma generate` in package.json |
| Foreign key constraint on delete | Admin reject flow cascades all related data first |
| Chat without connection | Socket.io enforces connection check before `joinConversation` |

---

## Conclusion

Xavier AlumniConnect has been successfully built as a full-featured, production-deployed platform that goes significantly beyond a basic alumni management system. The inclusion of AES-256-GCM encrypted real-time chat, a LinkedIn-style connection system, and a comprehensive admin panel makes it a genuinely useful professional networking tool for St. Xavier's College, Patna.

The layered backend architecture (Routes → Controllers → Services → Repositories) ensures maintainability, while the Prisma ORM and indexed database schema ensure the platform can scale to thousands of users without performance degradation.

---

**Project Status:** ✅ **PRODUCTION DEPLOYED**
**Platform:** St. Xavier's College, Patna
**Frontend:** Vercel · **Backend:** Render · **Database:** Neon DB
**Security:** AES-256-GCM Chat Encryption · JWT Auth · Brevo Email Notifications


*Built with ❤️ for the Xavier alumni community*