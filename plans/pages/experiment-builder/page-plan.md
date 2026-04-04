# Experiment Builder Page Plan

## Purpose
Collect the experiment brief, allow draft persistence, and trigger Codex generation from inside the app.

## Route
`/experiments/new`

## Page Responsibilities
- collect structured experiment inputs
- validate required fields
- save draft experiment data
- trigger Codex generation
- communicate loading, success, and failure states

## Inputs
The form should collect:

- `name`
- `goal`
- `pageType`
- `targetAudience`
- `tone`
- `brandConstraints`
- `seedContext` optional

These are business inputs and must map directly to the shared Codex input contract.

## UI Layout
Use a two-panel layout:

- left panel for the experiment form
- right panel for contextual guidance, generation expectations, or a lightweight preview placeholder

This page should feel action-oriented rather than like a generic settings form.

## Primary Actions
- `Save Draft`
- `Generate Variants`

`Generate Variants` should be the dominant action once required fields are valid.

## Behavior
### Save Draft
- validates minimally required persistence fields
- creates or updates an experiment in `draft` state
- keeps the user in a recoverable editing flow

### Generate Variants
- requires the full generation field set
- persists the experiment if needed
- triggers a server-side Codex generation run
- prevents duplicate submissions while in progress
- routes to the experiment detail page on success, or updates the page with a recoverable error

## Validation
Required for generation:

- `name`
- `goal`
- `pageType`
- `targetAudience`
- `tone`

`brandConstraints` is strongly encouraged and should be presented as high-value, but may remain optional for MVP.

Validation errors must be explicit and field-level.

## Loading And Failure States
- generating state disables repeated generate attempts
- draft save state is distinct from generate state
- generation failure keeps form data intact
- page-level error banner is acceptable for non-field errors

## Dependencies
- auth-protected route behavior
- experiment persistence helpers
- Codex generation service
- shared form, button, and error UI

## Test Expectations
- required fields block generation when incomplete
- draft save persists entered data
- mocked generation success transitions to saved result flow
- generation failure leaves the form recoverable

## Acceptance Criteria
- the page makes programmatic Codex usage obvious
- structured inputs are clear and fast to fill in
- users can save drafts without generating
- generation is reliable enough to demo and safe enough to test with mocks
