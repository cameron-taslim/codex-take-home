# VIZ_AGENT_PROMPTS.md

## Recommended Execution Order

1. Run the shared design systems agent first.
2. Then run the landing/login, dashboard, and builder/detail agents in parallel.
3. Finish with a short integration cleanup pass if needed.

## Agent 1: Shared Design System

```text
Read AGENTS.md, plans/project-overview.md, all files in plans/shared/, and VIZ_DESIGN_TASKS.md. Implement only the shared visual system for the redesign. Do not change product behavior or expand MVP scope. Own global tokens, typography, app shell, sidebar, and shared UI primitives. Inspect the existing routes/components/tests first. Before editing, summarize steps, list governing files, and state the smallest local verification path. After editing, report files changed, tests run, browser checks run, and any deviations.
```

### Scope
- `app/globals.css`
- `components/layout/app-shell.tsx`
- shared `components/ui/*`
- any shared layout or navigation components

## Agent 2: Landing + Login

```text
Read AGENTS.md, plans/project-overview.md, all files in plans/shared/, plans/pages/login/page-plan.md, and VIZ_DESIGN_TASKS.md. Implement only the visual redesign for the landing page `/` and the login page `/login`. Follow the shared design system already established; do not redefine tokens or shared primitives unless strictly necessary. Do not change auth behavior or expand scope. Before editing, summarize steps, list governing files, inspect existing routes/components/tests, and state the smallest local verification path. After editing, report files changed, tests run, browser checks run, and any deviations.
```

### Scope
- `app/page.tsx`
- `app/login/page.tsx`
- `components/auth/login-form.tsx`
- any landing-specific components created

## Agent 3: Dashboard

```text
Read AGENTS.md, plans/project-overview.md, all files in plans/shared/, plans/pages/dashboard/page-plan.md, and VIZ_DESIGN_TASKS.md. Implement only the visual redesign for `/dashboard`. Follow the shared design system already established; do not redefine tokens or shared primitives unless strictly necessary. Do not change data behavior or expand scope. Before editing, summarize steps, list governing files, inspect existing routes/components/tests, and state the smallest local verification path. After editing, report files changed, tests run, browser checks run, and any deviations.
```

### Scope
- `app/dashboard/page.tsx`
- `components/dashboard/dashboard-content.tsx`
- related dashboard-only components

## Agent 4: Builder + Detail

```text
Read AGENTS.md, plans/project-overview.md, all files in plans/shared/, plans/pages/experiment-builder/page-plan.md, plans/pages/experiment-detail/page-plan.md, and VIZ_DESIGN_TASKS.md. Implement only the visual redesign for `/experiments/new` and `/experiments/[id]`. Follow the shared design system already established; do not redefine tokens or shared primitives unless strictly necessary. Do not change generation behavior, persistence behavior, or MVP scope. Before editing, summarize steps, list governing files, inspect existing routes/components/tests, and state the smallest local verification path. After editing, report files changed, tests run, browser checks run, and any deviations.
```

### Scope
- `app/experiments/new/page.tsx`
- `components/experiment-builder/builder-form.tsx`
- `app/experiments/[id]/page.tsx`
- `components/experiment-detail/rerun-controls.tsx`
- `components/ui/variant-preview-card.tsx`

## Coordination Rule

Page agents should consume the shared system built by Agent 1.

They should not independently redefine:

- colors
- spacing scale
- border treatment
- radii
- status styling
- shell layout

If a page agent needs a shared primitive change, that should be coordinated back through the shared system rather than copied locally.
