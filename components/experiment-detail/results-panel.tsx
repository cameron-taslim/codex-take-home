"use client";

import React, { useState, useTransition } from "react";
import { launchExperimentAction, updateVariantCopyAction } from "@/app/experiments/[id]/actions";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
import { VariantPreviewCard } from "@/components/ui/variant-preview-card";

type DetailExperiment = {
  id: string;
  goal: string;
  status: string;
  latestSavedRun: {
    variants: Array<{
      id: string;
      label: string;
      headline: string;
      subheadline: string | null;
      bodyCopy: string;
      ctaText: string;
      previewConfig: unknown;
      generationRunId: string;
      experimentId: string;
      position: number;
      createdAt: Date;
      updatedAt: Date;
      layoutNotes: string;
    }>;
  } | null;
  launchMetric: string | null;
  launchAt: Date | null;
};

type DetailVariant = NonNullable<DetailExperiment["latestSavedRun"]>["variants"][number];

export function ExperimentResultsPanel({ experiment }: { experiment: DetailExperiment }) {
  const [launchMetric, setLaunchMetric] = useState(experiment.launchMetric ?? experiment.goal);
  const [launchAt, setLaunchAt] = useState(
    experiment.launchAt ? toLocalInputValue(experiment.launchAt) : "2026-04-10T09:00",
  );
  const [launchError, setLaunchError] = useState<string>();
  const [launchNotice, setLaunchNotice] = useState<string>();
  const [isLaunching, startLaunching] = useTransition();

  const variants = experiment.latestSavedRun?.variants ?? [];

  function handleLaunch() {
    setLaunchError(undefined);
    setLaunchNotice(undefined);

    startLaunching(async () => {
      const result = await launchExperimentAction({
        experimentId: experiment.id,
        launchAt,
        launchMetric,
      });

      if (result.formError) {
        setLaunchError(result.formError);
        return;
      }

      setLaunchNotice("Experiment launched. Hidden config was written for the engineering handoff.");
    });
  }

  return (
    <div className="detail-results-layout">
      <section className="stack detail-section">
        <div className="detail-section-header">
          <div className="stack" style={{ gap: 6 }}>
            <p className="builder-section-kicker">Variant preview panel</p>
            <h2 className="detail-section-title">Live creative directions</h2>
            <p className="muted detail-section-copy">
              Review the rendered storefront variants and tweak copy without rerunning
              the full pipeline.
            </p>
          </div>
        </div>

        <div className="detail-variant-grid">
          {variants.map((variant) => (
            <EditableVariantCard
              key={variant.id}
              experimentId={experiment.id}
              variant={variant}
            />
          ))}
        </div>
      </section>

      <section className="stack detail-section">
        <div className="detail-section-header">
          <div className="stack" style={{ gap: 6 }}>
            <p className="builder-section-kicker">Launch controls</p>
            <h2 className="detail-section-title">Go live</h2>
            <p className="muted detail-section-copy">
              Confirm the rollout settings the merchandiser should see before the
              experiment status changes to Live.
            </p>
          </div>
        </div>

        <div className="detail-launch-card">
          {launchError ? <ErrorBanner message={launchError} /> : null}
          {launchNotice ? <div className="builder-success-banner">{launchNotice}</div> : null}

          <div className="builder-two-column-grid">
            <label className="stack form-field">
              <span className="form-label">Primary metric</span>
              <select
                className="field-base"
                value={launchMetric}
                onChange={(event) => setLaunchMetric(event.target.value)}
              >
                <option>Increase clickthrough rate</option>
                <option>Increase add-to-cart rate</option>
                <option>Increase revenue per visitor</option>
                <option>Reduce bounce rate</option>
              </select>
            </label>

            <label className="stack form-field">
              <span className="form-label">Launch date and time</span>
              <input
                className="field-base"
                type="datetime-local"
                value={launchAt}
                onChange={(event) => setLaunchAt(event.target.value)}
              />
            </label>
          </div>

          <Button
            type="button"
            onClick={handleLaunch}
            loading={isLaunching}
            disabled={variants.length === 0}
          >
            Launch Experiment
          </Button>
        </div>
      </section>
    </div>
  );
}

function EditableVariantCard({
  experimentId,
  variant,
}: {
  experimentId: string;
  variant: DetailVariant;
}) {
  const [headline, setHeadline] = useState(variant.headline);
  const [subheadline, setSubheadline] = useState(variant.subheadline ?? "");
  const [ctaText, setCtaText] = useState(variant.ctaText);
  const [rationale, setRationale] = useState(variant.bodyCopy);
  const [formError, setFormError] = useState<string>();
  const [savedMessage, setSavedMessage] = useState<string>();
  const [isSaving, startSaving] = useTransition();

  function handleSave() {
    setFormError(undefined);
    setSavedMessage(undefined);

    startSaving(async () => {
      const result = await updateVariantCopyAction({
        experimentId,
        variantId: variant.id,
        headline,
        subheadline,
        ctaText,
        rationale,
      });

      if (result.formError) {
        setFormError(result.formError);
        return;
      }

      setSavedMessage("Copy updated.");
    });
  }

  return (
    <VariantPreviewCard
      variant={{
        ...variant,
        headline,
        subheadline,
        ctaText,
        bodyCopy: rationale,
      }}
      editableCopy={
        <div className="stack" style={{ gap: 12 }}>
          {formError ? <ErrorBanner message={formError} /> : null}
          {savedMessage ? <div className="builder-success-banner">{savedMessage}</div> : null}
          <label className="stack form-field">
            <span className="form-label">Headline</span>
            <input
              className="field-base"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </label>
          <label className="stack form-field">
            <span className="form-label">Subheadline</span>
            <textarea
              className="field-base"
              value={subheadline}
              onChange={(event) => setSubheadline(event.target.value)}
            />
          </label>
          <label className="stack form-field">
            <span className="form-label">CTA</span>
            <input
              className="field-base"
              value={ctaText}
              onChange={(event) => setCtaText(event.target.value)}
            />
          </label>
          <label className="stack form-field">
            <span className="form-label">Creative rationale</span>
            <textarea
              className="field-base"
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
            />
          </label>
          <Button type="button" variant="secondary" onClick={handleSave} loading={isSaving}>
            Edit copy
          </Button>
        </div>
      }
    />
  );
}

function toLocalInputValue(value: Date) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}
