"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  generateExperimentAction,
  prepareExperimentBriefAction,
  saveDraftExperimentAction,
} from "@/app/experiments/new/actions";
import {
  emptyExperimentBuilderValues,
  type ExperimentBuilderActionResult,
  type ExperimentBuilderFieldErrors,
  type ExperimentBuilderValues,
  type LockedElement,
} from "@/components/experiment-builder/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/text-area";

const componentTypes = [
  "Hero banner",
  "Landing page",
  "Product detail page (PDP) buy box",
  "Navigation CTA",
  "Category page header",
] as const;

const primaryGoals = [
  "Increase clickthrough rate",
  "Increase add-to-cart rate",
  "Increase revenue per visitor",
  "Reduce bounce rate",
] as const;

const trafficSplitOptions = ["50/50", "70/30", "80/20"] as const;
const brandTones = [
  "Editorial",
  "Urgent",
  "Playful",
  "Minimalist",
  "Confident",
  "Warm",
] as const;
const lockedElementOptions: LockedElement[] = [
  "Lock hero image",
  "Lock logo",
  "Lock legal copy",
  "Lock price display",
];

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
  const [workflowStage, setWorkflowStage] = useState<"draft" | "brief_ready">("draft");
  const [isSaving, startSaving] = useTransition();
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isGenerating, startGenerating] = useTransition();

  const isBusy = isSaving || isAnalyzing || isGenerating;

  function setFieldValue<K extends keyof ExperimentBuilderValues>(
    field: K,
    value: ExperimentBuilderValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
    if (field !== "approvedBrief" && workflowStage === "brief_ready") {
      setWorkflowStage("draft");
      setValues((current) => ({
        ...current,
        approvedBrief: undefined,
      }));
    }
    setFormError(undefined);
  }

  function applyActionResult(result: ExperimentBuilderActionResult) {
    setValues(result.values);
    setFieldErrors(result.fieldErrors ?? {});
    setFormError(result.formError);
    setSavedMessage(result.savedMessage);
    if (result.stage === "brief_ready") {
      setWorkflowStage("brief_ready");
    }
    if (result.stage === "draft") {
      setWorkflowStage(result.values.approvedBrief ? "brief_ready" : "draft");
    }

    if (result.redirectTo) {
      router.push(result.redirectTo as Route);
      router.refresh();
    }
  }

  function handleSaveDraft() {
    setSavedMessage(undefined);

    startSaving(async () => {
      const result = await saveDraftExperimentAction(values);
      applyActionResult(result);
    });
  }

  function handleAnalyzeBrief() {
    setSavedMessage(undefined);

    startAnalyzing(async () => {
      const result = await prepareExperimentBriefAction(values);
      applyActionResult(result);
    });
  }

  function handleGenerate() {
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
              <p className="builder-kicker">Merchandiser brief</p>
              <span className="shell-badge">Mocked agent pipeline</span>
            </div>
            <h2 className="builder-section-title">Storefront experiment setup</h2>
            <p className="muted builder-section-copy">
              Define the storefront surface, approve the synthesized brief, then
              generate copy-first creative directions without exposing technical
              implementation details.
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
                <p className="builder-section-kicker">Step 1</p>
                <p className="muted builder-section-copy">
                  Set the core experiment framing the merchandiser cares about.
                </p>
              </div>

              <div className="stack builder-fields-grid">
                <FormField
                  label="Experiment name"
                  htmlFor="name"
                  required
                  error={fieldErrors.name}
                >
                  <Input
                    id="name"
                    value={values.name}
                    onChange={(event) => setFieldValue("name", event.target.value)}
                    placeholder="Spring hero banner test"
                  />
                </FormField>

                <div className="builder-three-column-grid">
                  <FormField
                    label="Component type"
                    htmlFor="componentType"
                    required
                    error={fieldErrors.componentType}
                  >
                    <select
                      id="componentType"
                      className="field-base"
                      value={values.componentType}
                      onChange={(event) =>
                        setFieldValue("componentType", event.target.value)
                      }
                    >
                      {componentTypes.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Primary goal"
                    htmlFor="primaryGoal"
                    required
                    error={fieldErrors.primaryGoal}
                  >
                    <select
                      id="primaryGoal"
                      className="field-base"
                      value={values.primaryGoal}
                      onChange={(event) =>
                        setFieldValue("primaryGoal", event.target.value)
                      }
                    >
                      {primaryGoals.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Traffic split"
                    htmlFor="trafficSplit"
                    required
                    error={fieldErrors.trafficSplit}
                  >
                    <select
                      id="trafficSplit"
                      className="field-base"
                      value={values.trafficSplit}
                      onChange={(event) =>
                        setFieldValue(
                          "trafficSplit",
                          event.target.value as ExperimentBuilderValues["trafficSplit"],
                        )
                      }
                    >
                      {trafficSplitOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>
            </section>

            <section className="builder-section-card stack">
              <div className="builder-section-header stack">
                <p className="builder-section-kicker">Step 2</p>
                <p className="muted builder-section-copy">
                  Add audience context, tone, and non-negotiable brand guardrails.
                </p>
              </div>

              <div className="stack builder-fields-grid">
                <FormField
                  label="Target audience"
                  htmlFor="targetAudience"
                  required
                  error={fieldErrors.targetAudience}
                >
                  <TextArea
                    id="targetAudience"
                    value={values.targetAudience}
                    onChange={(event) =>
                      setFieldValue("targetAudience", event.target.value)
                    }
                    placeholder="Returning shoppers looking for premium seasonal pieces"
                  />
                </FormField>

                <div className="builder-two-column-grid">
                  <FormField
                    label="Brand tone"
                    htmlFor="brandTone"
                    required
                    error={fieldErrors.brandTone}
                  >
                    <select
                      id="brandTone"
                      className="field-base"
                      value={values.brandTone}
                      onChange={(event) => setFieldValue("brandTone", event.target.value)}
                    >
                      {brandTones.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Locked elements"
                    htmlFor="lockedElements"
                    required
                    error={fieldErrors.lockedElements}
                  >
                    <div id="lockedElements" className="builder-checkbox-grid">
                      {lockedElementOptions.map((option) => {
                        const checked = values.lockedElements.includes(option);
                        return (
                          <label key={option} className="builder-checkbox-card">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setFieldValue(
                                  "lockedElements",
                                  checked
                                    ? values.lockedElements.filter((item) => item !== option)
                                    : [...values.lockedElements, option],
                                );
                              }}
                            />
                            <span>{option.replace("Lock ", "")}</span>
                          </label>
                        );
                      })}
                    </div>
                  </FormField>
                </div>

                <FormField
                  label="Brand constraints"
                  htmlFor="brandConstraints"
                  required
                  error={fieldErrors.brandConstraints}
                >
                  <TextArea
                    id="brandConstraints"
                    value={values.brandConstraints}
                    onChange={(event) =>
                      setFieldValue("brandConstraints", event.target.value)
                    }
                    placeholder="Avoid discount framing, keep copy product-led, never mention competitors"
                  />
                </FormField>
              </div>
            </section>

            <section className="builder-section-card stack">
              <div className="builder-section-header stack">
                <p className="builder-section-kicker">Step 3</p>
                <p className="muted builder-section-copy">
                  Define the seed context and the creative angle the agent should test.
                </p>
              </div>

              <div className="stack builder-fields-grid">
                <FormField
                  label="Seed context"
                  htmlFor="seedContext"
                  required
                  error={fieldErrors.seedContext}
                >
                  <TextArea
                    id="seedContext"
                    value={values.seedContext}
                    onChange={(event) => setFieldValue("seedContext", event.target.value)}
                    placeholder="Feature lightweight outerwear and transitional layering for spring"
                  />
                </FormField>

                <FormField
                  label="What to test"
                  htmlFor="whatToTest"
                  required
                  error={fieldErrors.whatToTest}
                >
                  <TextArea
                    id="whatToTest"
                    value={values.whatToTest}
                    onChange={(event) => setFieldValue("whatToTest", event.target.value)}
                    placeholder="Generate one headline direction that emphasizes product quality, not the season. Keep CTA under 4 words."
                  />
                </FormField>
              </div>
            </section>

            {values.approvedBrief ? (
              <section className="builder-section-card stack">
                <div className="builder-section-header stack">
                  <p className="builder-section-kicker">Brief confirmation</p>
                  <p className="muted builder-section-copy">
                    This confirmation step is required before the mocked pipeline
                    continues to copy generation.
                  </p>
                </div>

                <div className="builder-brief-confirmation">
                  <div className="builder-brief-card">
                    <span className="builder-brief-label">Hypothesis</span>
                    <p>{values.approvedBrief.hypothesis}</p>
                  </div>
                  <div className="builder-brief-grid">
                    <BriefListCard
                      title="What is changing"
                      items={values.approvedBrief.whatIsChanging}
                    />
                    <BriefListCard
                      title="What is locked"
                      items={values.approvedBrief.whatIsLocked}
                    />
                    <BriefListCard
                      title="Success metric"
                      items={[values.approvedBrief.successMetric]}
                    />
                    <BriefListCard
                      title="Audience signal"
                      items={[values.approvedBrief.audienceSignal]}
                    />
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          <div className="builder-action-rail">
            <div className="stack builder-action-copy">
              <p className="builder-section-kicker">Pipeline controls</p>
              <p className="muted builder-action-note">
                Save the brief, analyze inputs into a confirmation card, then
                generate the next saved storefront output.
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
                variant="secondary"
                onClick={handleAnalyzeBrief}
                loading={isAnalyzing}
                disabled={isBusy}
              >
                Analyze Inputs
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={isBusy || !values.approvedBrief}
              >
                Approve Brief & Generate Output
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="stack builder-side-column">
        <Card className="builder-side-panel">
          <div className="stack builder-side-stack">
            <div className="cluster builder-kicker-row">
              <h2 className="builder-side-title">Workflow stages</h2>
              <span className="builder-side-pill">Friendly status only</span>
            </div>
            <div className="builder-guidance-card">
              <p className="builder-guidance-title">What the merchandiser sees</p>
              <div className="builder-pipeline-list">
                <PipelineRow
                  label="Analyzing your inputs..."
                  state={isAnalyzing ? "Running" : values.approvedBrief ? "Ready" : "Pending"}
                />
                <PipelineRow
                  label="Writing output copy..."
                  state={isGenerating ? "Running" : workflowStage === "brief_ready" ? "Queued" : "Pending"}
                />
                <PipelineRow
                  label="Building previews..."
                  state={isGenerating ? "Queued" : values.approvedBrief ? "Ready after generation" : "Pending"}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="builder-side-panel">
          <div className="stack builder-side-stack">
            <div className="cluster builder-kicker-row">
              <h2 className="builder-side-title">Brief preview</h2>
              <span className="builder-status-chip">
                {values.approvedBrief ? "Awaiting approval" : "Drafting"}
              </span>
            </div>

            <div className="builder-preview-frame">
              <div className="builder-preview-stage is-merch">
                <p className="builder-preview-kicker">{values.componentType}</p>
                <h3 className="builder-preview-title">
                  {values.name || "Your experiment name will appear here"}
                </h3>
                <p className="muted builder-preview-copy">
                  {values.whatToTest ||
                    "Describe the copy behavior the agent should test for this storefront surface."}
                </p>
              </div>

              <dl className="builder-preview-metadata">
                <div className="builder-preview-meta-item">
                  <dt className="builder-preview-meta-label">Audience</dt>
                  <dd className="builder-preview-meta-value">
                    {values.targetAudience || "Add the target audience signal."}
                  </dd>
                </div>
                <div className="builder-preview-meta-item">
                  <dt className="builder-preview-meta-label">Tone</dt>
                  <dd className="builder-preview-meta-value">{values.brandTone}</dd>
                </div>
                <div className="builder-preview-meta-item">
                  <dt className="builder-preview-meta-label">Traffic split</dt>
                  <dd className="builder-preview-meta-value">{values.trafficSplit}</dd>
                </div>
                <div className="builder-preview-meta-item">
                  <dt className="builder-preview-meta-label">Locked elements</dt>
                  <dd className="builder-preview-meta-value">
                    {values.lockedElements.map((item) => item.replace("Lock ", "")).join(", ")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function BriefListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="builder-brief-card">
      <span className="builder-brief-label">{title}</span>
      <ul className="builder-brief-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PipelineRow({ label, state }: { label: string; state: string }) {
  return (
    <div className="builder-readiness-row">
      <div className="cluster" style={{ gap: 10 }}>
        <span aria-hidden="true" className="builder-readiness-dot is-ready" />
        <span>{label}</span>
      </div>
      <span className="builder-readiness-state">{state}</span>
    </div>
  );
}
