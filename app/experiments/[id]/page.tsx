import React from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RerunControls } from "@/components/experiment-detail/rerun-controls";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { VariantPreviewCard } from "@/components/ui/variant-preview-card";
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
  const showingPriorSavedVariants =
    latestRun?.status === "failed" &&
    latestSavedRun &&
    latestSavedRun.id !== latestRun.id;

  return (
    <AppShell
      title={experiment.name}
      description="Review the saved brief, compare the latest persisted variants, and rerun generation from the same structured input."
      headerAction={<RerunControls experimentId={experiment.id} />}
    >
      <div className="detail-layout">
        <div className="stack detail-main-column">
          <Card className="detail-summary-panel">
            <div className="detail-summary-topbar">
              <div className="stack detail-summary-heading">
                <p className="builder-kicker">Experiment summary</p>
                <h2 className="detail-section-title">{experiment.name}</h2>
                <p className="muted detail-summary-copy">
                  Stored brief inputs, latest run status, and the current variant set
                  available for review.
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

            {showingPriorSavedVariants ? (
              <p className="muted detail-recovery-note">
                Showing variants from the most recent successful run while the latest
                attempt remains recoverable in history.
              </p>
            ) : null}

            <dl className="detail-summary-grid">
              <MetadataItem label="Goal" value={experiment.goal} />
              <MetadataItem label="Page type" value={experiment.pageType} />
              <MetadataItem label="Target audience" value={experiment.targetAudience} />
              <MetadataItem label="Tone" value={experiment.tone} />
              <MetadataItem
                label="Brand constraints"
                value={experiment.brandConstraints || "None provided"}
              />
              <MetadataItem
                label="Seed context"
                value={experiment.seedContext || "None provided"}
              />
            </dl>
          </Card>

          <section className="stack detail-section">
            <div className="detail-section-header">
              <div className="stack" style={{ gap: 6 }}>
                <p className="builder-section-kicker">Preview surfaces</p>
                <h2 className="detail-section-title">Latest saved variants</h2>
                <p className="muted detail-section-copy">
                  Compare the persisted variant set that is currently available for
                  review.
                </p>
              </div>
              {latestVariants.length > 0 ? (
                <span className="detail-count-chip">
                  {latestVariants.length} saved variant
                  {latestVariants.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>

            {latestVariants.length > 0 ? (
              <div className="detail-variant-grid">
                {latestVariants.map((variant) => (
                  <VariantPreviewCard key={variant.id} variant={variant} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No saved variants yet"
                description="Generate variants from this saved brief to populate the comparison view."
                action={<RerunControls experimentId={experiment.id} />}
              />
            )}
          </section>
        </div>

        <aside className="stack detail-side-column">
          <Card className="detail-history-panel">
            <div className="stack detail-history-stack">
              <div className="stack" style={{ gap: 6 }}>
                <p className="builder-section-kicker">Run ledger</p>
                <h2 className="detail-section-title">Generation history</h2>
                <p className="muted detail-section-copy">
                  Every rerun is preserved as a separate persisted record.
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
                  description="Start the first run from the saved brief to populate generation history."
                />
              )}
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

function MetadataItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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
      {errorMessage ? (
        <p className="detail-history-error">{errorMessage}</p>
      ) : null}
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
