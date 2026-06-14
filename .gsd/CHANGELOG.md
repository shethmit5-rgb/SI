# 📜 Changelog

> **Project:** React College Tournament Platform
> All notable changes to this project will be documented in this file.

---

## [Unreleased]

### Added
- GSD workflow initialization with full project documentation
- Project context file (`.gsd/PROJECT_CONTEXT.md`)
- Product Requirements Document (`.gsd/specs/PRD.md`)
- Architecture Decision Records (`.gsd/specs/ARCHITECTURE.md`)
- Project roadmap (`.gsd/ROADMAP.md`)
- Task tracker (`.gsd/TASKS.md`)
- Planning, execution, and verification workflow configs
- Daily workflow guide

---

## [1.0.0] — 2026-06-06 (Baseline)

### Features (Existing at GSD Setup)
- **Auth**: JWT login, email-verified registration, password reset
- **Tournaments**: Full CRUD, organizer management
- **Teams**: Create, join, captain approval, roster management
- **Matches**: Scheduling, real-time scoring, results
- **Registrations**: Team registration with approval workflow
- **Payments**: Razorpay integration for entry fees
- **Admin Panel**: Dashboard, user management, analytics, reports
- **Notifications**: Real-time (Socket.IO), email (Nodemailer), SMS (Twilio)
- **Sponsors**: CRUD with financial tracking and charts
- **Public Pages**: Home (Three.js), events, schedule, gallery, contact, etc.
- **Role System**: Admin, Organizer, Player, Coach, Guest layouts

### Tech Stack
- React 18.2 + Vite 7.2 (Frontend)
- Express 5.2 + Mongoose 9.1 (Backend)
- MongoDB Atlas (Database)
- Socket.IO 4.8 (Real-time)
- Cloudinary (Media storage)
