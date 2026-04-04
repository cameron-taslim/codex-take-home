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

While editing:

- stay within the assigned scope
- prefer minimal, direct changes that satisfy the plan
- do not silently change architecture or product behavior

After editing:

- report files changed
- report tests run
- report blockers, assumptions, or deviations from plan

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

`Read plans/project-overview.md, all files in plans/shared/, and the relevant page plan in plans/pages/. Implement only that scope. Do not redesign the product or expand scope. Before editing, summarize steps. After editing, report files changed, tests run, and any deviations from plan.`
