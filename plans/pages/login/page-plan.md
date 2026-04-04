# Login Page Plan

## Purpose
Provide a clean authentication entry point for the Experiment Lab MVP and enforce the redirect rules that protect the rest of the app.

## Route
`/login`

## Page Responsibilities
- render the login form
- submit credentials through the shared auth flow
- show invalid-login feedback
- redirect authenticated users away from the page

## UI Requirements
- simple centered login layout
- product name and short context about Experiment Lab
- form fields for the chosen credentials flow
- primary submit button
- inline error state for invalid credentials
- loading state while login is in progress

## Behavior
### On initial load
- if no session exists, render the login form
- if a valid session exists, redirect to `/dashboard`

### On submit success
- create session
- redirect to `/dashboard`

### On submit failure
- keep the user on the same page
- preserve field values where appropriate
- show a concise error message

## Dependencies
- NextAuth configuration from the shared auth plan
- route redirect policy from shared architecture
- shared form and button styles from the design system

## Edge Cases
- expired session revisiting `/login` should behave as logged out
- repeated invalid attempts should remain recoverable
- unexpected server auth error should show a generic retryable message

## Test Expectations
- authenticated user visiting `/login` is redirected
- invalid credentials show an inline error
- valid credentials land on `/dashboard`
- unexpected auth failures show a generic retryable error

## Verification
- run focused component or page tests for authenticated redirect, invalid credentials, valid login, and generic auth failure
- run a targeted Playwright check for `/login` render and the real credential sign-in flow
- if the login heading or other asserted UI copy changes, update the corresponding browser assertions in the same task

## Required Fixtures
- the browser-level login flow assumes the demo user is seeded from `.env`
- the browser-level login flow assumes the app is running at the Playwright base URL with a matching `NEXTAUTH_URL` when required

## Acceptance Criteria
- login is the only public page in MVP
- the page is simple, stable, and demo-ready
- redirect behavior matches the shared auth plan exactly
