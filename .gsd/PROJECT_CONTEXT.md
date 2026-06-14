# 🏆 React College Tournament — Project Context

> **Last Updated:** 2026-06-06
> **Maintained by:** GSD Workflow

---

## 1. Project Overview

A **full-stack college sports tournament management platform** that enables colleges to organize, register for, and manage inter-college sports events. The system supports multiple user roles (Admin, Organizer, Player/Coach), real-time match updates via Socket.IO, payment integration (Razorpay), email/SMS notifications, and a comprehensive admin analytics dashboard.

### Core Capabilities
- **Tournament lifecycle management** — create, edit, schedule, and finalize tournaments
- **Team management** — create teams, join teams, approve players, captain controls
- **Match scheduling & live scoring** — bracket generation, real-time score updates
- **Registration system** — team/player registration with approval workflows
- **Sponsorship management** — sponsor CRUD with financial tracking
- **Admin analytics dashboard** — real-time stats, charts, reports
- **Multi-role access control** — Admin, Organizer, Player, Coach, Guest
- **Payment processing** — Razorpay integration for entry fees
- **Notifications** — real-time (Socket.IO), email (Nodemailer), SMS (Twilio)

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 18.2.0 |
| **Build Tool** | Vite | 7.2.4 |
| **Routing** | React Router DOM | 6.22.3 |
| **HTTP Client** | Axios | 1.13.2 |
| **Animations** | Framer Motion | 12.40.0 |
| **Icons** | Lucide React | 0.562.0 |
| **Charts** | Chart.js + react-chartjs-2, Recharts | 4.5.1 / 3.8.1 |
| **3D Graphics** | Three.js | 0.184.0 |
| **Real-time (Client)** | socket.io-client | 4.8.3 |
| **Backend Runtime** | Node.js + Express | 5.2.1 |
| **Database** | MongoDB + Mongoose | 9.1.2 |
| **Real-time (Server)** | Socket.IO | 4.8.3 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | - |
| **File Upload** | Multer + Cloudinary | - |
| **Payments** | Razorpay | 2.9.6 |
| **Email** | Nodemailer | 8.0.5 |
| **SMS** | Twilio | 5.13.1 |
| **Validation** | express-validator | 7.3.1 |
| **Dev Tool** | Nodemon | 3.1.11 |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Vite + React)            │
│  Port: 5173                                          │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Screens │  │  Admin   │  │  Shared Components│   │
│  │  (42)    │  │  Side    │  │  (Header, Footer, │   │
│  │          │  │  (33)    │  │   Layouts, etc.)   │   │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘   │
│       │              │                 │              │
│  ┌────▼──────────────▼─────────────────▼──────────┐  │
│  │           AuthContext + RoleLayout              │  │
│  └────────────────────┬───────────────────────────┘  │
│                       │ Axios (axiosConfig.js)        │
│                       │ Socket.IO (socket.js)         │
└───────────────────────┼──────────────────────────────┘
                        │  HTTP + WebSocket
┌───────────────────────┼──────────────────────────────┐
│                   BACKEND (Express + Node.js)         │
│  Port: 5000                                           │
│                                                       │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │  Routes    │ │ Middleware │ │  Config            │  │
│  │  (14)     │ │ (auth,role,│ │  (cloudinary,      │  │
│  │           │ │  upload)   │ │   email, sms,      │  │
│  │           │ │            │ │   notifications)   │  │
│  └─────┬─────┘ └─────┬──────┘ └──────────────────┘  │
│        │              │                               │
│  ┌─────▼──────────────▼──────────────────────────┐   │
│  │           Mongoose Models (13)                 │   │
│  │  User, Team, Tournament, Match, Registration, │   │
│  │  Sport, Venue, Sponsor, Transaction,           │   │
│  │  Notification, AuditLog, PendingUser, Cog      │   │
│  └────────────────────┬──────────────────────────┘   │
│                       │                               │
└───────────────────────┼───────────────────────────────┘
                        │
                  ┌─────▼─────┐
                  │  MongoDB  │
                  │  Atlas    │
                  └───────────┘
```

---

## 4. Directory Structure

```
react-clg-tournament-main/
├── Fronted/                          # ⚛️ React Frontend (note: typo in folder name)
│   ├── src/
│   │   ├── adminside/                # Admin panel components (33 files)
│   │   │   ├── AdminDashboard.jsx    # Main admin dashboard
│   │   │   ├── AdminUsers.jsx        # User management
│   │   │   ├── AnalyticsDashboard.jsx# Analytics with charts
│   │   │   ├── Reports.jsx           # Report generation
│   │   │   ├── TournamentList.jsx    # Tournament CRUD
│   │   │   ├── MatchList.jsx         # Match management
│   │   │   ├── SportManagement.jsx   # Sport CRUD
│   │   │   ├── VenueManagement.jsx   # Venue CRUD
│   │   │   └── ...                   # More admin components
│   │   ├── screen/                   # Public/user-facing screens (42 files)
│   │   │   ├── Home.jsx              # Landing page (Three.js BG)
│   │   │   ├── Login.jsx             # Authentication
│   │   │   ├── RegisterWithVerification.jsx  # Email-verified signup
│   │   │   ├── TournamentsList.jsx   # Browse tournaments
│   │   │   ├── TeamDetails.jsx       # Team view
│   │   │   ├── OrganizerDashboard.jsx# Organizer tools
│   │   │   └── ...                   # More screens
│   │   ├── component/                # Shared UI components
│   │   │   ├── Header.jsx            # Navigation bar
│   │   │   ├── Footer.jsx            # Site footer
│   │   │   └── ThemeToggle.jsx       # Dark/light mode
│   │   ├── components/               # Specialized components
│   │   │   ├── ThreeBgCanvas.jsx     # Three.js background
│   │   │   ├── TiltCard.jsx          # 3D tilt card effect
│   │   │   └── PaymentModal.jsx      # Razorpay payment
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   ├── layouts/                  # Role-based layouts
│   │   │   ├── RoleLayout.jsx        # Layout switcher by role
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── OrganizerLayout.jsx
│   │   │   ├── PlayerLayout.jsx
│   │   │   ├── CoachLayout.jsx
│   │   │   └── GuestLayout.jsx
│   │   ├── routes/                   # Route guards
│   │   │   ├── AdminRoute.jsx        # Admin-only guard
│   │   │   └── NonOrganizerRoute.jsx # Block organizers
│   │   ├── services/
│   │   │   └── paymentService.js     # Razorpay API calls
│   │   ├── utils/
│   │   │   ├── axiosConfig.js        # Axios instance + interceptors
│   │   │   ├── socket.js             # Socket.IO client instance
│   │   │   ├── validators.js         # Form validation helpers
│   │   │   └── matchGenerator.js     # Match bracket generator
│   │   ├── static/                   # CSS files per screen (33 files)
│   │   ├── cognisun/                 # Legacy/unused module
│   │   ├── App.jsx                   # Root component + all routes
│   │   ├── App.css                   # Global app styles
│   │   ├── main.jsx                  # React DOM entry point
│   │   └── index.css                 # CSS reset/variables
│   ├── index.html                    # HTML template
│   ├── vite.config.js                # Vite configuration
│   └── package.json                  # Frontend dependencies
│
├── backend/                          # 🖥️ Express Backend
│   ├── config/
│   │   ├── cloudinary.js             # Cloudinary file upload config
│   │   ├── email.js                  # Nodemailer email templates
│   │   ├── notifications.js          # Notification dispatch system
│   │   └── sms.js                    # Twilio SMS config
│   ├── controllers/
│   │   └── paymentController.js      # Razorpay payment handling
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT token verification
│   │   ├── roleMiddleware.js         # Role-based access control
│   │   └── upload.js                 # Multer + Cloudinary upload
│   ├── models/                       # Mongoose schemas (13 models)
│   │   ├── User.js                   # User account model
│   │   ├── Team.js                   # Team with members/captain
│   │   ├── Tournament.js             # Tournament events
│   │   ├── Match.js                  # Match with scores/status
│   │   ├── Registration.js           # Event registrations
│   │   ├── Sport.js                  # Sports catalog
│   │   ├── Venue.js                  # Venue locations
│   │   ├── Sponsor.js                # Sponsor info
│   │   ├── Transaction.js            # Payment transactions
│   │   ├── notification.js           # Notification records
│   │   ├── AuditLog.js               # Audit trail
│   │   ├── PendingUser.js            # Pre-verification users
│   │   └── Cog.js                    # Cognisun integration
│   ├── routes/                       # Express route handlers (14 files)
│   │   ├── auth.js                   # Login, register, verify, reset
│   │   ├── profile.js                # User profile CRUD
│   │   ├── teamRouter.js             # Team operations
│   │   ├── tournamentRoutes.js       # Tournament CRUD
│   │   ├── matchRouter.js            # Match scheduling/scoring
│   │   ├── registrationRouter.js     # Registration workflows
│   │   ├── analyticsRouter.js        # Dashboard statistics
│   │   ├── sponsorRouter.js          # Sponsor management
│   │   ├── sportRouter.js            # Sport CRUD
│   │   ├── venueRouter.js            # Venue CRUD
│   │   ├── userRouter.js             # User admin operations
│   │   ├── cogRouter.js              # Cognisun routes
│   │   ├── notificationRouter.js     # Notification endpoints
│   │   └── paymentRoutes.js          # Payment processing
│   ├── services/
│   │   └── smsService.js             # SMS sending logic
│   ├── utils/
│   │   ├── validators.js             # Backend validation rules
│   │   └── twilioService.js          # Twilio client wrapper
│   ├── uploads/                      # Local file uploads (temp)
│   ├── server.js                     # Express app entry point
│   ├── .env                          # Environment variables
│   └── package.json                  # Backend dependencies
│
├── .gsd/                             # 📋 GSD Workflow (this directory)
├── README.md                         # Project README
└── .gitignore                        # Git ignore rules
```

---

## 5. User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access — manage users, tournaments, teams, matches, sponsors, venues, sports, analytics, reports |
| **Organizer** | Create tournaments, schedule matches, manage their own tournaments and sponsors. **Cannot** join/create teams |
| **Player** | Join/create teams, register for tournaments, view matches, receive notifications |
| **Coach** | Similar to player with team management capabilities |
| **Guest** | View public pages — home, events, schedule, gallery, sponsors |

---

## 6. API Route Map

| Prefix | Router File | Purpose |
|--------|------------|---------|
| `/api` | auth.js | Login, register, verify email, reset password |
| `/api/profile` | profile.js | Get/update user profile |
| `/api/users` | userRouter.js | Admin user management |
| `/api/sports` | sportRouter.js | Sport CRUD |
| `/api/teams` | teamRouter.js | Team CRUD, join, leave, approve |
| `/api/tournaments` | tournamentRoutes.js | Tournament CRUD |
| `/api/matches` | matchRouter.js | Match scheduling, scoring |
| `/api/registrations` | registrationRouter.js | Registration workflow |
| `/api/venues` | venueRouter.js | Venue CRUD |
| `/api/sponsors` | sponsorRouter.js | Sponsor management |
| `/api/cog` | cogRouter.js | Cognisun integration |
| `/api/notifications` | notificationRouter.js | Notification endpoints |
| `/api/analytics` | analyticsRouter.js | Dashboard statistics |
| `/api/schedule` | server.js (inline) | Quick match schedule |
| `/api/join-team` | server.js (inline) | Organizer block fallback |
| `/health` | server.js (inline) | Health check endpoint |

---

## 7. Environment Variables Required

```env
# Backend (.env)
MONGO_URI=               # MongoDB Atlas connection string
PORT=5000                 # Server port
JWT_SECRET=               # JWT signing key
CLOUDINARY_CLOUD_NAME=    # Cloudinary config
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=               # Nodemailer sender email
EMAIL_PASS=               # Nodemailer app password
TWILIO_ACCOUNT_SID=       # Twilio SMS
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RAZORPAY_KEY_ID=          # Razorpay payment
RAZORPAY_KEY_SECRET=
```

---

## 8. Key Design Decisions & Patterns

1. **Monorepo with separate package.json** — Frontend (`Fronted/`) and Backend (`backend/`) are siblings with independent dependency trees
2. **No TypeScript** — Pure JavaScript throughout
3. **No testing framework installed** — Neither Jest, Vitest, nor any test runner exists yet
4. **CSS-per-component pattern** — Each screen has its own CSS file in `static/`
5. **Role-based layouts** — `RoleLayout.jsx` switches header/navigation based on user role
6. **Inline route definitions** — All routes defined in `App.jsx` (single file)
7. **Socket.IO global instance** — Created once in `utils/socket.js`, shared across components
8. **Axios interceptor** — Auto-attaches JWT token to all API requests via `axiosConfig.js`
9. **Folder naming typo** — Frontend directory is named `Fronted` (not `Frontend`)

---

## 9. Known Issues & Technical Debt

- [ ] Frontend folder is named `Fronted` instead of `Frontend`
- [ ] `cognisun/` module appears unused (commented out in App.jsx)
- [ ] Backend dependencies include frontend libs (`lucide-react` in backend package.json)
- [ ] No test suite exists for either frontend or backend
- [ ] No CI/CD pipeline configured
- [ ] `all router.txt` is a stale text file with route documentation
- [ ] Some inconsistent naming (`Adminsponser.jsx` vs `SponsorManagement.jsx`)
- [ ] No API versioning
- [ ] No rate limiting on backend endpoints
- [ ] No input sanitization beyond express-validator
