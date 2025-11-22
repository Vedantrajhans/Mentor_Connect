# Product Requirements Document (PRD)

## MentorConnect Platform

### 1. Product Overview

**Product Name:** MentorConnect  
**Version:** 1.0.0  
**Product Type:** Full-Stack Peer-to-Peer Mentorship Platform

MentorConnect is a comprehensive web application that bridges aspiring university students (mentees) with verified student mentors from top universities worldwide. The platform facilitates authentic college guidance through scheduled video sessions, enabling mentees to gain insider insights on admissions, campus life, and academic programs while providing mentors an opportunity to give back to their communities.

### 2. Target Users

- **Mentees (Students):** High school students and college applicants seeking guidance on university admissions, program selection, and campus life
- **Mentors (Current University Students):** Verified students at universities who provide personalized mentorship and share their experiences
- **Administrators:** Platform managers who verify mentors, moderate content, manage users, and oversee platform operations

### 3. Core Features

#### 3.1 User Authentication & Management

- **User Registration:** Multi-role account creation (Mentee, Mentor, Admin)
- **User Login:** Secure JWT-based authentication
- **Role-Based Dashboards:** Customized interfaces for each user type
- **Profile Management:**
  - Full profile editing with pre-filled data
  - Profile photo upload and display
  - Bio and contact information management
  - Mentee: Target universities and desired programs
  - Mentor: University, program, graduation year, expertise areas
- **Email Notifications:** Simulated email system for session confirmations, approvals, and updates

#### 3.2 Mentor Management

- **Mentor Registration:** Two-step process with detailed profile completion
- **Profile Submission:** University, program, expertise, bio, student ID proof upload
- **Admin Approval Workflow:** Mentors must be approved before accepting sessions
- **Mentor Discovery:** Public profile pages with ratings, reviews, and availability
- **Expertise Tags:** Multiple areas of specialization (e.g., CS Admissions, Essay Review, Tech Interviews)
- **Availability Management:**
  - Manual slot addition with date/time picker
  - Quick preset options (Next 7 days, Weekdays, Weekends)
  - Recurring slot generation with custom schedules
  - Bulk slot management (add/delete)

#### 3.3 Mentee Features

- **Mentor Search & Discovery:**
  - Search by university, program, and expertise
  - Filter and browse mentor profiles
  - View mentor ratings, reviews, and availability
- **Session Booking:**
  - Select available time slots
  - Enter session topic and goals
  - Submit booking requests (pending mentor approval)
- **Dashboard:**
  - View pending requests awaiting approval
  - Access confirmed sessions with Zoom links
  - Track completed sessions
  - Quick stats (sessions count, pending requests)

#### 3.4 Session Management

- **Booking Workflow:**
  - Mentee selects slot and submits request (status: pending)
  - Mentor receives notification and reviews request
  - Mentor confirms or rejects with reason
  - Upon confirmation: Zoom meeting auto-generated and link sent
- **Session States:**
  - `pending` - Awaiting mentor approval
  - `confirmed` - Mentor approved, Zoom link available
  - `completed` - Session finished, ready for review
  - `rejected` - Mentor declined with reason provided
  - `cancelled` - Either party cancelled session
- **Video Integration:**
  - Real Zoom API integration for meeting creation
  - Automatic meeting link generation on confirmation
  - Meeting ID and password provided to both parties
  - Fallback to simulated links if Zoom API fails
  - Auto-deletion of Zoom meetings on cancellation
- **Session Details:**
  - 60-minute duration
  - Topic/agenda specification
  - Mentor and mentee information
  - Calendar invite (.ics file) generation

#### 3.5 Review & Rating System

- **Post-Session Reviews:**
  - Both parties leave reviews after completion
  - 1-5 star rating system
  - Written feedback
  - Reviews displayed on mentor profiles
- **Rating Aggregation:**
  - Average rating calculation
  - Total review count
  - Review history and display

#### 3.6 Admin Dashboard

- **Mentor Approval:**
  - Review mentor applications
  - View student ID proof verification
  - Approve or reject mentor requests
- **User Management:**
  - View all users (mentees, mentors, admins)
  - Enable/disable user accounts
  - Manage user roles
- **Session Oversight:**
  - View all platform sessions
  - Session analytics and trends
- **Platform Analytics:**
  - User growth metrics
  - Booking rates and completion rates
  - Average ratings and popular mentors
  - University and program statistics

#### 3.7 Landing Page

- **Hero Section:** Platform value proposition with call-to-action
- **Feature Highlights:** Key benefits and how it works
- **Statistics Display:** Mentors count, universities, sessions completed
- **Mentor Browse Preview:** Sample mentor cards
- **Testimonials/Reviews:** Social proof section
- **Sign-up CTAs:** Clear registration paths for both user types

### 4. Technical Specifications

#### 4.1 Technology Stack

**Frontend:**

- Next.js 14 (App Router)
- React 18
- Redux Toolkit with Redux Persist
- Tailwind CSS + Shadcn UI components
- React Hot Toast for notifications
- Lucide React for icons

**Backend:**

- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Bcrypt for password hashing
- Multer for file uploads
- Nodemailer for email notifications

**Third-Party Integrations:**

- Zoom API (Server-to-Server OAuth)
- Email service (simulated, expandable to SendGrid/AWS SES)

#### 4.2 API Endpoints Structure

**Authentication Routes** (`/api/auth/`)

- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /me` - Get current user
- `PUT /profile` - Update user profile
- `POST /logout` - User logout

**Mentor Routes** (`/api/mentors/`)

- `GET /search` - Search mentors with filters (public)
- `GET /:id` - Get mentor profile (public)
- `POST /profile` - Complete mentor profile (mentor only)
- `GET /profile/me` - Get my mentor profile (mentor only)
- `PUT /profile` - Update mentor profile (mentor only)
- `PUT /availability` - Update availability slots (mentor only)

**Booking Routes** (`/api/bookings/`)

- `POST /` - Create session booking (mentee only)
- `GET /my` - Get user's sessions (authenticated)
- `POST /:sessionId/confirm` - Confirm session request (mentor only)
- `POST /:sessionId/reject` - Reject session request (mentor only)
- `POST /:sessionId/complete` - Mark session complete (authenticated)
- `DELETE /:sessionId/cancel` - Cancel session (authenticated)

**Admin Routes** (`/api/admin/`)

- `GET /mentors/pending` - Get pending mentor approvals (admin only)
- `POST /mentors/:id/approve` - Approve mentor (admin only)
- `POST /mentors/:id/reject` - Reject mentor (admin only)
- `GET /users` - Get all users (admin only)
- `PUT /users/:id/status` - Enable/disable user (admin only)
- `GET /analytics` - Get platform analytics (admin only)

**Review Routes** (`/api/reviews/`)

- `POST /sessions/:sessionId` - Create review (authenticated)
- `GET /mentor/:mentorId` - Get mentor reviews (public)

#### 4.3 Permission Matrix

| Feature                         | Admin | Mentor | Mentee |
| ------------------------------- | ----- | ------ | ------ |
| Register Account                | ✓     | ✓      | ✓      |
| Complete Profile                | ✓     | ✓      | ✓      |
| Upload Profile Photo            | ✓     | ✓      | ✓      |
| Search Mentors                  | ✓     | ✓\*    | ✓      |
| View Mentor Profiles            | ✓     | ✓      | ✓      |
| Book Sessions                   | ✗     | ✗      | ✓      |
| Manage Availability             | ✗     | ✓      | ✗      |
| Confirm/Reject Session Requests | ✗     | ✓      | ✗      |
| View Session Zoom Links         | ✗     | ✓      | ✓      |
| Complete Sessions               | ✗     | ✓      | ✓      |
| Leave Reviews                   | ✗     | ✓      | ✓      |
| Approve Mentors                 | ✓     | ✗      | ✗      |
| Manage Users                    | ✓     | ✗      | ✗      |
| View Analytics                  | ✓     | ✗      | ✗      |

\*Mentors can search but cannot book (view-only mode)

#### 4.4 Data Models

**User Schema:**

```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  role: Enum ['mentee', 'mentor', 'admin'],
  isActive: Boolean (default: true),
  isApproved: Boolean (default: false for mentors),
  profile: {
    fullName: String,
    photo: String (base64 or URL),
    phone: String,
    bio: String,
    // Mentor-specific
    university: String,
    program: String,
    graduationYear: Number,
    expertise: [String],
    availability: [Date],
    studentIdProof: String,
    rating: Number (average),
    totalReviews: Number,
    // Mentee-specific
    targetUniversities: [String],
    desiredProgram: String
  }
}
```

**Session Schema:**

```javascript
{
  mentee: ObjectId (ref: User),
  mentor: ObjectId (ref: User),
  startTime: Date,
  endTime: Date,
  topic: String,
  status: Enum ['pending', 'confirmed', 'completed', 'rejected', 'cancelled'],
  zoomLink: String,
  zoomMeetingId: String,
  zoomPassword: String,
  rejectionReason: String,
  reviewedByMentee: Boolean,
  reviewedByMentor: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Review Schema:**

```javascript
{
  session: ObjectId (ref: Session),
  reviewer: ObjectId (ref: User),
  reviewee: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

#### 4.5 Zoom Integration Flow

1. **Mentor confirms session** → Backend calls Zoom API
2. **Zoom meeting created** with:
   - Topic: `MentorConnect: {session.topic}`
   - Start time: Session scheduled time
   - Duration: 60 minutes
   - Waiting room enabled
   - Auto-recording: None
3. **Meeting details saved** to session document
4. **Email notifications sent** with Zoom link, Meeting ID, and Password
5. **On cancellation** → Zoom meeting deleted via API

### 5. Security Features

- **JWT Authentication:** Secure token-based auth with httpOnly cookies
- **Password Hashing:** Bcrypt with salt rounds
- **Role-Based Authorization:** Middleware protection on all routes
- **Input Validation:** Server-side validation for all inputs
- **File Upload Security:**
  - File type validation
  - Size limits (5MB for profile photos)
  - Sanitized storage
- **CORS Configuration:** Restricted origins
- **Environment Variables:** Sensitive credentials stored in .env
- **API Rate Limiting:** (Recommended for production)
- **XSS Protection:** Input sanitization and escaping

### 6. Email Notification System

**Simulated Email Events:**

- **Mentor Registration:** Admin notification for new mentor application
- **Session Request:** Mentor notification of new booking
- **Session Confirmed:** Mentee receives Zoom link and calendar invite
- **Session Rejected:** Mentee notified with rejection reason
- **Session Cancelled:** Both parties notified
- **Mentor Approved:** Mentor notification of approval
- **Mentor Rejected:** Mentor notification with reason

**Production Expansion:**

- Integration with SendGrid/AWS SES
- Email templates with branding
- Automated reminder emails (24hr, 1hr before session)

### 7. File Management

- **Profile Photos:** Base64 encoding or external storage (Cloudinary expandable)
- **Student ID Proof:** Secure upload for mentor verification
- **Storage Strategy:**
  - Development: Local storage or base64
  - Production: Cloud storage (AWS S3, Cloudinary)

### 8. User Experience Features

#### 8.1 Responsive Design

- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly UI elements

#### 8.2 Real-time Updates

- Session status changes reflected immediately
- Dashboard auto-refresh on data changes
- Toast notifications for user actions

#### 8.3 Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Sufficient color contrast (WCAG AA)
- Screen reader compatibility

#### 8.4 Performance Optimization

- Redux state persistence
- Lazy loading of components
- Optimized API calls with caching
- Image optimization

### 9. Success Criteria

- ✅ Secure multi-role authentication and authorization
- ✅ Complete mentor approval workflow
- ✅ Functional session booking with approval system
- ✅ Real Zoom API integration with fallback
- ✅ Profile management with photo uploads
- ✅ Mentor search and discovery with filters
- ✅ Availability management with bulk operations
- ✅ Review and rating system
- ✅ Admin dashboard with analytics
- ✅ Email notification system (simulated)
- ✅ Responsive, accessible UI across all devices
- ✅ Professional landing page
- ✅ Session lifecycle management (pending → confirmed → completed)

### 10. Future Enhancements (Post-MVP)

- **Payment Integration:** Paid mentorship sessions with Stripe/PayPal
- **Real Email Service:** SendGrid/AWS SES integration
- **Advanced Analytics:** Detailed reporting and insights
- **Chat System:** Real-time messaging between mentors and mentees
- **Calendar Integration:** Google Calendar/Outlook sync
- **Video Recording:** Session recording and playback
- **Resource Sharing:** Document uploads and sharing
- **Mentor Verification:** Enhanced verification with university email
- **Mobile App:** Native iOS/Android applications
- **Recommendation Engine:** AI-powered mentor matching
- **Group Sessions:** Support for 1-to-many mentorship
- **Certification:** Mentor certification and badges

### 11. Deployment Strategy

**Development:**

- Frontend: Localhost:3000 (Next.js dev server)
- Backend: Localhost:5000 (Node.js/Express)
- Database: MongoDB Atlas

**Production:**

- Frontend: Vercel (Next.js optimized)
- Backend: Render/Railway/Vercel Serverless
- Database: MongoDB Atlas (Production cluster)
- File Storage: Cloudinary/AWS S3
- Email: SendGrid/AWS SES
- Monitoring: Sentry for error tracking
- Analytics: Google Analytics/Mixpanel

---

**Document Version:** 1.0.0  
**Last Updated:** November 22, 2025  
**Status:** Production-Ready with Zoom Integration Complete
