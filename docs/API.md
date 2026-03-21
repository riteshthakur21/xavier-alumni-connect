# Xavier AlumniConnect — API Documentation

## Base URL
```
Production:  https://xavier-alumni-connect.onrender.com/api
Development: http://localhost:5000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
```json
{ "message": "Description", "data": { ... } }
```
Error:
```json
{ "error": "Error message" }
```

---

## Rate Limits

| Endpoint Group | Limit |
|----------------|-------|
| Auth endpoints | 5 req / minute |
| Chat endpoints | 60 req / minute |
| General API    | 100 req / 15 min |

---

## 1. Authentication Endpoints `/api/auth`

### Register
```http
POST /auth/register
Content-Type: multipart/form-data
```
**Body:** `name`, `email`, `password`, `batchYear`, `department`, `rollNo`, `role` (ALUMNI/STUDENT), `company`?, `jobTitle`?, `linkedinUrl`?, `bio`?, `photo`?

**Response:** `{ message, token, user: { id, name, email, role, isVerified } }`

> After register, user must verify email via OTP before logging in.

---

### Verify Email (OTP)
```http
POST /auth/verify-email
```
**Body:** `{ "email": "...", "otp": "123456" }`

**Response:** `{ message: "Email verified. Awaiting admin approval." }`

---

### Resend OTP
```http
POST /auth/resend-otp
```
**Body:** `{ "email": "..." }`

> Rate limited: 3 requests per 15 minutes.

---

### Login
```http
POST /auth/login
```
**Body:** `{ "email": "...", "password": "..." }`

**Response:** `{ message, token, user: { id, name, email, role, isVerified, alumniProfile } }`

> Returns `EMAIL_NOT_VERIFIED` error if OTP not verified yet.

---

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```
**Response:** `{ user: { id, name, email, role, isVerified, alumniProfile } }`

---

### Forgot Password
```http
POST /auth/forgot-password
```
**Body:** `{ "email": "..." }`

> Sends a password reset link to the email via Brevo.

---

### Reset Password
```http
POST /auth/reset-password
```
**Body:** `{ "token": "...", "newPassword": "..." }`

---

## 2. Alumni Endpoints `/api/alumni`

### List Alumni (Directory)
```http
GET /alumni
```
**Query Params:** `search`, `batchYear`, `department`, `company`, `page` (default 1), `limit` (default 20)

**Response:**
```json
{
  "alumni": [{ "id", "name", "email", "role", "createdAt", "alumniProfile": { "batchYear", "department", "company", "jobTitle", "photoUrl", "location", "contactPublic" } }],
  "pagination": { "page", "limit", "total", "pages" }
}
```

---

### Get Single Alumni Profile
```http
GET /alumni/:id
```
**Response:** `{ alumni: { id, name, email, role, createdAt, alumniProfile: { ...allFields } } }`

> Contact info (email, LinkedIn) hidden if `contactPublic: false`.

---

### Update Alumni Profile
```http
PUT /alumni/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Body:** `name`?, `company`?, `jobTitle`?, `linkedinUrl`?, `bio`?, `location`?, `skills` (JSON array string)?, `contactPublic`?, `photo`?

> Only profile owner or ADMIN can update.

---

### Get Alumni Stats
```http
GET /alumni/stats/overview
```
**Response:** `{ totalAlumni, byBatch: [{batchYear, _count}], byDepartment: [{department, _count}], byCompany: [{company, _count}] }`

---

## 3. Admin Endpoints `/api/admin`
> All require `Authorization: Bearer <token>` + ADMIN role.

### Get Pending Verifications
```http
GET /admin/pending
```
**Response:** `{ pendingAlumni: [{ id, name, email, role, rollNo, isVerified, createdAt, alumniProfile }] }`

---

### Approve / Reject User
```http
POST /admin/verify/:id
```
**Body:** `{ "action": "approve" | "reject" }`

> Sends email notification to user on both approve and reject.

---

### Delete User
```http
DELETE /admin/alumni/:id
```

---

### Get System Statistics
```http
GET /admin/stats
```
**Response:** `{ totalUsers, totalAlumni, verifiedAlumni, pendingAlumni, totalStudents, totalEvents, recentRegistrations }`

---

### Get All Users (Paginated)
```http
GET /admin/users?page=1&limit=20&search=...&role=ALUMNI
```
**Response:** `{ users: [...], pagination: { page, limit, total, pages } }`

---

### Get Pending Stories (Admin)
```http
GET /stories/pending
Authorization: Bearer <token>  (ADMIN only)
```

---

## 4. Connection Endpoints `/api/connections`
> All require `Authorization: Bearer <token>`.

### Send Connection Request
```http
POST /connections/send/:userId
```
**Response:** `{ message: "Request sent", request: { id, senderId, receiverId, status } }`

---

### Accept Request
```http
POST /connections/accept/:requestId
```

---

### Reject Request
```http
POST /connections/reject/:requestId
```

---

### Cancel Sent Request
```http
POST /connections/cancel/:requestId
```

---

### Disconnect (Remove Connection)
```http
DELETE /connections/disconnect/:userId
```

---

### Get Connection Status
```http
GET /connections/status/:userId
```
**Response:** `{ status: "not_connected" | "pending_sent" | "pending_received" | "connected" | "self", requestId? }`

---

### Get My Connections
```http
GET /connections/my?page=1&limit=20
```
**Response:** `{ data: [{ id, name, email, role, alumniProfile }], pagination }`

---

### Get Pending (Received) Requests
```http
GET /connections/pending
```
**Response:** `{ data: [{ id, createdAt, sender: { id, name, alumniProfile } }] }`

---

### Get Sent Requests
```http
GET /connections/sent
```
**Response:** `{ data: [{ id, createdAt, receiver: { id, name, alumniProfile } }] }`

---

### Get Mutual Connections
```http
GET /connections/mutual/:userId
```
**Response:** `{ data: [{ id, name, alumniProfile }] }`

---

## 5. Chat Endpoints `/api/chat`
> All require `Authorization: Bearer <token>`. Rate limit: 60 req/min.

> ⚠️ Chat is only available between **connected** users (accepted connection required).

> 🔐 All message content is **AES-256-GCM encrypted** in the database.

### Get All Conversations
```http
GET /chat/conversations
```
**Response:** `{ data: [{ id, createdAt, updatedAt, otherUser: { id, name, alumniProfile }, lastMessage: { content, createdAt, isSeen } }] }`

---

### Get Messages (Paginated)
```http
GET /chat/messages/:conversationId?limit=20&cursor=<ISO-datetime>
```
> `cursor` = fetch messages older than this timestamp (for infinite scroll).

**Response:** `{ data: [{ id, content, senderId, isSeen, isDeleted, createdAt }], hasMore }`

---

### Create / Get Conversation
```http
POST /chat/create-conversation
```
**Body:** `{ "targetUserId": "uuid" }`

> Returns existing conversation if already exists.

**Response:** `{ data: { id, members } }`

---

### Delete Message (Soft Delete)
```http
DELETE /chat/messages/:messageId
```
> Only sender can delete. Message shows as "This message was deleted."

---

## 6. Stories Endpoints `/api/stories`

### Submit a Story
```http
POST /stories
Authorization: Bearer <token>
```
**Body:** `{ "title": "...", "content": "..." }`

> Max: title 100 chars, content 2000 chars. Status defaults to `PENDING`.

---

### Get All Approved Stories
```http
GET /stories
```
**Response:** `{ stories: [{ id, title, content, status, createdAt, author: { id, name, role, alumniProfile } }] }`

---

### Get Single Story
```http
GET /stories/:id
```

---

### Approve / Reject Story (Admin)
```http
PATCH /stories/:id/status
Authorization: Bearer <token>  (ADMIN only)
```
**Body:** `{ "status": "APPROVED" | "REJECTED" }`

---

### Delete Story
```http
DELETE /stories/:id
Authorization: Bearer <token>
```
> Author or ADMIN can delete.

---

## 7. Events Endpoints `/api/events`

### List Events
```http
GET /events
Authorization: Bearer <token>
```
> Filters by `targetAudience` based on user role (ALUMNI, STUDENT, or ALL).

**Response:** `{ events: [{ id, title, description, date, location, imageUrl, targetAudience, registrations, postedBy }] }`

---

### Get Single Event
```http
GET /events/:id
```

---

### Create Event (Admin Only)
```http
POST /events
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Body:** `title`, `description`, `date`, `location`, `targetAudience` (ALL/ALUMNI/STUDENT), `image`?

---

### Update Event (Admin Only)
```http
PUT /events/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

---

### Delete Event (Admin Only)
```http
DELETE /events/:id
Authorization: Bearer <token>
```

---

### Register for Event
```http
POST /events/:id/register
Authorization: Bearer <token>
```
> Only verified users can register. Duplicate registration blocked.

---

### Get Event Participants
```http
GET /events/:id/participants
Authorization: Bearer <token>
```
**Response:** `{ participants: [{ id, name, role, alumniProfile }] }`

---

## 8. Jobs Endpoints `/api/jobs`

### List Jobs
```http
GET /jobs
```
**Response:** `{ jobs: [{ id, title, company, location, type, description, applyLink, postedBy, createdAt }] }`

---

### Post a Job (Alumni / Admin only)
```http
POST /jobs
Authorization: Bearer <token>
```
**Body:** `{ title, company, location, type, description, applyLink? }`

---

### Delete Job
```http
DELETE /jobs/:id
Authorization: Bearer <token>
```
> Only job owner or ADMIN can delete.

---

## 9. Export Endpoints `/api/export`
> All require ADMIN role.

### Export Alumni CSV
```http
GET /export/alumni?type=all|verified_alumni|verified_student&batchYear=2020&department=BCA
Authorization: Bearer <token>
```
> Returns CSV file download. Returns 404 if no records match filters.

---

## 10. WebSocket Events

**Connection URL:** `wss://xavier-alumni-connect.onrender.com`

> Requires JWT token passed during socket handshake (via `auth.token`).

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `joinConversation` | `{ conversationId }` | Join a chat room |
| `sendMessage` | `{ conversationId, content }` | Send a message |
| `markSeen` | `{ conversationId }` | Mark messages as read |
| `typing` | `{ conversationId, isTyping }` | Typing indicator |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `joinedConversation` | `{ conversationId }` | Joined room confirmation |
| `newMessage` | `{ id, content, senderId, createdAt, isSeen }` | Incoming message |
| `messageSeen` | `{ conversationId, seenBy }` | Messages marked seen |
| `userTyping` | `{ conversationId, userId, isTyping }` | Typing indicator |
| `userOnline` | `{ userId }` | User came online |
| `userOffline` | `{ userId }` | User went offline |
| `messageDeleted` | `{ messageId, conversationId }` | Message soft-deleted |
| `error` | `{ event, message, code? }` | Error response |

### Special Error Codes

| Code | Meaning |
|------|---------|
| `CHAT_NOT_CONNECTED` | Users are not connected — cannot chat |

---

## Error Codes

| HTTP Code | Description |
|-----------|-------------|
| 400 | Bad Request — Invalid input |
| 401 | Unauthorized — Missing/invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found |
| 429 | Rate limit exceeded |
| 500 | Internal Server Error |

---

## File Uploads
- **Formats:** JPG, JPEG, PNG (images only)
- **Max size:** 5MB
- **Storage:** Cloudinary (production)
- **Endpoints:** Profile photo via `PUT /alumni/:id`, Event banner via `POST /events`