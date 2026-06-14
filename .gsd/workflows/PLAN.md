# 🎯 Planning Workflow

> **When to use:** Before starting any new feature, refactor, or significant change.

---

## Step 1: Load Context

```
1. Read .gsd/PROJECT_CONTEXT.md to understand current architecture
2. Read .gsd/TASKS.md to check existing backlog
3. Read .gsd/ROADMAP.md to understand where this fits in the roadmap
4. Check .gsd/CHANGELOG.md for recent changes that may affect your work
```

## Step 2: Define the Work

Answer these questions before writing any code:

```markdown
### What am I building?
> (Clear, one-sentence description)

### Why does it matter?
> (Business justification or technical necessity)

### Which files will be affected?
> (List specific files — both frontend and backend if applicable)

### What are the risks?
> (What could break? What are the edge cases?)

### How will I verify it works?
> (Specific test steps)

### What's the estimated effort?
> (Small: <1hr | Medium: 1-4hr | Large: 4-8hr | Epic: multi-day)
```

## Step 3: Check Dependencies

```
1. Does this require a new npm package? → Document in plan
2. Does this require a database schema change? → Document migration steps
3. Does this require new environment variables? → Document in plan
4. Does this affect other features? → List impact areas
5. Does this need a new API endpoint? → Document route + controller plan
```

## Step 4: Create Session Log

Create a new file in `.gsd/sessions/` with today's date:

```
.gsd/sessions/YYYY-MM-DD.md
```

Use the session template from `.gsd/templates/SESSION_TEMPLATE.md`.

## Step 5: Update Task Tracker

Before starting, ensure your task is tracked in `.gsd/TASKS.md`:
- Add it if it doesn't exist
- Assign a priority level
- Add context notes

---

## Planning Checklist

- [ ] Read project context
- [ ] Checked existing tasks
- [ ] Defined the work clearly
- [ ] Identified affected files
- [ ] Checked dependencies
- [ ] Created session log
- [ ] Updated task tracker
- [ ] Ready to execute ✅
