# Alumni Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

All responses follow this structure:
```json
{
  "success": true,
  "message": "Description",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Description:** Register a new alumni user

**Request Body (multipart/form-data):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "batchYear": 2020,
  "department": "Computer Science",
  "rollNo": "CS202001",
  "company": "Google",
  "jobTitle": "Software Engineer",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "bio": "Passionate developer...",
  "photo": <file>
}
```

**Response:**
```json
{
  "message": "Registration successful. Please wait for admin verification.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ALUMNI",
    "isVerified": false
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ALUMNI",
    "isVerified": true,
    "alumniProfile": { ... }
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ALUMNI",
    "isVerified": true,
    "alumniProfile": { ... }
  }
}
```

---

## Alumni Endpoints

### List Alumni
```http
GET /alumni
```

**Query Parameters:**
- `search` - Search by name, company, or job title
- `batchYear` - Filter by graduation year
- `department` - Filter by department
- `company` - Filter by company
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "alumni": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ALUMNI",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "alumniProfile": {
        "batchYear": 2020,
        "department": "Computer Science",
        "company": "Google",
        "jobTitle": "Software Engineer",
        "photoUrl": "/uploads/photo.jpg",
        "location": "San Francisco",
        "contactPublic": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Get Alumni Profile
```http
GET /alumni/:id
```

**Response:**
```json
{
  "alumni": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ALUMNI",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "alumniProfile": {
      "batchYear": 2020,
      "department": "Computer Science",
      "rollNo": "CS202001",
      "company": "Google",
      "jobTitle": "Software Engineer",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "photoUrl": "/uploads/photo.jpg",
      "bio": "Passionate developer...",
      "location": "San Francisco",
      "skills": ["React", "Node.js", "Python"],
      "contactPublic": true
    }
  }
}
```

### Update Alumni Profile
```http
PUT /alumni/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "company": "Microsoft",
  "jobTitle": "Senior Engineer",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "bio": "Updated bio...",
  "location": "Seattle",
  "skills": "[\"React\", \"Node.js\", \"TypeScript\"]",
  "contactPublic": "true",
  "photo": <file>
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

### Get Alumni Statistics
```http
GET /alumni/stats/overview
```

**Response:**
```json
{
  "totalAlumni": 150,
  "byBatch": [
    { "batchYear": 2020, "_count": 25 },
    { "batchYear": 2021, "_count": 30 }
  ],
  "byDepartment": [
    { "department": "Computer Science", "_count": 45 },
    { "department": "Electrical", "_count": 35 }
  ],
  "byCompany": [
    { "company": "Google", "_count": 15 },
    { "company": "Microsoft", "_count": 12 }
  ]
}
```

---

## Admin Endpoints

### Get Pending Verifications
```http
GET /admin/pending
Authorization: Bearer <token>
```

**Response:**
```json
{
  "pendingAlumni": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "ALUMNI",
      "isVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "alumniProfile": { ... }
    }
  ]
}
```

### Verify Alumni
```http
POST /admin/verify/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "action": "approve"  // or "reject"
}
```

**Response:**
```json
{
  "message": "Alumni approved successfully"
}
```

### Delete Alumni
```http
DELETE /admin/alumni/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Alumni deleted successfully"
}
```

### Get System Statistics
```http
GET /admin/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalUsers": 200,
  "totalAlumni": 150,
  "verifiedAlumni": 120,
  "pendingAlumni": 30,
  "totalStudents": 50,
  "totalEvents": 10,
  "recentRegistrations": [ ... ]
}
```

---

## Events Endpoints

### List Events
```http
GET /events
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Annual Alumni Meetup",
      "description": "Join us for our annual gathering...",
      "date": "2024-12-15T18:00:00.000Z",
      "location": "College Campus",
      "imageUrl": "/uploads/event.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### Get Event
```http
GET /events/:id
```

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "title": "Annual Alumni Meetup",
    "description": "Join us for our annual gathering...",
    "date": "2024-12-15T18:00:00.000Z",
    "location": "College Campus",
    "imageUrl": "/uploads/event.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Event (Admin Only)
```http
POST /events
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "title": "New Event",
  "description": "Event description...",
  "date": "2024-12-15T18:00:00.000Z",
  "location": "Event Location",
  "image": <file>
}
```

**Response:**
```json
{
  "message": "Event created successfully",
  "event": { ... }
}
```

### Update Event (Admin Only)
```http
PUT /events/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Delete Event (Admin Only)
```http
DELETE /events/:id
Authorization: Bearer <token>
```

---

## Reports Endpoints

### Export Alumni Data
```http
GET /reports/export/alumni
Authorization: Bearer <token>
```

**Query Parameters:**
- `format` - Export format (csv/json, default: csv)
- `filter` - Filter data (all/verified/pending)

**Response:** CSV file download

### Export Batch Data
```http
GET /reports/export/batch/:batchYear
Authorization: Bearer <token>
```

**Response:** CSV file with batch-specific alumni data

### Export Company Data
```http
GET /reports/export/company/:company
Authorization: Bearer <token>
```

**Response:** CSV file with company-specific alumni data

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limits

- Authentication endpoints: 5 requests per minute
- General API endpoints: 100 requests per 15 minutes
- File uploads: 10 requests per minute

---

## File Uploads

**Supported Formats:**
- Images: JPG, JPEG, PNG, GIF
- Maximum size: 5MB

**Upload Endpoint:**
- Alumni profile photos: `/alumni/:id` (PUT)
- Event images: `/events` (POST/PUT)

---

## WebSocket Support

The system supports real-time updates for:
- Admin notifications
- User status changes
- Event updates

**Connection URL:**
```
ws://localhost:5000
```