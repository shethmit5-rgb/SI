# 📝 Task Tracker

> **Project:** React College Tournament Platform
> **Last Updated:** 2026-06-06

---

## 🔴 Priority: Critical

- [ ] **[BACKEND]** Remove `lucide-react` from backend `package.json` — frontend-only dependency leaking into backend
- [ ] **[SECURITY]** Add rate limiting middleware to backend API endpoints
- [ ] **[SECURITY]** Add input sanitization beyond express-validator (XSS protection)
- [ ] **[BACKEND]** Add proper error handling for uncaught promise rejections in server.js

---

## 🟠 Priority: High

- [ ] **[TESTING]** Set up Vitest for frontend unit testing
- [ ] **[TESTING]** Set up Jest + Supertest for backend API testing
- [ ] **[TESTING]** Write auth flow tests (login, register, token verification)
- [ ] **[FRONTEND]** Implement React.lazy() code splitting for admin routes
- [ ] **[FRONTEND]** Lazy-load Three.js canvas (heavy bundle impact)
- [ ] **[BACKEND]** Add API versioning prefix (`/api/v1/`)
- [ ] **[BACKEND]** Implement refresh token rotation (currently JWT only)

---

## 🟡 Priority: Medium

- [ ] **[REFACTOR]** Rename `Fronted/` → `Frontend/` (fix typo)
- [ ] **[CLEANUP]** Remove or integrate `cognisun/` module (currently commented out)
- [ ] **[CLEANUP]** Remove stale `all router.txt` file from `src/`
- [ ] **[FRONTEND]** Add loading skeletons for data-heavy pages
- [ ] **[FRONTEND]** Add toast notification system (replace alerts)
- [ ] **[FRONTEND]** Add empty state UI for lists with no data
- [ ] **[FRONTEND]** Standardize component naming (e.g., `Adminsponser` → `AdminSponsor`)
- [ ] **[BACKEND]** Add request logging middleware (morgan or custom)
- [ ] **[BACKEND]** Implement pagination for list endpoints
- [ ] **[DOCS]** Create API documentation (Swagger/OpenAPI)

---

## 🟢 Priority: Low

- [ ] **[FEATURE]** Add tournament bracket visualization
- [ ] **[FEATURE]** Add PDF/CSV export for reports
- [ ] **[FEATURE]** Add team chat/messaging feature
- [ ] **[FEATURE]** Add push notifications (PWA service worker)
- [ ] **[FEATURE]** Add OAuth login (Google/Microsoft)
- [ ] **[DEVOPS]** Create Docker Compose setup
- [ ] **[DEVOPS]** Set up CI/CD with GitHub Actions
- [ ] **[DEVOPS]** Add pre-commit hooks (lint, format)
- [ ] **[UX]** Accessibility audit (WCAG 2.1 AA)
- [ ] **[UX]** Cross-browser testing (Safari, Firefox, Edge)

---

## ✅ Completed

- [x] **[SETUP]** GSD workflow initialized — 2026-06-06
- [x] **[SETUP]** Project context documented — 2026-06-06
- [x] **[SETUP]** PRD created with feature checklist — 2026-06-06
- [x] **[SETUP]** Roadmap created with phase tracking — 2026-06-06
- [x] **[SETUP]** Architecture documented — 2026-06-06

---

## Task Template

```markdown
- [ ] **[CATEGORY]** Brief description of the task
  - Context: Why this matters
  - Acceptance: What "done" looks like
  - Files: Which files are affected
```
