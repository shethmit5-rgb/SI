# 📋 Product Requirements Document (PRD)

> **Project:** React College Tournament Platform
> **Version:** 1.0.0
> **Last Updated:** 2026-06-06
> **Status:** In Development

---

## 1. Vision Statement

Build a comprehensive, real-time college sports tournament management platform that digitizes the entire event lifecycle — from tournament creation and team registration to live match scoring and sponsor management — serving administrators, organizers, players, and spectators.

---

## 2. Target Users

| Persona | Description | Primary Goals |
|---------|-------------|---------------|
| **College Admin** | IT/sports department staff | Manage all tournaments, users, venues, and analytics |
| **Tournament Organizer** | Faculty/student organizers | Create events, schedule matches, manage sponsors |
| **Player/Athlete** | College students | Register, join teams, track matches and results |
| **Coach** | Team coaches | Manage team roster, strategy, performance tracking |
| **Spectator/Guest** | General visitors | Browse events, view schedules, check results |

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization
- [x] Email + password login with JWT
- [x] Email-verified registration (OTP)
- [x] Password reset via email
- [x] Role-based access control (Admin, Organizer, Player, Coach)
- [x] Persistent session via localStorage
- [ ] OAuth (Google/Microsoft) login
- [ ] Session timeout & refresh token

### 3.2 Tournament Management
- [x] Create tournament with details (name, sport, dates, rules)
- [x] Edit tournament settings
- [x] List/browse all tournaments
- [x] Tournament detail view with registration info
- [x] Organizer dashboard for own tournaments
- [ ] Tournament brackets visualization
- [ ] Automatic seeding

### 3.3 Team Management
- [x] Create team with name and details
- [x] Join existing teams
- [x] Captain approval workflow for join requests
- [x] Team detail view with roster
- [x] Edit team information
- [x] My Teams dashboard
- [ ] Team chat/messaging
- [ ] Player statistics tracking

### 3.4 Match Management
- [x] Schedule matches with date, time, venue
- [x] Real-time score updates (Socket.IO)
- [x] Match results recording
- [x] Organizer match management panel
- [x] Match list with filtering
- [ ] Live commentary feed
- [ ] Match photo/video uploads

### 3.5 Registration System
- [x] Team registration for tournaments
- [x] Registration approval workflow
- [x] My Registrations view
- [x] Payment integration (Razorpay) for entry fees
- [ ] Waitlist management
- [ ] Bulk registration

### 3.6 Admin Panel
- [x] Dashboard with key metrics
- [x] User management (CRUD, role changes)
- [x] Tournament management
- [x] Match management
- [x] Team management
- [x] Sport management
- [x] Venue management
- [x] Sponsor management
- [x] Registration management
- [x] Analytics dashboard (charts, real-time stats)
- [x] Reports generation
- [x] Admin profile management
- [ ] Audit log viewer
- [ ] System settings

### 3.7 Notifications
- [x] Real-time in-app notifications (Socket.IO)
- [x] Email notifications (Nodemailer)
- [x] SMS notifications (Twilio)
- [x] Notification bell with unread count
- [ ] Push notifications (PWA)
- [ ] Notification preferences

### 3.8 Public Pages
- [x] Home page with hero section (Three.js animated background)
- [x] Events listing
- [x] Schedule calendar
- [x] Speakers/guests page
- [x] Gallery
- [x] Venue information
- [x] Sponsor showcase
- [x] Contact form
- [x] About us, FAQ, Terms, Privacy pages
- [x] Leaderboard
- [ ] Blog/news section

---

## 4. Non-Functional Requirements

| Category | Requirement | Status |
|----------|-------------|--------|
| **Performance** | Page load < 3s on 3G | ⚠️ Needs testing |
| **Scalability** | Support 500+ concurrent users | ⚠️ Not load-tested |
| **Security** | OWASP Top 10 compliance | ⚠️ Partial |
| **Accessibility** | WCAG 2.1 AA | ❌ Not audited |
| **Browser Support** | Chrome, Firefox, Safari, Edge | ⚠️ Not tested |
| **Mobile** | Responsive design | ✅ CSS exists |
| **Real-time** | < 500ms latency for live scores | ✅ Socket.IO |
| **Uptime** | 99.5% availability | ⚠️ No monitoring |

---

## 5. Data Models Summary

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| **User** | name, email, password, role, college, phone, avatar | → Teams, Registrations |
| **Team** | teamName, captain, members, status | → Users, Tournaments |
| **Tournament** | eventName, sport, dates, rules, organizer | → Matches, Teams |
| **Match** | teams, scores, date, venue, status, tournament | → Teams, Venue, Tournament |
| **Registration** | team, tournament, status, paymentStatus | → Team, Tournament |
| **Sport** | name | → Tournaments |
| **Venue** | name | → Matches |
| **Sponsor** | name, amount, logo, status | → Tournament (via organizer) |
| **Transaction** | amount, user, type, razorpayId | → User |
| **Notification** | title, message, user, read | → User |
| **AuditLog** | action, user, details, timestamp | → User |
| **PendingUser** | name, email, otp, otpExpiry | Temp → User |
| **Cog** | (Cognisun integration fields) | Standalone |
