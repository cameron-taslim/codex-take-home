"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  generateExperimentAction,
  prepareExperimentBriefAction,
} from "@/app/experiments/new/actions";
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

const componentTypes = [
  "Hero banner",
  "Landing page",
  "Product detail page (PDP) buy box",
  "Navigation CTA",
  "Category page header",
] as const;

const brandTones = [
  "Editorial",
  "Urgent",
  "Playful",
  "Minimalist",
  "Confident",
  "Warm",
] as const;

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
  const [isGenerating, startGenerating] = useTransition();

  const isBusy = isGenerating;

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
    if (field !== "approvedBrief" && values.approvedBrief) {
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

    if (result.redirectTo) {
      router.push(result.redirectTo as Route);
      router.refresh();
    }
  }

  function handleGenerate() {
    setSavedMessage(undefined);

    startGenerating(async () => {
      const preparedResult = values.approvedBrief
        ? ({ values } as ExperimentBuilderActionResult)
        : await prepareExperimentBriefAction(values);

      if (!preparedResult.values.approvedBrief || preparedResult.fieldErrors || preparedResult.formError) {
        applyActionResult(preparedResult);
        return;
      }

      const result = await generateExperimentAction(preparedResult.values);
      applyActionResult(result);
    });
  }

  return (
    <div className="builder-layout">
      <Card className="builder-form-panel builder-form-panel-compact">
        <div className="stack builder-panel-stack">
          <div className="builder-inline-header">
            <h1 className="builder-inline-title">Create experiment</h1>
          </div>

          {formError ? <ErrorBanner message={formError} /> : null}
          {savedMessage ? (
            <div role="status" className="builder-success-banner">
              {savedMessage}
            </div>
          ) : null}

          <div className="builder-sections builder-sections-compact">
            <section className="builder-section-card stack builder-section-card-step1">
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

                <div className="builder-two-column-grid">
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
                </div>
              </div>
            </section>

            <section className="builder-section-card stack">
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
                    style={{ minHeight: 84 }}
                  />
                </FormField>

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
                    style={{ minHeight: 84 }}
                  />
                </FormField>
              </div>
            </section>

            <section className="builder-section-card stack">
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
                    style={{ minHeight: 84 }}
                  />
                </FormField>

                <FormField
                  label="Extra prompt"
                  htmlFor="whatToTest"
                  required
                  error={fieldErrors.whatToTest}
                >
                  <TextArea
                    id="whatToTest"
                    value={values.whatToTest}
                    onChange={(event) => setFieldValue("whatToTest", event.target.value)}
                    placeholder="Generate one headline direction that emphasizes product quality, not the season. Keep CTA under 4 words."
                    style={{ minHeight: 84 }}
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
            <div className="cluster builder-action-buttons">
              <Button
                type="button"
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={isBusy}
                style={{ minWidth: 220 }}
              >
                Generate Output
              </Button>
            </div>
          </div>
        </div>
      </Card>
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
