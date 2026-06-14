# 🚀 Execution Workflow

> **When to use:** While actively building/coding a task.

---

## Execution Principles

1. **One task at a time** — Complete before context-switching
2. **Small commits** — Commit after each logical unit of work
3. **Test as you go** — Don't save all testing for the end
4. **Document decisions** — If you make a design choice, log it
5. **Update status** — Keep TASKS.md and session log current

---

## Step 1: Start the Dev Servers

```bash
# Terminal 1 — Frontend
cd Fronted
npm run dev
# → http://localhost:5173

# Terminal 2 — Backend
cd backend
npm start
# → http://localhost:5000
# Or for auto-reload:
npx nodemon server.js
```

## Step 2: Code with Structure

### Frontend Changes
```
1. Create/modify component in appropriate directory:
   - Public screen → src/screen/
   - Admin component → src/adminside/
   - Shared component → src/component/ or src/components/
   - Layout → src/layouts/
   - Route guard → src/routes/

2. Create CSS file in src/static/ for new screens

3. Add route in App.jsx if it's a new page

4. Use existing patterns:
   - Auth check: useAuth() hook from context/AuthContext.jsx
   - API calls: import api from '../utils/axiosConfig'
   - Socket: import socket from '../utils/socket'
   - Validation: use validators from utils/validators.js
```

### Backend Changes
```
1. Data model → models/ModelName.js (Mongoose schema)
2. Route handler → routes/routerName.js (Express router)
3. Controller logic → controllers/controllerName.js
4. Middleware → middleware/middlewareName.js
5. Config → config/configName.js
6. Utilities → utils/utilName.js

7. Register route in server.js:
   app.use("/api/your-route", require("./routes/yourRouter"));

8. Use existing patterns:
   - Auth: require("./middleware/authMiddleware")
   - Roles: require("./middleware/roleMiddleware")
   - Upload: require("./middleware/upload")
```

## Step 3: Commit Pattern

```bash
# Commit message format
git add .
git commit -m "[CATEGORY] Brief description of change"

# Categories:
# [FEAT]     — New feature
# [FIX]      — Bug fix
# [REFACTOR] — Code restructuring
# [STYLE]    — CSS/UI changes
# [DOCS]     — Documentation
# [TEST]     — Tests
# [CHORE]    — Config, deps, tooling
# [PERF]     — Performance improvement
# [SECURITY] — Security fix

# Examples:
git commit -m "[FEAT] Add tournament bracket visualization"
git commit -m "[FIX] Fix team join button showing for organizers"
git commit -m "[STYLE] Improve mobile layout for match list"
```

## Step 4: Update Tracking

After completing work:

```markdown
1. Mark task as [x] in .gsd/TASKS.md
2. Update session log with what was accomplished
3. If user-facing change: add entry to .gsd/CHANGELOG.md
4. If architecture decision: add ADR to .gsd/specs/ARCHITECTURE.md
5. If phase milestone completed: update .gsd/ROADMAP.md
```

---

## Quick Reference: File Locations

| What | Where |
|------|-------|
| Add a new public page | `Fronted/src/screen/PageName.jsx` + `Fronted/src/static/PageName.css` + route in `App.jsx` |
| Add an admin page | `Fronted/src/adminside/PageName.jsx` + wrap in `<AdminRoute>` in `App.jsx` |
| Add an API endpoint | `backend/routes/routerName.js` + register in `server.js` |
| Add a data model | `backend/models/ModelName.js` |
| Add middleware | `backend/middleware/middlewareName.js` |
| Configure a service | `backend/config/serviceName.js` |
| Add env variable | `backend/.env` + document in PROJECT_CONTEXT.md |
| Add frontend utility | `Fronted/src/utils/utilName.js` |
