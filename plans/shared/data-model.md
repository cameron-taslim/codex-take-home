# Data Model Plan

## Goal
Define the minimum persisted data model needed to support experiments, generation history, and user-owned records.

## Core Entities
### User
Represents an authenticated account.

Required fields:

- `id`
- `email` or login identifier
- `displayName` if convenient for UI
- auth-related fields required by the chosen NextAuth strategy
- timestamps

Relationships:

- one user has many experiments

### Experiment
Represents the user-authored experiment brief and its top-level lifecycle.

Required fields:

- `id`
- `userId`
- `name`
- `goal`
- `pageType`
- `targetAudience`
- `tone`
- `brandConstraints`
- `seedContext` optional
- `status`
- `latestGenerationRunId` optional
- timestamps

Recommended status values:

- `draft`
- `generating`
- `generated`
- `generation_failed`

Relationships:

- belongs to one user
- has many generation runs

### CodexGenerationRun
Represents one attempt to generate experiment variants from a saved experiment brief.

Required fields:

- `id`
- `experimentId`
- `status`
- `promptSnapshot`
- `startedAt`
- `completedAt` optional
- `errorMessage` optional
- timestamps

Recommended status values:

- `pending`
- `running`
- `succeeded`
- `failed`

Relationships:

- belongs to one experiment
- has many variants

### ExperimentVariant
Represents one generated variant returned from Codex.

Required fields:

- `id`
- `generationRunId`
- `experimentId`
- `label`
- `headline`
- `subheadline` optional
- `bodyCopy`
- `ctaText`
- `layoutNotes`
- `previewConfig`
- `position`
- timestamps

Relationships:

- belongs to one experiment
- belongs to one generation run

### PromptTemplate
Optional. Only add if implementation benefits from reusable prompt baselines.

If included, keep it simple:

- `id`
- `name`
- `templateKey`
- `instructions`
- timestamps

This entity is not required for MVP.

## Persistence Rules
- The experiment brief is persisted independently from generation output.
- Each generation run stores a snapshot of the prompt input used at that time.
- Generated variants are immutable records linked to a single generation run.
- Reruns create new generation runs rather than overwriting historical ones.
- The experiment stores a pointer to the latest successful or latest attempted run for efficient page loading.

## What Is Saved Vs Derived
### Saved
- user-entered experiment brief fields
- generation run status and timestamps
- prompt snapshot sent to Codex
- generated variant content
- latest run pointer

### Derived at read time
- dashboard summary labels
- variant comparison ordering beyond saved `position`
- UI-only formatting of experiment metadata

## Query Shapes Needed
### Dashboard
Needs a summary list containing:

- experiment id
- name
- status
- page type
- updated timestamp
- latest run status if helpful

### Builder
Needs draft creation and draft update support for the experiment brief.

### Detail page
Needs:

- experiment metadata
- latest variants
- generation history list
- latest generation error state when present

## Validation Rules
- `name`, `goal`, `pageType`, `targetAudience`, and `tone` are required for generation.
- `brandConstraints` can be required for generation if the product team wants tighter output control. For MVP, allow it but strongly encourage it.
- `seedContext` is optional.
- `previewConfig` must be validated before persistence to prevent malformed detail-page rendering.

## Acceptance Criteria
- The schema supports one user owning many experiments.
- Generation history is preserved across reruns.
- Dashboard and detail page can be served entirely from persisted data.
- Codex input and output are both persisted enough for debugging and testing.
