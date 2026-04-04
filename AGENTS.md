# AGENTS.md

## Purpose
This repository uses a planning-first workflow. Before implementing anything, agents must read the planning documents in `plans/` and treat them as the source of truth for product scope, architecture, shared systems, and page behavior.

The goal is to build the project exactly to the approved plan, with minimal scope drift and clear agent boundaries.

## Read Order
Every implementation agent must read files in this order before making changes:

1. `plans/project-overview.md`
2. every file in `plans/shared/`
3. the relevant file in `plans/pages/`

If an agent is only working on one page, it still must read the shared plans first.

## Source Of Truth
Use these rules when documents overlap:

- `plans/project-overview.md` defines product intent, scope, stack, and implementation order.
- `plans/shared/` defines architecture, auth, persistence, Codex integration, testing, and UI conventions.
- `plans/pages/<page>/page-plan.md` defines the implementation details for that specific page.

If a page plan conflicts with a shared plan, follow the shared plan and explicitly report the conflict.

## Scope Rules
- Do not redesign the product.
- Do not add features outside the MVP defined in the plans.
- Do not introduce new user roles, workspace models, analytics systems, or deployment features unless the plan is updated first.
- Keep Codex integration aligned with the structured generation workflow described in `plans/shared/codex-integration.md`.

## Execution Model
Prefer narrow, well-scoped implementation tasks.

Recommended order:

1. shared systems and app scaffold
2. login page
3. dashboard page
4. experiment builder page
5. experiment detail page
6. integration cleanup and tests

Shared systems work includes:

- app shell and routes
- authentication
- Prisma schema and persistence contracts
- Codex server-side generation flow
- shared UI primitives

Page agents should not redefine shared data models or auth behavior.

## Required Working Style
Before editing:

- summarize the implementation steps you intend to take
- identify which plan files govern the task
- inspect the existing route, components, and tests that already cover the assigned scope
- determine the smallest local verification path required for the task

While editing:

- stay within the assigned scope
- prefer minimal, direct changes that satisfy the plan
- do not silently change architecture or product behavior

After editing:

- report files changed
- report tests run
- report blockers, assumptions, or deviations from plan

## Local Verification Workflow
Agents are expected to verify their work locally, not only by code inspection.

Before or during implementation, use the smallest relevant subset of this workflow:

1. confirm `.env` exists and has the expected local values
2. confirm PostgreSQL is running and reachable at `localhost:5432`
3. run `npx prisma db push` when the task depends on persisted data
4. run `npm run db:seed` when the task depends on demo auth or seeded records
5. run the narrowest relevant Vitest command for changed behavior
6. run the narrowest relevant Playwright spec when the task changes visible page behavior or primary user flows

If a task changes visible UI copy, update any affected browser tests in the same task.

## Local Services Assumption
Unless the plans say otherwise, agents should assume the following local development contract:

- PostgreSQL is expected locally at `localhost:5432`
- Prisma uses `DATABASE_URL` from `.env`
- demo authentication uses `AUTH_DEMO_EMAIL` and `AUTH_DEMO_PASSWORD` from `.env`
- Playwright should target a known local app URL, preferably `http://127.0.0.1:3001`
- auth-related browser checks may require `NEXTAUTH_URL` to match the local app URL used for the session

## Done Criteria For Page Work
Page work is not complete until all of the following are true:

- the implementation matches the relevant page plan and shared plans
- targeted automated tests for the changed behavior pass
- targeted browser verification passes when the page UI or primary interaction changed
- any stale assertions affected by UI copy or route behavior were updated

## Sandbox And Escalation Notes
In this environment, agents should expect some local verification commands to require escalation outside the sandbox.

Common examples:

- `docker` commands used to check or start PostgreSQL
- `npx prisma db push`
- `npm run db:seed`
- `npm run dev` when hosting the app for browser verification
- `npx playwright test`

## Testing Expectations
Agents must add or update tests when implementing planned functionality.

At minimum, align with `plans/shared/testing-strategy.md`.

Do not rely on live external model calls in tests. Mock Codex responses at the service boundary.

## Codex Integration Rules
- Codex must be invoked from server-side application code only.
- Client components must not call model providers directly.
- Persist both generation inputs and generated outputs as described in the plans.
- Preserve generation history across reruns.

## UI Consistency Rules
Use `plans/shared/design-system.md` for:

- layout conventions
- shared component patterns
- status vocabulary
- loading and error behavior
- preview rendering constraints

Do not invent page-specific visual systems that conflict with the shared design direction.

## When To Stop And Ask
Stop and ask for clarification only if:

- the plan documents contain a real contradiction that blocks implementation
- a required dependency or environment constraint makes the planned approach impossible
- implementing the task safely requires a product decision not covered in the plans

Otherwise, proceed with the best plan-aligned implementation.

## Preferred Prompt Pattern For Future Agents
Use prompts like:

`Read plans/project-overview.md, all files in plans/shared/, and the relevant page plan in plans/pages/. Implement only that scope. Do not redesign the product or expand scope. Before editing, summarize steps and identify the local verification path. After editing, report files changed, tests run, browser checks run, and any deviations from plan.`
