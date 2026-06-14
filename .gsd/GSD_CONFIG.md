# ⚙️ GSD Configuration

> Master configuration for the Get Shit Done workflow

---

## Project Identity

```yaml
project_name: "React College Tournament Platform"
project_type: "full-stack-web-app"
version: "1.0.0"
created: "2026-06-06"
repository: "react-clg-tournament-main"
```

## Directory Structure

```yaml
gsd_root: ".gsd/"
paths:
  context: "PROJECT_CONTEXT.md"       # Codebase understanding for AI/devs
  roadmap: "ROADMAP.md"               # Phased milestone tracking
  tasks: "TASKS.md"                   # Active task backlog
  changelog: "CHANGELOG.md"           # Version history

  specs: "specs/"                     # Specifications directory
  specs_prd: "specs/PRD.md"           # Product requirements
  specs_arch: "specs/ARCHITECTURE.md" # Architecture decisions

  workflows: "workflows/"            # Workflow definitions
  workflow_plan: "workflows/PLAN.md"
  workflow_execute: "workflows/EXECUTE.md"
  workflow_verify: "workflows/VERIFY.md"

  sessions: "sessions/"              # Session logs (daily work tracking)
  templates: "templates/"            # Reusable templates
```

## Tech Stack Reference

```yaml
frontend:
  framework: "React 18.2"
  build_tool: "Vite 7.2"
  language: "JavaScript (JSX)"
  styling: "Vanilla CSS (per-component)"
  state: "React Context API"
  routing: "React Router DOM 6"
  http: "Axios"
  realtime: "Socket.IO Client"
  directory: "Fronted/"
  dev_command: "npm run dev"
  build_command: "npm run build"
  dev_port: 5173

backend:
  framework: "Express 5.2"
  runtime: "Node.js"
  language: "JavaScript (CommonJS)"
  database: "MongoDB (Mongoose 9.1)"
  auth: "JWT + bcryptjs"
  realtime: "Socket.IO"
  directory: "backend/"
  start_command: "npm start"
  dev_command: "npx nodemon server.js"
  port: 5000

services:
  media: "Cloudinary"
  payments: "Razorpay"
  email: "Nodemailer"
  sms: "Twilio"
```

## Workflow Rules

```yaml
planning:
  - Always read PROJECT_CONTEXT.md before starting work
  - Check TASKS.md for existing items before creating new ones
  - Update ROADMAP.md when completing phase milestones
  - Create session log for each working session

execution:
  - One task at a time — complete before moving to next
  - Commit after each meaningful change
  - Update TASKS.md as items are completed
  - Log decisions in ARCHITECTURE.md if they affect design

verification:
  - Test changes manually before marking complete
  - Check both frontend and backend if change spans both
  - Verify no console errors in browser
  - Run ESLint on changed frontend files
  - Update CHANGELOG.md for user-facing changes

session:
  - Start: Read context → check tasks → pick item → create session log
  - During: Execute → test → commit → update task status
  - End: Update session log → push commits → update changelog if needed
```
