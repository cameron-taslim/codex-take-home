import React from "react";
import { notFound } from "next/navigation";
import { ExperimentDetailHeader } from "@/components/experiment-detail/detail-header";
import { ExperimentResultsPanel } from "@/components/experiment-detail/results-panel";
import { RerunControls } from "@/components/experiment-detail/rerun-controls";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { requireUserSession } from "@/lib/auth/session";
import { getExperimentDetailForUser } from "@/lib/repositories/experiment-repository";

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUserSession();
  const experiment = await getExperimentDetailForUser(id, session.user.id);

  if (!experiment) {
    notFound();
  }

  const latestRun = experiment.latestGenerationRun;
  const latestSavedRun = experiment.latestSavedRun;
  const activeVariants = latestSavedRun?.variants ?? [];

  return (
    <AppShell
      title={experiment.name}
      description="Review the latest saved output and refine the next generation prompt."
      customHeader={
        <ExperimentDetailHeader
          experimentId={experiment.id}
          title={experiment.name}
          failureMessage={
            latestRun?.status === "failed" ? (
              <ErrorBanner
                message={
                  latestRun.errorMessage
                    ? `Latest generation failed: ${latestRun.errorMessage}`
                    : "Latest generation failed. You can retry from the saved brief."
                }
              />
            ) : undefined
          }
          metadata={
            <dl className="detail-summary-grid">
              <MetadataItem label="Component type" value={experiment.pageType} />
              <MetadataItem label="Audience" value={experiment.targetAudience} />
              <MetadataItem label="Brand tone" value={experiment.tone} />
              <MetadataItem label="Brand constraints" value={experiment.brandConstraints} />
              <MetadataItem
                label="Extra prompt"
                value={experiment.whatToTest || "No test prompt saved"}
              />
            </dl>
          }
        />
      }
      activeExperimentId={experiment.id}
    >
      <div className="detail-layout">
        <div className="stack detail-main-column">
          <div className="detail-workspace">
            <div className="stack detail-workspace-main">
              {activeVariants.length > 0 ? (
                <ExperimentResultsPanel experiment={{ activeSavedRun: latestSavedRun }} />
              ) : (
                <EmptyState
                  title="No saved output yet"
                  description="Generate output before reviewing this experiment."
                />
              )}
            </div>

            <aside className="stack detail-side-column">
              <RerunControls
                experimentId={experiment.id}
                suggestions={buildPromptSuggestions(experiment, activeVariants)}
                defaultPrompt={experiment.whatToTest}
              />
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-meta-item">
      <dt className="detail-meta-label">{label}</dt>
      <dd className="detail-meta-value">{value}</dd>
    </div>
  );
}

function buildPromptSuggestions(
  experiment: {
    targetAudience: string;
    tone: string;
    brandConstraints: string;
  },
  variants: Array<{
    headline: string;
    ctaText: string;
    subheadline: string | null;
  }>,
) {
  const leadVariant = variants[0];

  return [
    {
      title: "Push a sharper headline",
      prompt: leadVariant
        ? `Sharpen the headline beyond "${leadVariant.headline}" for ${experiment.targetAudience.toLowerCase()}. Keep: ${experiment.brandConstraints}.`
        : `Sharpen the headline for ${experiment.targetAudience.toLowerCase()}. Keep: ${experiment.brandConstraints}.`,
    },
    {
      title: "Test a new CTA angle",
      prompt: leadVariant
        ? `Replace "${leadVariant.ctaText}" with a stronger CTA for ${experiment.targetAudience.toLowerCase()}.`
        : `Use a stronger CTA for ${experiment.targetAudience.toLowerCase()}.`,
    },
    {
      title: "Explore a fresh subheadline",
      prompt: leadVariant?.subheadline
        ? `Keep the ${experiment.tone.toLowerCase()} tone. Improve the subheadline beyond "${leadVariant.subheadline}".`
        : `Keep the ${experiment.tone.toLowerCase()} tone. Add a more benefit-led subheadline.`,
    },
  ];
}
