# 🏆 React College Tournament Platform

A full-stack college sports tournament management platform built with React, Express, and MongoDB.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ installed
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (for media uploads)

### Backend Setup
```bash
cd backend
npm install
# Create .env file (see .gsd/PROJECT_CONTEXT.md for required variables)
npm start                    # or: npx nodemon server.js
# → http://localhost:5000
```

### Frontend Setup
```bash
cd Fronted
npm install
npm run dev
# → http://localhost:5173
```

---

## 📐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 7 |
| Backend | Express 5 + Node.js |
| Database | MongoDB + Mongoose 9 |
| Real-time | Socket.IO |
| Auth | JWT + bcryptjs |
| Payments | Razorpay |
| Media | Cloudinary |
| Email | Nodemailer |
| SMS | Twilio |

---

## 📋 GSD Workflow

This project uses the **GSD (Get Shit Done)** workflow for structured development. All project documentation lives in `.gsd/`:

| File | Purpose |
|------|---------|
| [PROJECT_CONTEXT.md](.gsd/PROJECT_CONTEXT.md) | Full codebase understanding |
| [GSD_CONFIG.md](.gsd/GSD_CONFIG.md) | Master configuration |
| [ROADMAP.md](.gsd/ROADMAP.md) | Phased milestone tracking |
| [TASKS.md](.gsd/TASKS.md) | Active task backlog |
| [CHANGELOG.md](.gsd/CHANGELOG.md) | Version history |
| [specs/PRD.md](.gsd/specs/PRD.md) | Product requirements |
| [specs/ARCHITECTURE.md](.gsd/specs/ARCHITECTURE.md) | Architecture decisions |
| [workflows/PLAN.md](.gsd/workflows/PLAN.md) | Planning process |
| [workflows/EXECUTE.md](.gsd/workflows/EXECUTE.md) | Execution process |
| [workflows/VERIFY.md](.gsd/workflows/VERIFY.md) | Verification process |

### Daily Workflow
```
1. Start  → Read .gsd/PROJECT_CONTEXT.md → Check .gsd/TASKS.md
2. Plan   → Follow .gsd/workflows/PLAN.md
3. Execute→ Follow .gsd/workflows/EXECUTE.md
4. Verify → Follow .gsd/workflows/VERIFY.md
5. End    → Update session log in .gsd/sessions/
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Admin** | Full system access — users, tournaments, analytics, reports |
| **Organizer** | Create/manage tournaments, schedule matches, manage sponsors |
| **Player** | Join teams, register for events, view matches |
| **Coach** | Team management and player oversight |
| **Guest** | Browse public pages |

---

## 📁 Project Structure

```
├── Fronted/              # React frontend (Vite)
│   └── src/
│       ├── adminside/    # Admin panel (33 components)
│       ├── screen/       # Public screens (42 components)
│       ├── component/    # Shared UI (Header, Footer)
│       ├── components/   # Specialized (Three.js, Payment)
│       ├── context/      # AuthContext
│       ├── layouts/      # Role-based layouts
│       ├── routes/       # Route guards
│       ├── services/     # API services
│       ├── utils/        # Axios config, socket, validators
│       └── static/       # CSS files
├── backend/              # Express backend
│   ├── config/           # Service configs
│   ├── controllers/      # Business logic
│   ├── middleware/        # Auth, roles, upload
│   ├── models/           # Mongoose schemas (13)
│   ├── routes/           # API routes (14)
│   ├── services/         # External services
│   └── utils/            # Validators, Twilio
└── .gsd/                 # GSD workflow docs
```

---

## 📜 License

ISC
