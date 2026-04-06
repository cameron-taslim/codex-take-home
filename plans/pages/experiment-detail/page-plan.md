# Experiment Detail Page Plan

## Purpose
Present the saved experiment, display the latest generated output, and provide a controlled rerun path for additional Codex generations.

## Route
`/experiments/[id]`

## Page Responsibilities
- load the selected owned experiment
- render experiment metadata
- display the latest generated output
- allow rerunning generation

## Data Needed
- experiment metadata
- latest generation run
- the saved output for the latest run
- latest failure state if applicable

All data must be loaded from persisted records, scoped to the authenticated owner.

## UI Layout
Use a split or stacked layout that prioritizes output review:

- summary section for experiment metadata and status
- main review area for the latest saved output
- secondary area for rerun action

## Output Presentation
Show one generated output for the active run in a clearly separated preview card. The saved output should present:

- label
- headline
- subheadline if present
- body copy
- CTA text
- sanitized HTML preview
- layout notes

Use sanitized `htmlContent` only for bounded preview rendering, not arbitrary code execution.

## Rerun Behavior
- rerun uses the saved experiment brief as input
- creates a new generation run
- preserves prior runs
- updates the latest run pointer after success
- shows in-progress and failure states clearly

## Error Handling
### Unauthorized or missing experiment
Render a safe not-found style experience rather than exposing ownership details.

### No generated output yet
If the experiment exists but has not yet generated successfully, show a purposeful empty state with an action back to generation.

### Failed latest run
Show the failure state and allow regeneration without losing existing experiment data.

## Dependencies
- shared experiment ownership rules
- Codex rerun service contract
- shared variant preview and status components

## Test Expectations
- owned experiment detail renders the latest persisted output
- unauthorized experiment access is blocked safely
- rerun action creates a new generation run in mocked integration tests
- failed latest run renders a recoverable error state

## Acceptance Criteria
- the page clearly demonstrates saved Codex-generated output
- rerun behavior preserves history and updates the latest output correctly
