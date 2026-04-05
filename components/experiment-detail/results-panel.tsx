"use client";

import React from "react";
import { VariantPreviewCard } from "@/components/ui/variant-preview-card";

type DetailExperiment = {
  id: string;
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
};

export function ExperimentResultsPanel({ experiment }: { experiment: DetailExperiment }) {
  const variants = experiment.latestSavedRun?.variants ?? [];
  const activeOutput = variants[0];

  if (!activeOutput) {
    return null;
  }

  return (
    <section className="stack detail-section">
      <div className="detail-variant-grid">
        <VariantPreviewCard key={activeOutput.id} variant={activeOutput} />
      </div>
    </section>
  );
}
