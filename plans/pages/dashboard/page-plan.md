# Dashboard Page Plan

## Purpose
Show the authenticated user all of their saved experiments, make statuses easy to scan, and provide the main entry point into the builder and detail flows.

## Route
`/dashboard`

## Page Responsibilities
- load and display experiment summaries for the current user
- provide a clear `Create New Experiment` action
- link to existing experiment detail pages
- communicate empty, loading, and failure states clearly

## Data Needed
For each experiment summary:

- `id`
- `name`
- `status`
- `pageType`
- `updatedAt`
- latest run summary if useful for status display

This data must come from persisted storage, scoped to the authenticated user.

## UI Requirements
- page header with title and primary create action
- experiment list as cards or compact rows
- visible status badge on each item
- empty state when no experiments exist
- support for a small number of recent experiments without requiring pagination in MVP

## Behavior
### Empty state
If the user has no experiments, show a purposeful empty state with a single dominant action to create the first experiment.

### Populated state
If experiments exist, show them ordered by most recently updated first.

### Navigation
- `Create New Experiment` routes to `/experiments/new`
- selecting an experiment routes to `/experiments/[id]`

## Error Handling
- if data loading fails, show a recoverable page-level error
- do not show raw backend errors

## Dependencies
- authenticated layout shell
- experiment summary query from the shared data model
- shared status badge, empty state, and list/card patterns

## Test Expectations
- unauthenticated access redirects to login
- persisted experiments render in descending updated order
- empty state renders when no experiments exist
- create action points to the builder route

## Acceptance Criteria
- the page makes the app feel like a real product after login
- experiment statuses are immediately readable
- users can start a new experiment or open an existing one with no ambiguity
