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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.45fr) minmax(300px, 0.95fr)",
          gap: 20,
        }}
      >
        <div className="stack" style={{ gap: 20 }}>
          <Card style={{ padding: 24 }}>
            <div className="stack" style={{ gap: 16 }}>
              <div
                className="cluster"
                style={{ justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <div className="stack" style={{ gap: 6 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--accent-strong)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Experiment summary
                  </p>
                  <h2 style={{ margin: 0, fontSize: "1.35rem" }}>{experiment.name}</h2>
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
                <p className="muted" style={{ margin: 0 }}>
                  Showing variants from the most recent successful run while the latest
                  attempt remains recoverable in history.
                </p>
              ) : null}

              <dl
                style={{
                  margin: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 16,
                }}
              >
                <MetadataItem label="Goal" value={experiment.goal} />
                <MetadataItem label="Page type" value={experiment.pageType} />
                <MetadataItem
                  label="Target audience"
                  value={experiment.targetAudience}
                />
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
            </div>
          </Card>

          <section className="stack" style={{ gap: 12 }}>
            <div className="stack" style={{ gap: 4 }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Latest saved variants</h2>
              <p className="muted" style={{ margin: 0 }}>
                Compare the persisted variant set that is currently available for review.
              </p>
            </div>

            {latestVariants.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 16,
                }}
              >
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

        <div className="stack" style={{ gap: 20 }}>
          <Card style={{ padding: 24 }}>
            <div className="stack" style={{ gap: 16 }}>
              <div className="stack" style={{ gap: 4 }}>
                <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Generation history</h2>
                <p className="muted" style={{ margin: 0 }}>
                  Every rerun is preserved as a separate persisted record.
                </p>
              </div>

              {experiment.generationHistory.length > 0 ? (
                <div className="stack" style={{ gap: 12 }}>
                  {experiment.generationHistory.map((run) => (
                    <HistoryItem
                      key={run.id}
                      id={run.id}
                      status={run.status}
                      startedAt={run.startedAt}
                      completedAt={run.completedAt}
                      errorMessage={run.errorMessage}
                      variantCount={run.variantCount}
                    />
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  No generation runs yet. Start the first run from the saved brief.
                </p>
              )}
            </div>
          </Card>
        </div>
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
    <div className="stack" style={{ gap: 6 }}>
      <dt className="muted" style={{ margin: 0, fontSize: 14 }}>
        {label}
      </dt>
      <dd style={{ margin: 0, fontWeight: 600 }}>{value}</dd>
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
}: {
  id: string;
  status: "pending" | "running" | "succeeded" | "failed";
  startedAt: Date;
  completedAt: Date | null;
  errorMessage: string | null;
  variantCount: number;
}) {
  return (
    <Card style={{ padding: 18 }}>
      <div className="stack" style={{ gap: 8 }}>
        <div className="cluster" style={{ justifyContent: "space-between" }}>
          <strong>{formatRunStatus(status)}</strong>
          <span className="muted">{formatDate(startedAt)}</span>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          {variantCount} saved variant{variantCount === 1 ? "" : "s"}
          {completedAt ? ` • Completed ${formatDate(completedAt)}` : ""}
        </p>
        {errorMessage ? (
          <p style={{ margin: 0, color: "var(--danger)" }}>{errorMessage}</p>
        ) : null}
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          Run {id}
        </p>
      </div>
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
