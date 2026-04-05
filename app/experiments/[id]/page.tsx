import React from "react";
import { notFound } from "next/navigation";
import { ExperimentResultsPanel } from "@/components/experiment-detail/results-panel";
import { RerunControls } from "@/components/experiment-detail/rerun-controls";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { StatusBadge } from "@/components/ui/status-badge";
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
      description="Review the approved brief, edit generated copy in live previews, and launch the storefront experiment."
      headerAction={<RerunControls experimentId={experiment.id} />}
      activeExperimentId={experiment.id}
    >
      <div className="detail-layout">
        <div className="stack detail-main-column">
          <Card className="detail-summary-panel">
            <div className="detail-summary-topbar">
              <div className="stack detail-summary-heading">
                <p className="builder-kicker">Experiment summary</p>
                <h2 className="detail-section-title">{experiment.name}</h2>
                <p className="muted detail-summary-copy">
                  Approved brief context, current launch state, and the latest
                  saved creative directions.
                </p>
              </div>
              <StatusBadge status={experiment.status} />
            </div>

            {latestRun?.status === "failed" ? (
              <ErrorBanner
                message={
                  latestRun.errorMessage
                    ? `Latest generation failed: ${latestRun.errorMessage}`
                    : "Latest generation failed. You can retry from the saved brief."
                }
              />
            ) : null}

            <dl className="detail-summary-grid">
              <MetadataItem label="Component type" value={experiment.pageType} />
              <MetadataItem label="Primary goal" value={experiment.goal} />
              <MetadataItem label="Traffic split" value={experiment.trafficSplit} />
              <MetadataItem label="Audience" value={experiment.targetAudience} />
              <MetadataItem label="Brand tone" value={experiment.tone} />
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

            {experiment.approvedBrief ? (
              <div className="detail-approved-brief">
                <h3 className="detail-section-title">Approved brief</h3>
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
            ) : null}
          </Card>

          {latestVariants.length > 0 ? (
            <ExperimentResultsPanel experiment={experiment} />
          ) : (
            <EmptyState
              title="No saved variants yet"
              description="Approve the brief and generate variants before editing copy or launching this experiment."
              action={<RerunControls experimentId={experiment.id} />}
            />
          )}
        </div>

        <aside className="stack detail-side-column">
          <Card className="detail-history-panel">
            <div className="stack detail-history-stack">
              <div className="stack" style={{ gap: 6 }}>
                <p className="builder-section-kicker">Run ledger</p>
                <h2 className="detail-section-title">Generation history</h2>
                <p className="muted detail-section-copy">
                  Each mocked generation run preserves variants and hidden config
                  output for later review.
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
        </aside>
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
        {variantCount} saved variant{variantCount === 1 ? "" : "s"}
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
