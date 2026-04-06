# Codex Integration Plan

## Goal
Define exactly how Codex is used inside Experiment Lab so the integration is visible, testable, and central to the product story.

## Product Role Of Codex
Codex generates one storefront experiment output from a structured experiment brief for each run. It is not a background assistant and it is not only used during development. The user triggers generation from the app, and the generated output becomes persisted product data.

## Trigger Points
Codex generation is triggered from:

- the Experiment Builder page after the user submits a valid brief
- the Experiment Detail page when the user reruns generation

The Codex call must happen on the server.

## Input Contract
The generation service accepts a structured payload derived from the saved experiment:

- `experimentName`
- `pageType`
- `targetAudience`
- `tone`
- `brandConstraints`
- `seedContext`
- `whatToTest`

The service may add internal instructions, but page code should only provide these business inputs.

## Output Contract
Codex must return one structured output, not free-form prose. The target output should map cleanly into persisted records:

- `variant`: the generated output for the run
- the output includes:
  - `label`
  - `headline`
  - `subheadline`
  - `bodyCopy`
  - `ctaText`
  - `layoutNotes`
  - `htmlContent`

The implementation may use JSON schema or equivalent response validation to ensure storage-safe output.

## Prompt Design Requirements
The Codex prompt should:

- frame the task as generating the next eCommerce landing-page experiment output
- keep output aligned to the provided audience and tone
- honor brand constraints
- return structured machine-usable output
- avoid unsupported HTML or arbitrary executable code

The service must not allow the model to return raw JSX or arbitrary file trees in MVP. The preview should be driven by safe generated HTML inside a bounded sanitized container rather than arbitrary code execution.

## Storage Rules
For every generation attempt:

1. Create a `CodexGenerationRun` in `pending` or `running` state.
2. Persist the exact prompt snapshot or equivalent normalized input used for the call.
3. On success, persist one `ExperimentVariant` record linked to that run.
4. Update experiment status and latest generation pointer.
5. On failure, persist the failure state and error message on the run.

Do not discard failed runs.

## UI Behavior During Generation
- Show a visible loading state when generation starts.
- Disable duplicate generate submissions while a request is in flight.
- Surface generation failure inline with a retry path.
- Preserve the experiment brief even if generation fails.

## Failure Handling
### Validation failure
Do not call Codex. Return field-level validation issues to the builder UI.

### Provider or network failure
Mark the generation run as failed, show a recoverable error state, and keep the saved experiment intact.

### Invalid response shape
Treat as failed generation. Do not persist malformed output.

## Testing Expectations
The generation layer must be mockable. Tests should validate:

- the service is invoked with structured experiment input
- successful responses are transformed into one persisted output record for the run
- failed responses do not create partial invalid output
- experiment and generation statuses transition correctly

## Demo Proof Points
The final product should make the Codex integration obvious:

- the user clicks a generate action inside the app
- the app shows a generation-in-progress state
- the resulting output appears as saved experiment data
- the detail page shows the latest generated output and a rerun path

This is the clearest evidence that Codex is being used programmatically as part of the workflow.

## Acceptance Criteria
- Codex is invoked only from server-side application code.
- The generation contract is structured and validated.
- Prompt input and generated output are persisted.
- Failure states are visible and recoverable.
- The demo clearly shows Codex as a first-class product capability.
