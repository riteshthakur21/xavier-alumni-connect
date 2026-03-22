# Xavier AlumniConnect

> **Next-generation alumni networking platform for St. Xavier's College, Patna**  
> Full-stack · Production-ready

---

## 🎓 Project Overview

Xavier AlumniConnect is a full-stack alumni management and networking platform. It supports alumni/student onboarding, admin-driven verification, directory browsing, connections, real-time chat, stories, events, jobs, and CSV exports.

**Target Users:**
- **Students** — Browse alumni directory, join events, request connections, read stories, chat with connected users
- **Alumni** — All student capabilities + job posting and richer career networking
- **Admin** — User verification/rejection, story moderation, stats and CSV export reports

**Current Status:**
- Core platform live on Vercel (frontend) + Render (backend)
- Registration includes **Email OTP Verification** → then **Admin Approval** before login access
- Real-time encrypted chat with connection-gated messaging
- Jobs and events fully implemented
- ⚠️ Some frontend pages still hardcode `http://localhost:5000` — needs `NEXT_PUBLIC_API_URL` migration

---

## 🛠️ Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Frontend | Next.js App Router | `14.0.3`, TypeScript, React 18 |
| Styling | Tailwind CSS | lucide-react, react-hot-toast |
| HTTP Client | Axios | + react-query installed |
| Real-time (client) | socket.io-client | `4.8.3` |
| Backend | Express.js | `4.18.2` |
| ORM | Prisma Client | `5.1.1` |
| Database | PostgreSQL | Neon DB (hosted) |
| Validation | express-validator | + zod |
| Security | helmet, cors | express-rate-limit, bcryptjs, jsonwebtoken |
| Uploads | multer | multer-storage-cloudinary |
| Real-time (server) | Socket.io | Room-based conversations |
| Auth | JWT + RBAC | Roles: `ADMIN`, `ALUMNI`, `STUDENT` |
| Email | Brevo API | `https://api.brevo.com/v3/smtp/email` |
| Storage | Cloudinary | Profile + event images |
| Encryption | AES-256-GCM | `backend/src/utils/encryption.js` |
| Frontend Deploy | Vercel | Auto-deploy from `main` |
| Backend Deploy | Render | + cron-job.org anti-sleep |

---

## 🔐 Authentication & User Flow

```
Register (form)
  → OTP email sent (Brevo)
  → /verify-email (enter 6-digit OTP, 10 min expiry)
  → status: PENDING  ← admin can now see user
  → Admin Approves
  → status: APPROVED + welcome email
  → User can Login ✅
```

**Key rules:**
- `UNVERIFIED` users are **invisible to admin** — appear only after OTP verification
- `emailVerified: false` → login blocked with `EMAIL_NOT_VERIFIED` → redirect to `/verify-email`
- OTP expires in 10 minutes · Resend available (rate limited: max 3 per 15 min)
- JWT issued on login → `Authorization: Bearer <token>`

---

## ✨ Features

| Feature | Status |
|---|---|
| Email OTP Verification on Registration | ✅ Live |
| Admin Verification (Approve / Reject + emails) | ✅ Live |
| LinkedIn-style Connection System | ✅ Live |
| Real-time Encrypted Chat (AES-256-GCM) | ✅ Live |
| Alumni Directory (Search + Filter) | ✅ Live |
| Alumni Stories (Submit → Review → Publish) | ✅ Live |
| Events (Create, Register, Participants list) | ✅ Live |
| Jobs Board (Post + Browse) | ✅ Live |
| Dashboard + Profile Edit + Photo Upload | ✅ Live |
| Admin Analytics + CSV Export | ✅ Live |
| Password Reset via Email | ✅ Live |
| Anti-sleep `/ping` endpoint | ✅ Live |

---

## 🗄️ Database Schema

### Enums
- `Role` — `ADMIN` · `ALUMNI` · `STUDENT`
- `UserStatus` — `UNVERIFIED` → `PENDING` → `APPROVED` | `REJECTED`
- `ConnectionStatus` — `PENDING` · `ACCEPTED` · `REJECTED`
- `StoryStatus` — `PENDING` · `APPROVED` · `REJECTED`

### Key Models

**`User`** (`users` table)
```
id, name, email, passwordHash, role, rollNo (unique)
status          UserStatus  @default(UNVERIFIED)
isVerified      Boolean     @default(false)
emailVerified   Boolean     @default(false)   ← OTP verification
emailOtp        String?                        ← OTP verification
emailOtpExpiry  DateTime?                      ← OTP verification
resetToken, resetTokenExpiry
createdAt, updatedAt
```

**`AlumniProfile`** (`alumni_profiles`)
```
userId (unique), batchYear, department
company?, jobTitle?, linkedinUrl?, photoUrl?, bio?, location?
skills String[], contactPublic (default: true)
```

**`Message`** (`messages`)
```
conversationId, senderId
content  ← AES-256-GCM encrypted at rest
isSeen, isDeleted, createdAt
@@index([conversationId, createdAt])
```

**`ConnectionRequest`** (`connection_requests`)
```
senderId, receiverId, status (default: PENDING)
@@unique([senderId, receiverId])
```

**`UserConnection`** (`user_connections`) — composite PK `[userId, connectionId]`

**`Story`** (`stories`) — `title, content (Text), status (default: PENDING), authorId`

**`Job`** — `title, company, location, type, description, applyLink?, postedById`

**`Event`** — `title, description, date, location?, imageUrl?, targetAudience, isActive, postedById`

**`EventRegistration`** — `@@unique([userId, eventId])`

---

## 📡 API Routes Reference

**Base URL:** `http://localhost:5000/api` (local) · `https://<render-domain>/api` (production)

All protected routes require: `Authorization: Bearer <token>`

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register + create profile + send OTP email |
| POST | `/verify-email` | No | Verify OTP → status becomes `PENDING` |
| POST | `/resend-otp` | No | Resend OTP (max 3 / 15 min per IP) |
| POST | `/login` | No | Login — checks `emailVerified` + `status` |
| GET | `/me` | Yes | Current user from JWT |
| POST | `/forgot-password` | No | Send password reset email |
| POST | `/reset-password` | No | Submit new password via token |

### Alumni — `/api/alumni`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | Directory — search + filter by dept/batch |
| GET | `/:id` | Yes | Single alumni profile |
| PUT | `/:id` | Yes (own) | Update profile |
| POST | `/upload-photo` | Yes | Upload photo to Cloudinary |
| GET | `/stats/overview` | Yes | groupBy stats (dept, batch, company) |

### Connections — `/api/connections`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/request` | Yes | Send connection request |
| PUT | `/:id/respond` | Yes | Accept or reject request |
| GET | `/` | Yes | All connections + pending requests |
| GET | `/status/:userId` | Yes | Check connection status with a user |

### Chat — `/api/chat`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/conversations` | Yes | All conversations |
| GET | `/messages/:convId` | Yes | Paginated messages (auto-decrypted) |
| POST | `/messages` | Yes | Send message (encrypted before DB save) |
| DELETE | `/messages/:id` | Yes | Soft delete message |

**Socket events:** `joinConversation` · `sendMessage` · `typing` · `messageSeen` · `deleteMessage`

### Stories — `/api/stories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Public approved stories |
| GET | `/:id` | No | Story detail |
| POST | `/` | Yes | Submit story (status: `PENDING`) |
| GET | `/pending` | Admin | Stories awaiting review |
| PUT | `/:id/approve` | Admin | Approve story |
| PUT | `/:id/reject` | Admin | Reject story |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/pending-users` | Admin | Only `PENDING` users (never `UNVERIFIED`) |
| PUT | `/approve/:id` | Admin | Approve → welcome email sent |
| DELETE | `/reject/:id` | Admin | Delete user + all linked data → rejection email |
| GET | `/stats` | Admin | Analytics by dept/batch/company |

### Other Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/ping` | No | Health check — pinged every 5 min by cron-job.org |
| GET | `/events` | Yes | Events listing |
| POST | `/events` | Admin | Create event with image upload |
| GET | `/events/:id/participants` | Yes | Participants list + filters |
| GET | `/jobs` | Yes | Jobs board |
| POST | `/jobs` | Alumni/Admin | Post a job |
| GET | `/export/alumni` | Admin | CSV export with filters |

---

## 📁 Frontend Pages

| Route | Auth | Description |
|---|---|---|
| `/` | No | Landing page — hero, stories preview, CTA |
| `/register` | No | Registration form → redirects to `/verify-email` on success |
| `/verify-email` | No | 6-box OTP input + resend + countdown timer |
| `/login` | No | Login + `EMAIL_NOT_VERIFIED` handling + verified banner |
| `/forgot-password` | No | Password reset request |
| `/reset-password` | No | New password via reset token |
| `/dashboard` | Yes | Stats, quick actions, connection request inbox |
| `/dashboard/profile` | Yes | Profile edit — photo, skills, privacy toggle |
| `/directory` | Yes | Alumni directory — search, filter, connect actions |
| `/alumni/[id]` | Yes | Alumni profile — connect/chat actions |
| `/profile/[id]` | Yes | Profile variant — connect/chat actions |
| `/connections` | Yes | My Connections page |
| `/chat` | Yes | Real-time encrypted chat UI |
| `/stories` | Yes | Stories feed + submission form |
| `/stories/[id]` | Yes | Story detail + author profile navigation |
| `/stories/new` | Yes | New story submission |
| `/events` | Yes | Events listing + registration |
| `/events/create` | Admin | Create new event |
| `/events/[id]/participants` | Yes | Participants list |
| `/jobs` | Yes | Jobs board |
| `/jobs/create` | Alumni/Admin | Post a job (students are redirected out) |
| `/admin` | Admin only | Pending users, stories moderation, CSV export |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL connection string (Neon DB recommended)
- Brevo account + API key
- Cloudinary account

### 1. Clone
```bash
git clone https://github.com/riteshthakur21/xavier-alumni-connect.git
cd xavier-alumni-connect
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # fill all required values
npx prisma db push      # DO NOT use prisma migrate
npm run dev             # → http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# create .env.local and set NEXT_PUBLIC_API_URL
npm run dev             # → http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | JWT signing key |
| `MESSAGE_SECRET_KEY` | ✅ | **Exactly 64 hex chars** — AES-256-GCM chat encryption |
| `FRONTEND_URL` | ✅ | CORS origin + links in emails |
| `BREVO_API_KEY` | ✅ | Brevo API key for sending emails |
| `EMAIL_USER` | ✅ | Verified sender email in Brevo |
| `CLOUDINARY_CLOUD_NAME` | ✅ | |
| `CLOUDINARY_API_KEY` | ✅ | |
| `CLOUDINARY_API_SECRET` | ✅ | |
| `PORT` | No | Default: 5000 |
| `NODE_ENV` | No | Set `production` on Render |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL — used by ALL pages + socket layer |

---

## 🚢 Deployment

### Vercel (Frontend)
1. Connect GitHub repo → root directory: `frontend`
2. Add env var: `NEXT_PUBLIC_API_URL=https://<your-render-domain>`
3. Push to `main` → auto-deploys in ~2-3 min

### Render (Backend)
1. New Web Service → root: `backend` → start command: `npm run dev`
2. Add all backend env variables in Render dashboard
3. Push to `main` → auto-deploys in ~5-10 min

> `app.set('trust proxy', 1)` is already set in `server.js` — required for `express-rate-limit` behind Render's reverse proxy.

### Anti-sleep Cron Job
Set up [cron-job.org](https://cron-job.org) to ping `https://<render-domain>/ping` every **5 minutes** — prevents Render free tier from spinning down.

---

## ⚠️ Known Issues & Developer Notes

| Issue | Cause | Fix |
|---|---|---|
| Email not sent after `.env` change | Nodemon doesn't watch `.env` files | `Ctrl+C` → restart server manually |
| Prisma `groupBy` crash | Invalid `orderBy: { _count: 'desc' }` syntax | Use `orderBy: { _count: { department: 'desc' } }` |
| Foreign key error on user delete | Linked records exist in other tables | Always use Admin Dashboard delete — backend clears linked tables first |
| `express-rate-limit` error on Render | Reverse proxy changes IP headers | `app.set('trust proxy', 1)` at top of `server.js` ✅ already done |
| Chat crashes on deploy | `MESSAGE_SECRET_KEY` missing on Render | Add exactly 64 hex chars to Render env vars |
| Some pages call `localhost:5000` | Hardcoded URLs in frontend pages | Migrate to `process.env.NEXT_PUBLIC_API_URL` |
| Copilot CLI fails on Windows | PowerShell 6+ not available | Use PowerShell 7 (Core) or run commands manually in CMD |

---

## 🌿 Git Workflow

```bash
# New feature or fix
git checkout -b feature/<topic>

# Commit and push
git add .
git commit -m "feat: describe what was added"
git push origin feature/<topic>
# → open PR → merge to main → Vercel + Render auto-deploy
```

**Branch convention:** `feature/<n>` · `fix/<n>` · `docs/<n>`

---

## 🎨 Design System

- **Colors:** Navy `#09192E` · Gold `#C9A84C` · Cream `#F5EFE0`
- **Fonts:** Cormorant Garamond (serif display) + DM Sans (body)
- **Rules:** No Inter font · No blob backgrounds · No shadcn · No framer-motion · Tailwind + CSS `@keyframes` only

---

*Built with ❤️ for the Xaverian community*