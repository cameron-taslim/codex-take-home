"use client";

import React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
      router.push(result.redirectTo);
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
    <div
      className="builder-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.9fr)",
        gap: 20,
      }}
    >
      <Card style={{ padding: 24 }}>
        <div className="stack" style={{ gap: 18 }}>
          <div className="stack" style={{ gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: "1.3rem" }}>Structured brief</h2>
            <p className="muted" style={{ margin: 0 }}>
              Save a recoverable draft first or send the full brief to Codex to
              generate 2 to 3 storefront variants.
            </p>
          </div>

          {formError ? <ErrorBanner message={formError} /> : null}
          {savedMessage ? (
            <div
              role="status"
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                background: "var(--success-soft)",
                color: "var(--success)",
                border: "1px solid rgba(2, 122, 72, 0.18)",
              }}
            >
              {savedMessage}
            </div>
          ) : null}

          <div className="stack" style={{ gap: 16 }}>
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

          <div className="cluster" style={{ justifyContent: "space-between" }}>
            <p className="muted" style={{ margin: 0 }}>
              Required for generation: name, goal, page type, target audience,
              and tone.
            </p>
            <div className="cluster" style={{ justifyContent: "flex-end" }}>
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

      <div className="stack">
        <Card style={{ padding: 24 }}>
          <div className="stack" style={{ gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Generation guide</h2>
            <p className="muted" style={{ margin: 0 }}>
              Codex runs on the server after the brief is persisted. Generated
              variants are saved with prompt snapshots and kept in run history.
            </p>
            <div
              style={{
                padding: 14,
                borderRadius: "var(--radius-sm)",
                background: "var(--accent-soft)",
              }}
            >
              <p style={{ margin: "0 0 8px", fontWeight: 700 }}>
                What the run will emphasize
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
                <li>Audience and tone alignment</li>
                <li>Brand-safe CTA and messaging</li>
                <li>Structured preview content, not arbitrary code</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <div className="stack" style={{ gap: 14 }}>
            <div className="cluster" style={{ justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Preview placeholder</h2>
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "var(--surface-muted)",
                  color: "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Awaiting generation
              </span>
            </div>
            <div
              style={{
                padding: 18,
                borderRadius: "var(--radius-md)",
                background:
                  "linear-gradient(135deg, rgba(15, 118, 110, 0.16), rgba(255, 255, 255, 0.72))",
                border: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  fontWeight: 700,
                }}
              >
                Draft summary
              </p>
              <h3 style={{ margin: "10px 0 8px", fontSize: "1.5rem" }}>
                {values.name || "Your experiment name will appear here"}
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                {values.goal ||
                  "Add a business goal so the generated variants have a clear conversion target."}
              </p>
            </div>
            <dl
              style={{
                margin: 0,
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                gap: 12,
              }}
            >
              <div>
                <dt className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
                  Page type
                </dt>
                <dd style={{ margin: "4px 0 0" }}>
                  {values.pageType || "Select the storefront surface."}
                </dd>
              </div>
              <div>
                <dt className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
                  Audience
                </dt>
                <dd style={{ margin: "4px 0 0" }}>
                  {values.targetAudience || "Clarify who this variant should persuade."}
                </dd>
              </div>
              <div>
                <dt className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
                  Tone
                </dt>
                <dd style={{ margin: "4px 0 0" }}>
                  {values.tone || "Set the voice for the generated copy."}
                </dd>
              </div>
            </dl>
          </div>
        </Card>
      </div>
    </div>
  );
}
