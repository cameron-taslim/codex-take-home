"use client";

import React from "react";
import { VariantHtmlPreview } from "@/components/ui/variant-html-preview";
import { VariantPreviewCard } from "@/components/ui/variant-preview-card";
import type { VariantRecord } from "@/lib/domain/types";

type DetailExperiment = {
  activeSavedRun: {
    variants: VariantRecord[];
  } | null;
};

export function ExperimentResultsPanel({ experiment }: { experiment: DetailExperiment }) {
  const variants = experiment.activeSavedRun?.variants ?? [];
  const activeOutput = variants[0];
  const savedHtml = activeOutput?.htmlContent?.trim() ?? "";

  if (!activeOutput) {
    return null;
  }

  return (
    <section className="stack detail-section">
      <div className="detail-variant-grid">
        {savedHtml ? (
          <VariantHtmlPreview key={activeOutput.id} variant={activeOutput} />
        ) : (
          <div className="stack">
            <p className="detail-recovery-note">
              Saved HTML preview unavailable for this record. Showing the structured
              fallback.
            </p>
            <VariantPreviewCard key={activeOutput.id} variant={activeOutput} />
          </div>
        )}
      </div>
    </section>
  );
}
