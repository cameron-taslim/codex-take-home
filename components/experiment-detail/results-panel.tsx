"use client";

import React from "react";
import { VariantHtmlPreview } from "@/components/ui/variant-html-preview";
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
          <p className="detail-recovery-note">
            Saved HTML preview unavailable for this record.
          </p>
        )}
      </div>
    </section>
  );
}
