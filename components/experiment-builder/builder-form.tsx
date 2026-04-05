"use client";

import React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { saveDraftExperimentAction, generateExperimentAction } from "@/app/experiments/new/actions";
import {
  emptyExperimentBuilderValues,
  type ExperimentBuilderActionResult,
  type ExperimentBuilderFieldErrors,
  type ExperimentBuilderValues,
} from "@/components/experiment-builder/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/text-area";

const requiredLabels: Record<string, string> = {
  name: "Experiment name is required.",
  goal: "Experiment goal is required.",
  pageType: "Target page type is required.",
  targetAudience: "Target audience is required.",
  tone: "Tone is required.",
};

export function ExperimentBuilderForm({
  initialValues = emptyExperimentBuilderValues,
}: {
  initialValues?: ExperimentBuilderValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ExperimentBuilderFieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [savedMessage, setSavedMessage] = useState<string>();
  const [isSaving, startSaving] = useTransition();
  const [isGenerating, startGenerating] = useTransition();

  const isBusy = isSaving || isGenerating;

  function setFieldValue<K extends keyof ExperimentBuilderValues>(
    field: K,
    value: ExperimentBuilderValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => {
      if (!current[field as keyof ExperimentBuilderFieldErrors]) {
        return current;
      }

      return {
        ...current,
        [field]: undefined,
      };
    });
    setFormError(undefined);
  }

  function applyActionResult(result: ExperimentBuilderActionResult) {
    setValues(result.values);
    setFieldErrors(result.fieldErrors ?? {});
    setFormError(result.formError);
    setSavedMessage(result.savedMessage);

    if (result.redirectTo) {
      router.push(result.redirectTo as Route);
      router.refresh();
    }
  }

  function validateGenerate(valuesToValidate: ExperimentBuilderValues) {
    const nextErrors: ExperimentBuilderFieldErrors = {};

    for (const [field, message] of Object.entries(requiredLabels)) {
      const value = valuesToValidate[field as keyof ExperimentBuilderValues];

      if (typeof value === "string" && value.trim().length === 0) {
        nextErrors[field as keyof ExperimentBuilderFieldErrors] = message;
      }
    }

    return nextErrors;
  }

  function handleSaveDraft() {
    setSavedMessage(undefined);

    startSaving(async () => {
      const result = await saveDraftExperimentAction(values);
      applyActionResult(result);
    });
  }

  function handleGenerate() {
    const nextErrors = validateGenerate(values);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setSavedMessage(undefined);
      setFormError(undefined);
      return;
    }

    setSavedMessage(undefined);

    startGenerating(async () => {
      const result = await generateExperimentAction(values);
      applyActionResult(result);
    });
  }

  return (
    <div className="builder-layout">
      <Card className="builder-form-panel">
        <div className="stack builder-panel-stack">
          <div className="builder-section-header stack">
            <div className="cluster builder-kicker-row">
              <p className="builder-kicker">Brief editor</p>
              <span className="shell-badge">Server-side generation</span>
            </div>
            <h2 className="builder-section-title">Structured brief</h2>
            <p className="muted builder-section-copy">
              Save a recoverable draft first or send the full brief to Codex to
              generate 2 to 3 storefront variants.
            </p>
          </div>

          {formError ? <ErrorBanner message={formError} /> : null}
          {savedMessage ? (
            <div role="status" className="builder-success-banner">
              {savedMessage}
            </div>
          ) : null}

          <div className="stack builder-sections">
            <section className="builder-section-card stack">
              <div className="builder-section-header stack">
                <p className="builder-section-kicker">Core inputs</p>
                <p className="muted builder-section-copy">
                  Capture the required business inputs first so the run can stay
                  aligned to the experiment goal.
                </p>
              </div>

              <div className="stack builder-fields-grid">
                <FormField
                  label="Name"
                  htmlFor="name"
                  required
                  error={fieldErrors.name}
                >
                  <Input
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={(event) => setFieldValue("name", event.target.value)}
                    placeholder="Holiday hero refresh"
                  />
                </FormField>

                <FormField
                  label="Goal"
                  htmlFor="goal"
                  required
                  error={fieldErrors.goal}
                >
                  <TextArea
                    id="goal"
                    name="goal"
                    value={values.goal}
                    onChange={(event) => setFieldValue("goal", event.target.value)}
                    placeholder="Increase homepage clickthrough to a seasonal gift collection."
                  />
                </FormField>

                <div className="builder-two-column-grid">
                  <FormField
                    label="Target page type"
                    htmlFor="pageType"
                    required
                    error={fieldErrors.pageType}
                  >
                    <Input
                      id="pageType"
                      name="pageType"
                      value={values.pageType}
                      onChange={(event) => setFieldValue("pageType", event.target.value)}
                      placeholder="Homepage hero"
                    />
                  </FormField>

                  <FormField
                    label="Target audience"
                    htmlFor="targetAudience"
                    required
                    error={fieldErrors.targetAudience}
                  >
                    <Input
                      id="targetAudience"
                      name="targetAudience"
                      value={values.targetAudience}
                      onChange={(event) =>
                        setFieldValue("targetAudience", event.target.value)
                      }
                      placeholder="Gift buyers shopping for premium home goods"
                    />
                  </FormField>
                </div>

                <FormField
                  label="Tone"
                  htmlFor="tone"
                  required
                  error={fieldErrors.tone}
                >
                  <Input
                    id="tone"
                    name="tone"
                    value={values.tone}
                    onChange={(event) => setFieldValue("tone", event.target.value)}
                    placeholder="Confident, editorial, premium"
                  />
                </FormField>
              </div>
            </section>

            <section className="builder-section-card stack">
              <div className="builder-section-header stack">
                <p className="builder-section-kicker">Context</p>
                <p className="muted builder-section-copy">
                  Add guardrails and seed material to improve the quality of the
                  generated copy without changing the MVP workflow.
                </p>
              </div>

              <div className="stack builder-fields-grid">
                <FormField
                  label="Brand constraints"
                  htmlFor="brandConstraints"
                  error={fieldErrors.brandConstraints}
                >
                  <TextArea
                    id="brandConstraints"
                    name="brandConstraints"
                    value={values.brandConstraints}
                    onChange={(event) =>
                      setFieldValue("brandConstraints", event.target.value)
                    }
                    placeholder="Avoid discount language. Keep claims grounded in product quality and craft."
                  />
                </FormField>

                <FormField
                  label="Seed context"
                  htmlFor="seedContext"
                  error={fieldErrors.seedContext}
                >
                  <TextArea
                    id="seedContext"
                    name="seedContext"
                    value={values.seedContext}
                    onChange={(event) => setFieldValue("seedContext", event.target.value)}
                    placeholder="Optional campaign notes, existing copy, or merchandising context."
                  />
                </FormField>
              </div>
            </section>
          </div>

          <div className="builder-action-rail">
            <div className="stack builder-action-copy">
              <p className="builder-section-kicker">Launch rail</p>
              <p className="muted builder-action-note">
                Required for generation: name, goal, page type, target audience,
                and tone.
              </p>
            </div>
            <div className="cluster builder-action-buttons">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                loading={isSaving}
                disabled={isBusy}
              >
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={isBusy}
              >
                Generate Variants
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="stack builder-side-column">
        <Card className="builder-side-panel">
          <div className="stack builder-side-stack">
            <div className="builder-section-header stack">
              <div className="cluster builder-kicker-row">
                <h2 className="builder-side-title">Generation guide</h2>
                <span className="builder-side-pill">2-3 variants</span>
              </div>
              <p className="muted builder-section-copy">
                Codex runs on the server after the brief is persisted. Generated
                variants are saved with prompt snapshots and kept in run history.
              </p>
            </div>

            <div className="builder-guidance-card">
              <p className="builder-guidance-title">What the run will emphasize</p>
              <ul className="builder-guidance-list">
                <li>Audience and tone alignment</li>
                <li>Brand-safe CTA and messaging</li>
                <li>Structured preview content, not arbitrary code</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="builder-side-panel">
          <div className="stack builder-side-stack">
            <div className="cluster builder-kicker-row">
              <h2 className="builder-side-title">Preview placeholder</h2>
              <span className="builder-status-chip">Awaiting generation</span>
            </div>

            <div className="builder-preview-frame">
              <div className="builder-preview-stage">
                <p className="builder-preview-kicker">Draft summary</p>
                <h3 className="builder-preview-title">
                  {values.name || "Your experiment name will appear here"}
                </h3>
                <p className="muted builder-preview-copy">
                  {values.goal ||
                    "Add a business goal so the generated variants have a clear conversion target."}
                </p>
              </div>

              <dl className="builder-preview-metadata">
                <div className="builder-preview-meta-item">
                  <dt className="builder-preview-meta-label">Page type</dt>
                  <dd className="builder-preview-meta-value">
                    {values.pageType || "Select the storefront surface."}
                  </dd>
                </div>
                <div className="builder-preview-meta-item">
                  <dt className="builder-preview-meta-label">Audience</dt>
                  <dd className="builder-preview-meta-value">
                    {values.targetAudience ||
                      "Clarify who this variant should persuade."}
                  </dd>
                </div>
                <div className="builder-preview-meta-item">
                  <dt className="builder-preview-meta-label">Tone</dt>
                  <dd className="builder-preview-meta-value">
                    {values.tone || "Set the voice for the generated copy."}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="builder-side-panel builder-checklist-panel">
          <div className="stack builder-side-stack">
            <h2 className="builder-side-title">Run readiness</h2>
            <div className="builder-readiness-list">
              <ReadinessRow
                label="Experiment name"
                ready={values.name.trim().length > 0}
              />
              <ReadinessRow label="Business goal" ready={values.goal.trim().length > 0} />
              <ReadinessRow
                label="Page type"
                ready={values.pageType.trim().length > 0}
              />
              <ReadinessRow
                label="Target audience"
                ready={values.targetAudience.trim().length > 0}
              />
              <ReadinessRow label="Tone" ready={values.tone.trim().length > 0} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReadinessRow({
  label,
  ready,
}: {
  label: string;
  ready: boolean;
}) {
  return (
    <div className="builder-readiness-row">
      <div className="cluster" style={{ gap: 10 }}>
        <span
          aria-hidden="true"
          className={`builder-readiness-dot ${ready ? "is-ready" : ""}`}
        />
        <span>{label}</span>
      </div>
      <span className="builder-readiness-state">{ready ? "Ready" : "Needed"}</span>
    </div>
  );
}
