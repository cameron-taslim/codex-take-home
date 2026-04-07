# Experiment Lab

Experiment Lab is a Next.js App Router application for creating and reviewing eCommerce landing-page experiments. The current repository includes the full demo flow:

- landing and login flow
- authenticated dashboard
- experiment builder and detail pages
- credentials-based auth with NextAuth
- Prisma schema and repositories
- a server-side Codex generation boundary
- persisted generation history and HTML previews
- shared UI primitives
- unit, integration, and browser-oriented test setup

This README covers how to go from a fresh checkout to a running local app.

## Prerequisites

Install these locally:

- Node.js 24.x
- npm 11.x
- Docker

You also need a running PostgreSQL database. The quickest local path is Docker, and the commands below assume that route.

## 1. Install dependencies

From the repo root:

```bash
npm install
```

Or use the repo helper for the full local bootstrap:

```bash
npm run local
```

## 2. Create local environment variables

Copy the example env file:

```bash
cp .env.example .env
```

Default values are already set up for a local Docker Postgres instance:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/experiment_lab?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
AUTH_DEMO_EMAIL="demo@example.com"
AUTH_DEMO_PASSWORD="G1xM4PrNXFquiEzuJBOykg1R"
CODEX_PROVIDER_MODE="mock"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5-codex"
```

Notes:

- Set `NEXTAUTH_SECRET` to a real random string for local use.
- Generation defaults to mock variants for local development when `CODEX_PROVIDER_MODE="mock"`.
- To use the real OpenAI provider later, set `CODEX_PROVIDER_MODE="openai"` and provide `OPENAI_API_KEY`.

## 3. Start PostgreSQL with Docker

Run:

```bash
docker run --name experiment-lab-postgres \
  -e POSTGRES_DB=experiment_lab \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16
```

To verify the container is ready:

```bash
docker exec experiment-lab-postgres pg_isready -U postgres -d experiment_lab
```

Expected result:

```bash
/var/run/postgresql:5432 - accepting connections
```

If you already have a Postgres container with this name, either reuse it or remove it first:

```bash
docker rm -f experiment-lab-postgres
```

## 4. Apply the Prisma schema

Push the schema to the database:

```bash
npx prisma db push
```

This also regenerates the Prisma client.

## 5. Seed the demo user

Run:

```bash
npm run db:seed
```

This creates or updates the local demo account from your `.env` values:

- email: `AUTH_DEMO_EMAIL`
- password: `AUTH_DEMO_PASSWORD`

## 6. Start the app

Run:

```bash
npm run dev
```

Or use the helper script, which will also ensure Postgres, Prisma, and seed data are ready:

```bash
npm run local
```

Then open:

```text
http://localhost:3000
```

Log in with the seeded credentials:

- email: `demo@example.com`
- password: `G1xM4PrNXFquiEzuJBOykg1R`

## Useful commands

Start the dev server:

```bash
npm run dev
```

Run the tests:

```bash
npm test
```

Start the app in Playwright mode in one terminal:

```bash
npm run local:playwright
```

Then run browser tests in a second terminal:

```bash
npm run test:e2e
```

Run the typecheck:

```bash
npm run typecheck
```

Create a production build:

```bash
npm run build
```

Regenerate Prisma client manually:

```bash
npx prisma generate
```

Re-apply the schema:

```bash
npx prisma db push
```

## Project structure

High-level layout:

- `app/`: Next.js App Router routes and root layout
- `components/`: shared auth, layout, and UI primitives
- `lib/auth/`: auth config, session helpers, middleware policy
- `lib/repositories/`: persistence access helpers
- `lib/codex/`: server-side Codex provider and orchestration layer
- `lib/validation/`: shared Zod schemas
- `prisma/`: schema and seed script
- `tests/`: Vitest and Playwright coverage for the primary flow
- `plans/`: approved product and architecture plans

## Current status

The application is implemented and demoable. These routes exist:

- `/login`
- `/dashboard`
- `/experiments/new`
- `/experiments/[id]`

Key product behavior:

- seeded credentials-based login
- persisted experiment briefs and generation runs
- server-side Codex orchestration with mock and OpenAI modes
- saved sanitized `htmlContent` previews on the detail page
- reruns that preserve generation history

## Troubleshooting

If `npx prisma db push` cannot connect:

- make sure Docker is running
- make sure the `experiment-lab-postgres` container is running
- make sure `.env` points to `localhost:5432`

Check container status:

```bash
docker ps
```

If you want to reset the local database quickly:

```bash
docker rm -f experiment-lab-postgres
docker run --name experiment-lab-postgres \
  -e POSTGRES_DB=experiment_lab \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16
npx prisma db push
npm run db:seed
```

## Stop local services

Stop the Next dev server with `Ctrl+C`.

Stop Postgres:

```bash
docker stop experiment-lab-postgres
```
