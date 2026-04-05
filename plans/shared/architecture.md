# Architecture Plan

## Goal
Define a simple, stable application architecture for Experiment Lab so multiple implementation agents can work without conflicting assumptions.

## Application Shape
The app is a server-backed Next.js web application using the App Router. It has four primary routes:

- `/login`
- `/dashboard`
- `/experiments/new`
- `/experiments/[id]`

The application is organized around a thin UI layer, a server-side application layer, and a persistence layer.

## System Boundaries
### Client layer
Responsible for:

- rendering page layouts and forms
- managing local form state
- displaying loading, success, and error states
- navigating between pages
- rendering saved experiment output

The client must not call external Codex APIs directly.

### Server layer
Responsible for:

- validating authenticated access
- loading and persisting experiment data
- triggering Codex generation
- mapping Codex responses into internal output records
- returning UI-safe data payloads to the client

### Persistence layer
Responsible for:

- storing user-owned experiments
- storing generation runs
- storing generated outputs
- serving dashboard summary data and detail-page records

## Route Responsibilities
### `/login`
Public route. Handles authentication entry and redirects authenticated users away from the login page.

### `/dashboard`
Protected route. Lists the current user’s experiments and offers navigation to create a new one or open an existing experiment.

### `/experiments/new`
Protected route. Hosts the Experiment Builder flow for draft creation, validation, save, and generation.

### `/experiments/[id]`
Protected route. Shows experiment metadata, the latest saved output, generation history, and rerun controls.

## Data Flow
### Dashboard flow
1. Server authenticates the user.
2. Server loads experiment summary records for the user.
3. Page renders cards or rows from persisted data.

### Builder flow
1. User fills structured experiment fields.
2. Client validates required inputs before submission.
3. Server persists a draft experiment if it does not already exist.
4. Server triggers Codex generation when requested.
5. Server saves a `CodexGenerationRun` and one linked `ExperimentVariant` record for the run.
6. Client transitions to the detail page or updates the builder with success state.

### Detail flow
1. Server authenticates the user and loads the requested experiment.
2. Server fetches the latest saved output and generation history.
3. Page renders saved experiment metadata and the current preview-oriented output.
4. User may rerun generation, which creates a new generation run while preserving prior history.

## Codex Call Placement
Codex is called only from the server layer. The recommended implementation shape is:

- page or form action triggers a server action or route handler
- a generation service constructs the Codex prompt and response contract
- the generation service validates the returned structure before persistence

This avoids exposing provider credentials to the client and gives one stable integration point for testing.

## Internal Modules To Keep Separate
- auth/session helpers
- experiment repository or data access helpers
- Codex generation service
- DTO or mapper layer for page-safe payloads
- shared UI component library

Do not let page components embed direct persistence or Codex integration logic.

## Recommended Agent Boundaries
### Shared systems owner
Owns:

- auth setup
- Prisma schema
- generation service contract
- route guards
- shared layout and reusable UI primitives

### Page agents
Each page agent owns:

- page layout and rendering
- user interactions on that page
- loading, empty, and error states
- tests scoped to page behavior

Page agents must consume shared contracts and not redefine data models or auth behavior.

## Implementation Sequence
1. Establish routes, layout shell, and protected-route policy.
2. Implement authentication and session checks.
3. Implement Prisma schema and seed-safe local database flow.
4. Implement experiment data access layer.
5. Implement Codex generation service and mocked test path.
6. Build dashboard and builder.
7. Build experiment detail and rerun flow.
8. Add tests across auth, persistence, and generation paths.

## Acceptance Criteria
- No page depends on direct client-side Codex calls.
- Protected routes are enforced consistently.
- Persisted records are the source of truth for dashboard and detail screens.
- Generation history is append-only at the run level.
- The architecture supports isolated implementation by page agents.
