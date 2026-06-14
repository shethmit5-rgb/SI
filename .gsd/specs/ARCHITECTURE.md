# 📐 Architecture Decision Records

> **Project:** React College Tournament Platform
> **Last Updated:** 2026-06-06

---

## ADR-001: Monorepo with Separate Package Managers

**Status:** Accepted
**Date:** 2026-06-06

### Context
The project uses a monorepo structure with `Fronted/` and `backend/` as sibling directories, each with their own `package.json` and `node_modules`.

### Decision
Keep the current structure. Each sub-project manages its own dependencies independently.

### Consequences
- ✅ Clear separation of concerns
- ✅ Can deploy frontend and backend independently
- ⚠️ No shared code between frontend and backend
- ⚠️ Must run `npm install` in both directories

---

## ADR-002: JWT-Only Authentication (No Refresh Tokens)

**Status:** Accepted (with planned improvement)

### Context
Authentication uses a single JWT stored in localStorage. No refresh token mechanism exists.

### Decision
Keep JWT-only for now, but add refresh token rotation in Phase 5.

### Consequences
- ✅ Simple implementation
- ⚠️ Token theft vulnerability (localStorage)
- ⚠️ No graceful session extension
- 📋 TODO: Migrate to httpOnly cookie + refresh token

---

## ADR-003: Socket.IO for Real-Time Communication

**Status:** Accepted

### Context
Live score updates and notifications need real-time delivery.

### Decision
Use Socket.IO on both server and client for bidirectional real-time communication.

### Consequences
- ✅ Reliable WebSocket with HTTP fallback
- ✅ Room-based broadcasting for analytics
- ✅ User-specific socket registration
- ⚠️ Requires maintaining user-socket mapping in memory

---

## ADR-004: CSS-Per-Component Styling Strategy

**Status:** Accepted

### Context
Each screen/component has its own CSS file stored in the `static/` directory.

### Decision
Continue with vanilla CSS per component. No CSS-in-JS or Tailwind.

### Consequences
- ✅ No build-time CSS processing overhead
- ✅ Familiar to all developers
- ⚠️ Risk of class name conflicts (no scoping)
- ⚠️ Code duplication across CSS files

---

## ADR-005: Cloudinary for Media Storage

**Status:** Accepted

### Context
User avatars, team logos, and sponsor logos need persistent storage.

### Decision
Use Cloudinary via `multer-storage-cloudinary` for all media uploads.

### Consequences
- ✅ CDN-backed image delivery
- ✅ Automatic image optimization
- ✅ No local storage management needed
- ⚠️ External service dependency
- ⚠️ Free tier limits may affect scaling

---

## ADR-006: No TypeScript

**Status:** Accepted

### Context
The project is built entirely in JavaScript without TypeScript.

### Decision
Maintain JavaScript-only for development velocity. Consider TypeScript migration for Phase 6.

### Consequences
- ✅ Lower barrier to entry for contributors
- ✅ Faster development iteration
- ⚠️ No compile-time type checking
- ⚠️ Harder to maintain as codebase grows
