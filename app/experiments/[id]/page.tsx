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
          approvedBrief={
            experiment.approvedBrief ? (
              <div className="detail-approved-brief detail-approved-brief-compact">
                <h2 className="detail-section-title">Approved brief</h2>
                <p className="detail-brief-hypothesis">
                  {safeBriefValue(experiment.approvedBrief, "hypothesis")}
                </p>
                <div className="detail-brief-grid">
                  <DetailList
                    title="What is changing"
                    items={safeBriefList(experiment.approvedBrief, "whatIsChanging")}
                  />
                  <DetailList
                    title="What is locked"
                    items={safeBriefList(experiment.approvedBrief, "whatIsLocked")}
                  />
                  <DetailList
                    title="Success metric"
                    items={[safeBriefValue(experiment.approvedBrief, "successMetric")]}
                  />
                  <DetailList
                    title="Audience signal"
                    items={[safeBriefValue(experiment.approvedBrief, "audienceSignal")]}
                  />
                </div>
              </div>
            ) : undefined
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
                  <div className="stack" style={{ gap: 6 }}>
                    <p className="builder-section-kicker">Run ledger</p>
                    <h2 className="detail-section-title">Generation history</h2>
                    <p className="muted detail-section-copy">
                      Every saved run stays visible below the active output workspace.
                    </p>
                  </div>

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

function DetailList({ title, items }: { title: string; items: string[] }) {
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

function safeBriefValue(value: unknown, key: string) {
  if (value && typeof value === "object" && key in value) {
    const item = (value as Record<string, unknown>)[key];
    return typeof item === "string" ? item : "";
  }

  return "";
}

function safeBriefList(value: unknown, key: string) {
  if (value && typeof value === "object" && key in value) {
    const item = (value as Record<string, unknown>)[key];
    return Array.isArray(item) ? item.filter((entry): entry is string => typeof entry === "string") : [];
  }

  return [];
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
        ? `Generate a stronger urgency-led headline direction than "${leadVariant.headline}" while still targeting ${experiment.targetAudience.toLowerCase()} and protecting this constraint: ${experiment.brandConstraints}.`
        : `Generate a sharper headline direction for ${experiment.targetAudience.toLowerCase()} while protecting this constraint: ${experiment.brandConstraints}.`,
    },
    {
      title: "Test a new CTA angle",
      prompt: leadVariant
        ? `Keep the current positioning but replace the CTA "${leadVariant.ctaText}" with a higher-intent alternative that supports ${experiment.goal.toLowerCase()}.`
        : `Generate a CTA-led output that supports ${experiment.goal.toLowerCase()} without changing the approved audience focus.`,
    },
    {
      title: "Explore a fresh subheadline",
      prompt: leadVariant?.subheadline
        ? `Keep the overall ${experiment.tone.toLowerCase()} tone but propose a more benefit-led subheadline than "${leadVariant.subheadline}".`
        : `Keep the overall ${experiment.tone.toLowerCase()} tone but introduce a more benefit-led subheadline and supporting copy direction.`,
    },
  ];
}
