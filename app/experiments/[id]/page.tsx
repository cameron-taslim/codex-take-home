import React from "react";
import { notFound } from "next/navigation";
import { ExperimentDetailHeader } from "@/components/experiment-detail/detail-header";
import { ExperimentResultsPanel } from "@/components/experiment-detail/results-panel";
import { RerunControls } from "@/components/experiment-detail/rerun-controls";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
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
  const latestVariants = latestSavedRun?.variants ?? [];

  return (
    <AppShell
      title={experiment.name}
      description="Review the latest saved output, refine the next generation prompt, and inspect run history."
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
              <MetadataItem label="Primary goal" value={experiment.goal} />
              <MetadataItem label="Audience" value={experiment.targetAudience} />
              <MetadataItem label="Brand tone" value={experiment.tone} />
              <MetadataItem label="Traffic split" value={experiment.trafficSplit} />
              <MetadataItem label="Brand constraints" value={experiment.brandConstraints} />
              <MetadataItem
                label="What to test"
                value={experiment.whatToTest || "No test prompt saved"}
              />
              <MetadataItem
                label="Locked elements"
                value={
                  Array.isArray(experiment.lockedElements)
                    ? experiment.lockedElements
                        .map((item) =>
                          typeof item === "string" ? item.replace("Lock ", "") : "",
                        )
                        .filter(Boolean)
                        .join(", ")
                    : "None selected"
                }
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
              {latestVariants.length > 0 ? (
                <ExperimentResultsPanel experiment={experiment} />
              ) : (
                <EmptyState
                  title="No saved output yet"
                  description="Approve the brief and generate output before editing copy or launching this experiment."
                />
              )}

              <Card className="detail-history-panel detail-history-panel-inline">
                <div className="stack detail-history-stack">
                  <h2 className="detail-section-title">Generation history</h2>

                  {experiment.generationHistory.length > 0 ? (
                    <div className="stack detail-history-list">
                      {experiment.generationHistory.map((run, index) => (
                        <HistoryItem
                          key={run.id}
                          id={run.id}
                          status={run.status}
                          startedAt={run.startedAt}
                          completedAt={run.completedAt}
                          errorMessage={run.errorMessage}
                          variantCount={run.variantCount}
                          isLatest={index === 0}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No generation runs yet"
                      description="Start the first run from the approved brief to populate generation history."
                    />
                  )}
                </div>
              </Card>
            </div>

            <aside className="stack detail-side-column">
              <RerunControls
                experimentId={experiment.id}
                suggestions={buildPromptSuggestions(experiment, latestVariants)}
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

function HistoryItem({
  id,
  status,
  startedAt,
  completedAt,
  errorMessage,
  variantCount,
  isLatest,
}: {
  id: string;
  status: "pending" | "running" | "succeeded" | "failed";
  startedAt: Date;
  completedAt: Date | null;
  errorMessage: string | null;
  variantCount: number;
  isLatest: boolean;
}) {
  return (
    <Card className={`detail-history-item ${isLatest ? "is-latest" : ""}`}>
      <div className="detail-history-item-topbar">
        <strong>{formatRunStatus(status)}</strong>
        <span className="detail-history-date">{formatDate(startedAt)}</span>
      </div>
      <p className="detail-history-copy">
        {variantCount} saved output{variantCount === 1 ? "" : "s"}
        {completedAt ? ` • Completed ${formatDate(completedAt)}` : ""}
      </p>
      {errorMessage ? <p className="detail-history-error">{errorMessage}</p> : null}
      <p className="detail-history-id">Run {id}</p>
    </Card>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRunStatus(status: "pending" | "running" | "succeeded" | "failed") {
  if (status === "succeeded") {
    return "Generated";
  }

  if (status === "failed") {
    return "Failed";
  }

  return "Generating";
}


function buildPromptSuggestions(
  experiment: {
    goal: string;
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
        ? `Replace "${leadVariant.ctaText}" with a stronger CTA for ${experiment.goal.toLowerCase()}.`
        : `Use a stronger CTA to support ${experiment.goal.toLowerCase()}.`,
    },
    {
      title: "Explore a fresh subheadline",
      prompt: leadVariant?.subheadline
        ? `Keep the ${experiment.tone.toLowerCase()} tone. Improve the subheadline beyond "${leadVariant.subheadline}".`
        : `Keep the ${experiment.tone.toLowerCase()} tone. Add a more benefit-led subheadline.`,
    },
  ];
}
