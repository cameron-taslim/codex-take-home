# Experiment Lab

## Overview
Experiment Lab is a web app for eCommerce teams to create storefront experiments and use Codex programmatically to generate one landing-page output per run. The demo is built to prove two things during the hackathon:

- Codex can be used to quickly build a polished product workflow.
- Codex can be embedded inside the product as a real generation engine, not just used during development.

The app lets an authenticated user log in, create an experiment brief, generate UI and copy output with Codex, persist the result, and review the latest saved output in an HTML preview-oriented detail view.

## Audience
The primary audience is an OpenAI customer operating a major eCommerce platform. The product should feel relevant to merchandisers, growth teams, and product marketers who want to launch experiments faster without hand-authoring every landing-page variation.

## Demo Story
The demo should show a single continuous user flow:

1. Log in.
2. Open the dashboard and show existing experiments.
3. Create a new experiment from structured inputs.
4. Trigger Codex generation from inside the app.
5. Persist the generated output.
6. Open the experiment detail page and review the latest saved output.

This flow makes the Codex integration visible and ties it directly to a business use case.

## Product Scope
This is a medium-scope MVP with four pages:

- Login
- Dashboard
- Experiment Builder
- Experiment Detail

The product includes:

- user authentication
- persisted experiments and generation runs
- a Codex-powered generation workflow
- a previewable detail page for generated outputs
- a small but meaningful automated test suite

The product does not include:

- multi-user collaboration
- real experiment analytics from production traffic
- storefront deployment
- design editing beyond the generated experiment outputs
- team or workspace administration

## Chosen Stack
- Frontend and app framework: Next.js App Router
- Authentication: NextAuth with a credentials-based local-friendly setup and optional dev OAuth path
- Persistence: Prisma with Postgres
- Programmatic Codex usage: server-side generation service called from app actions or route handlers
- Testing: unit, integration, and minimal UI coverage

## Core User Journey
### 1. Login
The user signs in and is redirected to the dashboard. Protected pages are not accessible without a valid session.

### 2. Dashboard
The dashboard lists the user’s saved experiments and their statuses. From here the user can create a new experiment or open an existing one.

### 3. Experiment Builder
The builder collects structured inputs:

- experiment name
- target page type
- target audience
- tone or merchandising style
- brand constraints
- optional seed copy or context
- a focused test prompt describing what the generation should explore

The user submits the brief to Codex to generate the next saved output.

### 4. Codex Generation
The app sends the structured experiment brief to a server-side generation layer. Codex returns one structured output for the current run, which the app stores with the experiment and associates with the generation run.

### 5. Experiment Detail
The user reviews the latest generated output, sees the latest generation state, inspects prior runs, and optionally reruns generation from the saved experiment brief.

## Success Criteria
The project is successful if it demonstrates all of the following:

- a working authenticated user flow
- persisted data for experiments and generation runs
- a clear and visible Codex-powered action inside the app
- a UI polished enough for a short demo
- test coverage for core risk areas
- a build plan that can be split across agents with minimal coordination overhead

## Implementation Order
Build in the following order:

1. Shared architecture and route boundaries
2. Authentication and route protection
3. Prisma schema and persistence layer
4. Codex generation contract and service layer
5. Login page
6. Dashboard page
7. Experiment Builder page
8. Experiment Detail page
9. Tests and end-to-end verification

This order allows the shared contracts to stabilize before page agents begin independent work.

## Agent Handoff Strategy
Use one coordinating agent or engineer to own shared infrastructure decisions and route contracts. Page-specific agents should only begin once these shared documents are approved:

- `plans/shared/architecture.md`
- `plans/shared/auth-and-user-model.md`
- `plans/shared/data-model.md`
- `plans/shared/codex-integration.md`
- `plans/shared/design-system.md`

Each page folder contains an implementation brief that should be treated as the source of truth for that page’s behavior, UI states, data dependencies, and acceptance criteria.
