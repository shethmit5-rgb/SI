# ✅ Verification Workflow

> **When to use:** After completing any task, before marking it done.

---

## Verification Checklist

### 1. Code Quality

- [ ] **No console errors** — Check browser DevTools console
- [ ] **No server errors** — Check backend terminal for unhandled errors
- [ ] **ESLint passes** — Run `npx eslint src/` in the Fronted directory
- [ ] **No unused imports** — Remove dead imports from changed files
- [ ] **No hardcoded values** — URLs, ports, API keys should use env/config
- [ ] **Consistent naming** — Follow project conventions (camelCase components, PascalCase files)

### 2. Functionality

- [ ] **Happy path works** — Core feature works as expected
- [ ] **Edge cases handled** — Empty data, invalid input, unauthorized access
- [ ] **Error states work** — Show user-friendly error messages
- [ ] **Loading states work** — Show spinners/skeletons while fetching data
- [ ] **Auth-protected routes guarded** — Unauthenticated users redirected to login

### 3. Cross-Cutting Concerns

- [ ] **Frontend ↔ Backend** — If change spans both, verify integration
- [ ] **Real-time updates** — If Socket.IO events changed, verify all listeners
- [ ] **Role-based access** — Test with different user roles (admin, organizer, player)
- [ ] **Navigation** — All links and redirects work correctly

### 4. Visual/UX

- [ ] **Mobile responsive** — Resize browser to check responsiveness
- [ ] **Dark mode** — If theme toggle exists, check both modes
- [ ] **Consistent styling** — New UI matches existing design language
- [ ] **No layout overflow** — No horizontal scroll or overlapping elements

### 5. Data Integrity

- [ ] **Database operations** — Verify data is correctly saved/updated/deleted
- [ ] **Cascading effects** — Deleting a parent doesn't orphan children
- [ ] **Validation** — Backend rejects invalid data with proper error messages
- [ ] **Duplicate handling** — System handles duplicate submissions gracefully

---

## Verification Commands

```bash
# Frontend checks
cd Fronted
npx eslint src/                      # Lint check
npm run build                         # Build check (catches import errors)

# Backend checks
cd backend
node -c server.js                     # Syntax check
# Start server and hit health endpoint:
curl http://localhost:5000/health

# Quick smoke test (backend running)
curl http://localhost:5000/            # Should return "Backend is running 🚀"
```

---

## Manual Test Scenarios

### Auth Flow
```
1. Register new account → verify email received → login works
2. Login with wrong password → error message shown
3. Access /admin/* without admin role → redirected
4. Access /my-teams as organizer → blocked correctly
5. Token expiry → user logged out gracefully
```

### Tournament Flow
```
1. Create tournament → appears in list
2. Register team for tournament → registration pending
3. Approve registration → team appears in tournament
4. Schedule match → appears in schedule view
5. Update match score → real-time update on other clients
```

### Admin Flow
```
1. View dashboard → stats load correctly
2. Manage users → CRUD operations work
3. Analytics → charts render with real data
4. Generate report → data exports correctly
```

---

## Post-Verification

After all checks pass:

```markdown
1. ✅ Mark task complete in .gsd/TASKS.md
2. ✅ Update session log with verification results
3. ✅ Add to .gsd/CHANGELOG.md if user-facing
4. ✅ Commit with descriptive message
5. ✅ Push to remote repository
```
