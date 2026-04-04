# TASKS.md

## Purpose
This file breaks the project into a practical execution sequence for Codex agents. Each task is scoped so an agent can work independently without redesigning the product.

All agents must read `AGENTS.md` first.

## Execution Order
Work through these tasks in order:

1. shared foundations
2. login page
3. dashboard page
4. experiment builder page
5. experiment detail page
6. integration and test hardening
7. final review

Do not start page-specific work until the shared foundations task is complete.

## Task 1: Shared Foundations
### Goal
Set up the application skeleton and all cross-cutting systems required by the page agents.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/

Implement only the shared foundations needed for the project:
- app scaffold and route structure
- auth/session setup
- Prisma schema and persistence layer
- server-side Codex generation service boundary
- shared layout and reusable UI primitives
- test setup

Do not implement page-specific product features beyond what is needed to support the shared foundation.
Before editing, summarize your implementation steps.
After editing, report files changed, tests run, and any deviations from the plan.
```

### Expected Output
- app routes and shell exist
- auth foundation exists
- Prisma schema and database layer exist
- Codex integration boundary exists
- shared UI primitives exist
- baseline test setup exists

## Task 2: Login Page
### Goal
Implement the public login page and auth entry flow.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/pages/login/page-plan.md

Implement only the login page and its tests.
Do not redesign auth or expand scope.
Before editing, summarize your steps.
After editing, report files changed, tests run, and any deviations from plan.
```

### Expected Output
- `/login` works
- authenticated users redirect away from login
- invalid login state is handled
- tests cover login behavior

## Task 3: Dashboard Page
### Goal
Implement the authenticated experiment list page and create-new entry point.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/pages/dashboard/page-plan.md

Implement only the dashboard page and its tests.
Consume persisted experiment summary data from the shared model.
Do not add analytics, filters, or extra features not in the plan.
Before editing, summarize your steps.
After editing, report files changed, tests run, and any deviations from plan.
```

### Expected Output
- `/dashboard` is protected
- persisted experiments render correctly
- empty state exists
- create-new action routes to the builder
- tests cover dashboard states

## Task 4: Experiment Builder Page
### Goal
Implement the structured experiment creation flow and Codex-triggered generation entry point.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/pages/experiment-builder/page-plan.md

Implement only the experiment builder page and its tests.
Use the shared Codex integration contract and shared persistence model.
Do not invent new input fields or change generation behavior outside the plan.
Before editing, summarize your steps.
After editing, report files changed, tests run, and any deviations from plan.
```

### Expected Output
- `/experiments/new` is protected
- structured experiment inputs exist
- save draft works
- generate variants triggers the server-side Codex flow
- tests cover validation, persistence, and generation states

## Task 5: Experiment Detail Page
### Goal
Implement variant review, generation history, and rerun behavior.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/pages/experiment-detail/page-plan.md

Implement only the experiment detail page and its tests.
Use persisted generation history and latest saved variants.
Do not add extra analytics or unsupported preview rendering.
Before editing, summarize your steps.
After editing, report files changed, tests run, and any deviations from plan.
```

### Expected Output
- `/experiments/[id]` is protected
- latest saved variants render correctly
- generation history is visible
- rerun creates a new generation run
- tests cover success, failure, and ownership behavior

## Task 6: Integration And Test Hardening
### Goal
Connect the full flow and close remaining gaps against the plan.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md first.

Then read:
- /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/project-overview.md
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/shared/
- all files in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/pages/

Your job is integration cleanup only:
- fix cross-page inconsistencies
- complete missing required tests from the testing plan
- verify auth protection, persistence, generation flow, and rerun flow
- improve loading, error, and empty states where needed to match the plan

Do not expand scope or redesign features.
Before editing, summarize your steps.
After editing, report files changed, tests run, and any deviations from plan.
```

### Expected Output
- the primary user flow works end to end
- required tests from the plan exist
- cross-page state and navigation are consistent
- error and loading behavior match the planning docs

## Task 7: Final Review
### Goal
Review the implementation against the planning package and identify any remaining issues before demo prep.

### Prompt
```text
Read /Users/ctaslim/IdeaProjects/CodexTakeHome/AGENTS.md and the full planning package in /Users/ctaslim/IdeaProjects/CodexTakeHome/plans/.

Review the current implementation against the plans.
Prioritize:
- behavioral mismatches
- missing tests
- auth or data isolation issues
- Codex integration drift
- UI/state gaps that would weaken the demo

Do not implement changes unless asked.
Return findings first, ordered by severity, with file references.
```

### Expected Output
- a review report with concrete findings
- file references for issues
- clear identification of anything still blocking submission quality

## Recommended Operating Notes
- After each task, review the result before moving to the next task.
- Use one coordinating agent or person to manage shared systems and final integration.
- Avoid parallel page implementation until shared foundations are stable.
- If you parallelize later, `login` and `dashboard` are safer to run before `experiment-builder` and `experiment-detail`.
