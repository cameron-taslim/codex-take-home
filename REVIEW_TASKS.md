# REVIEW_TASKS.md

## Purpose
This file breaks the current review findings into one-problem-at-a-time tasks for Codex agents. Each task is scoped so one agent can own one issue without redesigning the product or overlapping heavily with other fixes.

All agents must read `AGENTS.md` first.

## Required Task Checklist
Apply this checklist to every implementation task unless the task explicitly says otherwise:

1. read the required planning documents in the order defined by `AGENTS.md`
2. inspect the current implementation for the affected route, components, services, repositories, and tests before editing
3. identify the narrowest local verification path before making changes
4. run local preflight when the task depends on auth, persistence, or browser verification:
   - confirm `.env` exists
   - confirm PostgreSQL is running
   - run `npx prisma db push` if the task uses persisted data
   - run `npm run db:seed` if the task uses demo auth or seeded records
5. implement only the assigned fix
6. update stale automated assertions affected by the change in the same task
7. run the narrowest relevant Vitest coverage
8. run the narrowest relevant Playwright coverage when the task changes visible page behavior or a primary user flow
9. report files changed, tests run, browser checks run, and any blockers or deviations

## Known Local Commands
Use these commands when the task requires them:

- `npx prisma db push`
- `npm run db:seed`
- `npm test`
- `npm run test -- <file>`
- `NEXTAUTH_URL=http://127.0.0.1:3001 npm run dev -- --hostname 127.0.0.1 --port 3001`
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 npx playwright test <spec>`

## Execution Order
Work through these remediation tasks in order:

1. generation failure persistence fix
2. test runner isolation fix
3. Codex default model alignment
4. prompt snapshot persistence coverage
5. browser happy-path coverage
6. not-found recovery action mismatch

If you assign agents in parallel, avoid running tasks 1 and 4 at the same time because both touch generation-service expectations.

## Task 1: Persist Failed Generation Runs
### Goal
Fix the generation service so failed Codex runs are actually persisted and visible in history, matching the append-only storage plan.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/pages/experiment-builder/page-plan.md
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/pages/experiment-detail/page-plan.md

Review the current implementation of the Codex generation flow and fix this issue only:
- failed generation attempts are currently rolled back instead of being persisted as failed runs

Keep the implementation aligned with the shared plans:
- Codex is called server-side only
- each generation attempt creates a persisted run
- failed runs are not discarded
- generation history remains append-only
- experiment status and latest generation pointer remain accurate after failure

Update or add tests so the failure path would catch the current regression.
Do not redesign the generation contract or add new product behavior.
Before editing, summarize your steps.
Identify the narrowest local verification path before editing.
After editing, report files changed, tests run, browser checks run, and any deviations from plan.
```

### Expected Output
- failed generation runs persist
- failure status is recoverable in the UI
- generation history remains append-only
- tests would fail if rollback behavior regresses

## Task 2: Separate Vitest And Playwright Execution
### Goal
Fix the test configuration so `npm test` runs the intended Vitest suite without trying to execute Playwright specs.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/testing-strategy.md

Review the current test configuration and fix this issue only:
- `npm test` currently fails because Vitest includes the Playwright spec under `tests/e2e/`

Make the smallest plan-aligned change so:
- Vitest runs unit, integration, and component tests only
- Playwright remains runnable through the browser test command
- the local verification workflow in AGENTS.md stays practical

Do not redesign the test stack or add unrelated coverage in this task.
Before editing, summarize your steps.
Identify the narrowest local verification path before editing.
After editing, report files changed, tests run, browser checks run, and any deviations from plan.
```

### Expected Output
- `npm test` exits cleanly
- Playwright specs are excluded from Vitest
- browser tests still run through the Playwright command

## Task 3: Align The Default Generation Model With Codex
### Goal
Remove Codex integration drift by making the default server-side provider configuration match the product story when no environment override is present.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/codex-integration.md

Review the current server-side OpenAI provider configuration and fix this issue only:
- the default model value drifts from the planning package's Codex-powered product story

Make the smallest change that keeps the provider server-side and preserves environment override support.
Add or update tests only if needed to lock the expected default behavior.
Do not redesign the provider interface or broaden the integration surface.
Before editing, summarize your steps.
Identify the narrowest local verification path before editing.
After editing, report files changed, tests run, browser checks run, and any deviations from plan.
```

### Expected Output
- the default provider configuration aligns with Codex usage
- environment overrides still work
- no client-side provider drift is introduced

## Task 4: Add Prompt Snapshot Persistence Coverage
### Goal
Harden the generation tests so prompt snapshot persistence and structured input mapping are explicitly verified.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/codex-integration.md
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/testing-strategy.md

Review the current generation-service tests and fix this issue only:
- prompt snapshot persistence is required by the plan but not explicitly asserted in tests

Add or update tests so they verify:
- the structured experiment brief is normalized into the Codex input contract
- the exact prompt snapshot passed to generation-run persistence matches that contract
- failures still avoid malformed partial variant persistence

Do not redesign the generation service unless a minimal testability change is necessary.
Before editing, summarize your steps.
Identify the narrowest local verification path before editing.
After editing, report files changed, tests run, browser checks run, and any deviations from plan.
```

### Expected Output
- generation tests assert prompt snapshot contents
- Codex input-contract drift is easier to catch
- failure-path coverage remains intact

## Task 5: Add Browser Coverage For The Planned Happy Path
### Goal
Expand browser verification so the demo-critical authenticated flow is covered instead of only scaffold states.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/pages/

Review the current Playwright coverage and fix this issue only:
- browser tests do not cover the planned happy path of logging in, creating or using persisted experiment data, triggering generation behavior, and reviewing saved variants on the detail page

Implement the narrowest plan-aligned browser coverage that materially improves demo confidence.
Follow the shared testing strategy:
- do not rely on live external model calls
- prefer seeded or mocked local data paths
- cover the visible primary flow, not just scaffolding

Update supporting fixtures or setup only as needed for this browser path.
Do not redesign the app or add unrelated UI changes.
Before editing, summarize your steps.
Identify the local verification path before editing, including any env, database, seed, or app-server prerequisites.
After editing, report files changed, tests run, browser checks run, and any deviations from plan.
```

### Expected Output
- Playwright covers a meaningful happy path
- browser verification exercises persisted data and detail-page output
- no live external model dependency is introduced

## Task 6: Fix The Experiment Not Found Recovery Action
### Goal
Bring the not-found recovery path in line with its own copy and the dashboard-first navigation plan.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/pages/dashboard/page-plan.md
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/pages/experiment-detail/page-plan.md

Review the current experiment not-found experience and fix this issue only:
- the recovery copy tells the user to return to the dashboard, but the action currently sends them to the new-experiment route

Make the smallest plan-aligned UI change.
Update any stale tests or browser assertions affected by the copy or target route.
Do not redesign the authenticated shell or add extra recovery options.
Before editing, summarize your steps.
Identify the narrowest local verification path before editing.
After editing, report files changed, tests run, browser checks run, and any deviations from plan.
```

### Expected Output
- the recovery action matches the copy and navigation intent
- affected tests are updated
- no unrelated detail-page behavior changes

## Recommended Operating Notes
- After each task, review the result before moving to the next task.
- Keep fixes narrow. These tasks are remediation, not a second implementation pass.
- For user-facing tasks, do not treat the work as complete until the narrow relevant browser check passes locally.
- If Task 1 changes generation-service structure, finish Task 1 before assigning Task 4.
