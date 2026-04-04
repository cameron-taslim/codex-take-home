# Auth And User Model Plan

## Goal
Define a minimal, reliable authentication model that satisfies the take-home requirements without adding unnecessary scope.

## User Model
The MVP supports a single authenticated user role.

All authenticated users can:

- create experiments
- view their own experiments
- edit draft inputs through the builder flow
- trigger Codex generation
- rerun generation on their own experiments

No user can access or modify another user’s records.

There are no admin-only behaviors in MVP.

## Auth Approach
Use NextAuth with a credentials-friendly setup that works well in local development and demo environments. An optional dev OAuth provider can be added later, but it is not required by the plan.

The baseline auth flow should support:

- login via a simple form
- session persistence across protected routes
- logout from authenticated pages

## Route Protection Policy
### Public route
- `/login`

### Protected routes
- `/dashboard`
- `/experiments/new`
- `/experiments/[id]`

If an unauthenticated user requests a protected route, the app redirects to `/login`.

If an authenticated user requests `/login`, the app redirects to `/dashboard`.

## Session Behavior
- Session existence is checked server-side for protected pages.
- The authenticated user identity is used to scope all data reads and writes.
- Session expiration should fail closed: expired or invalid sessions behave as unauthenticated.

## Login UX Expectations
- Email/username and password inputs are acceptable for MVP.
- Invalid credentials show a clear inline error.
- Successful login redirects to the dashboard.
- Repeated failed attempts do not require additional anti-abuse logic in MVP.

## Logout UX Expectations
- Logout must be available from authenticated navigation.
- Logging out clears the session and returns the user to `/login`.
- After logout, revisiting a protected page requires a new login.

## Ownership Rules
- Every `Experiment` record belongs to exactly one `User`.
- Every `CodexGenerationRun` belongs to an `Experiment` owned by that user.
- Every `ExperimentVariant` belongs to a generation run under that same experiment.
- Ownership must be enforced in server-side queries, not just hidden in the UI.

## Failure Modes
### Expired session
Treat as logged out. Redirect to `/login` on the next protected page request or protected action.

### Unauthorized record access
If a user requests an experiment they do not own, return a not-found style response rather than exposing record existence.

### Server-side auth failure during generation
Do not invoke Codex. Return an auth failure response and keep the UI on a recoverable state.

## Acceptance Criteria
- All protected pages require a valid session.
- Login success and failure states are explicit.
- User-owned data is isolated by server query rules.
- Unauthorized experiment access does not leak private data.
- Auth behavior is simple enough for a demo but stable enough for automated testing.
