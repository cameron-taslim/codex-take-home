# Testing Strategy Plan

## Goal
Define a focused, meaningful test suite that covers the highest-risk product behavior without overbuilding the test surface.

## Testing Philosophy
The test suite should prove that the app’s core promises work:

- protected routes stay protected
- experiment data persists correctly
- Codex generation is invoked through a stable server contract
- the key user flows render the right states

Favor a small number of reliable tests over broad but shallow coverage.

## Required Coverage
### Auth protection
Test that unauthenticated users cannot access protected routes and are redirected to `/login`.

### Experiment persistence
Test that an authenticated user can create a draft experiment and retrieve it from persisted storage.

### Builder validation
Test that required fields are enforced before a generation request is accepted.

### Codex generation service
Test the generation service with a mocked Codex response. Verify:

- generation run creation
- variant persistence
- experiment status updates
- latest generation pointer updates

### Generation failure path
Test that a mocked generation failure:

- records a failed run
- preserves the experiment brief
- does not persist malformed partial variants
- returns a usable error state to the UI layer

### Dashboard rendering
Test that persisted experiment summaries render correctly on the dashboard, including empty and non-empty states.

### Experiment detail rendering
Test that the detail page can render persisted variants and generation history for a valid owned experiment.

## Test Levels
### Unit tests
Use for:

- validation helpers
- Codex response mapping logic
- status transition helpers

### Integration tests
Use for:

- auth-protected route handlers or server actions
- experiment creation and retrieval
- generation service plus persistence behavior with mocked Codex output

### UI or component-level tests
Use for:

- builder form validation and submission states
- dashboard empty and populated states
- detail page variant rendering

Do not rely only on end-to-end testing for MVP.

## Mocking Strategy
- Mock Codex responses at the service boundary.
- Avoid tests that depend on live external model calls.
- Keep one canonical successful mocked response and one canonical failure response for consistency.

## Minimum Acceptance Suite
The planning package assumes the implementation is not complete until these tests exist:

1. unauthenticated access redirects to login
2. authenticated user can create and persist an experiment
3. builder rejects incomplete generation requests
4. mocked Codex generation persists variants and updates statuses
5. dashboard shows persisted experiments
6. detail page renders the latest saved variants
7. generation failure is recoverable and visible

## Quality Bar
The app is ready for take-home submission when:

- the required tests pass consistently
- core paths are covered without live external dependencies
- failure behavior has at least one explicit automated test
- the test suite is small enough to run quickly during iteration
