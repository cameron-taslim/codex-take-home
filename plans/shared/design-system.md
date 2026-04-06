# Design System Plan

## Goal
Keep page implementation consistent across agents while still aiming for a polished, demo-friendly UI.

## Visual Direction
The product should look like an internal eCommerce growth tool, not a generic starter app. The UI should feel structured, fast, and credible.

Design principles:

- clean but not sterile
- commercially relevant
- strong hierarchy around experiment status and generated output
- clear distinction between input forms and preview surfaces

## Layout Patterns
### App shell
Authenticated pages should use a shared shell with:

- top navigation or compact header
- page title area
- consistent content width
- clear placement for logout and primary actions

### Two-panel layouts
The builder and detail pages should favor split layouts where appropriate:

- left side for metadata, forms, or controls
- right side for generated preview or comparison

This supports a more compelling demo than stacked forms alone.

## Shared Components
Implementation should converge on a small set of reusable primitives:

- page header
- primary and secondary buttons
- form field wrapper
- status badge
- empty state panel
- error banner
- loading placeholder or skeleton
- experiment summary card or row
- variant preview card

## Form Conventions
- Labels are always visible.
- Required fields are marked consistently.
- Validation errors appear inline near the field and optionally as a form-level summary.
- Primary actions use stable naming: `Save Draft`, `Generate Output`, `Regenerate`.

## Status Language
Use a small consistent vocabulary:

- Draft
- Generating
- Generated
- Failed

Status appearance should be visually distinct and reused across dashboard and detail views.

## Preview Behavior
The preview surface should not attempt full arbitrary page rendering in MVP. Instead, use structured preview cards or panels driven by saved variant fields:

- headline
- subheadline
- body copy
- CTA
- layout notes
- bounded sanitized `htmlContent`

This keeps the UI safe, consistent, and demoable.

## Responsive Expectations
- Login must work cleanly on mobile and desktop.
- Dashboard cards or rows should collapse gracefully.
- Builder and detail split panes may stack vertically on small screens.
- Primary actions must remain accessible without relying on hover-only interactions.

## Content Priorities By Page
### Dashboard
Prioritize scanability:

- experiment name
- status
- page type
- last updated time

### Builder
Prioritize form clarity and action confidence:

- required inputs first
- supporting fields second
- generation action visually prominent

### Detail
Prioritize the latest generated output and rerun controls:

- experiment metadata summary
- latest generated output
- rerun controls

## Accessibility Baseline
- keyboard-accessible navigation and controls
- visible focus states
- semantic form inputs and labels
- error messages that are readable by assistive technology

## Acceptance Criteria
- Shared UI patterns are consistent across page implementations.
- Builder and detail pages feel visually related.
- Status, error, and loading states use the same component language.
- The product looks intentionally designed for an eCommerce workflow demo.
