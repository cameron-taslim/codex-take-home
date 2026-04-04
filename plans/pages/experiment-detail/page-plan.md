# Experiment Detail Page Plan

## Purpose
Present the saved experiment, display generated variants, and provide a controlled rerun path for additional Codex generations.

## Route
`/experiments/[id]`

## Page Responsibilities
- load the selected owned experiment
- render experiment metadata
- display the latest generated variants
- show generation history
- allow rerunning generation

## Data Needed
- experiment metadata
- latest generation run
- all variants for the latest run
- lightweight generation history list
- latest failure state if applicable

All data must be loaded from persisted records, scoped to the authenticated owner.

## UI Layout
Use a split or stacked layout that prioritizes variant review:

- summary section for experiment metadata and status
- main comparison area for saved variants
- secondary area for generation history and rerun action

## Variant Presentation
Show 2 to 3 generated variants side by side or in clearly separated cards. Each variant should present:

- label
- headline
- subheadline if present
- body copy
- CTA text
- layout notes

Use `previewConfig` only for safe presentational enhancements, not arbitrary rendering.

## Rerun Behavior
- rerun uses the saved experiment brief as input
- creates a new generation run
- preserves prior history
- updates the latest run pointer after success
- shows in-progress and failure states clearly

## Error Handling
### Unauthorized or missing experiment
Render a safe not-found style experience rather than exposing ownership details.

### No generated variants yet
If the experiment exists but has not yet generated successfully, show a purposeful empty state with an action back to generation.

### Failed latest run
Show the failure state and allow regeneration without losing existing experiment data.

## Dependencies
- shared experiment ownership rules
- generation history query shape
- Codex rerun service contract
- shared variant preview and status components

## Test Expectations
- owned experiment detail renders latest persisted variants
- unauthorized experiment access is blocked safely
- rerun action creates a new generation run in mocked integration tests
- failed latest run renders a recoverable error state

## Acceptance Criteria
- the page clearly demonstrates saved Codex-generated output
- generation history is visible enough to support the product story
- rerun behavior preserves history and updates the latest output correctly
