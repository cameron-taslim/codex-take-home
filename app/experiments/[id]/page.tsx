import React from "react";
import { notFound } from "next/navigation";
import { ExperimentDetailHeader } from "@/components/experiment-detail/detail-header";
import { ExperimentResultsPanel } from "@/components/experiment-detail/results-panel";
import { RerunControls } from "@/components/experiment-detail/rerun-controls";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { requireUserSession } from "@/lib/auth/session";
import { generateExperimentSuggestions } from "@/lib/codex/service";
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
              <React.Suspense
                fallback={
                  <RerunControls
                    experimentId={experiment.id}
                    suggestions={[]}
                    defaultPrompt={experiment.whatToTest}
                    isLoading
                  />
                }
              >
                <DetailRerunControls
                  experiment={experiment}
                  experimentId={experiment.id}
                  latestVariant={activeVariants[0] ?? null}
                />
              </React.Suspense>
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

async function DetailRerunControls({
  experiment,
  experimentId,
  latestVariant,
}: {
  experiment: {
    name: string;
    pageType: string;
    targetAudience: string;
    tone: string;
    brandConstraints: string;
    seedContext: string | null;
    whatToTest: string;
  };
  experimentId: string;
  latestVariant: {
    headline: string;
    subheadline: string | null;
    bodyCopy: string;
    ctaText: string;
    layoutNotes: string;
  } | null;
}) {
  const suggestions = await generateExperimentSuggestions({
    experiment,
    latestVariant,
  });

  return (
    <RerunControls
      experimentId={experimentId}
      suggestions={suggestions}
      defaultPrompt={experiment.whatToTest}
    />
  );
}
