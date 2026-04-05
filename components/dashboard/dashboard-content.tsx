import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { listExperimentsForUser } from "@/lib/repositories/experiment-repository";

export type DashboardExperimentSummary = Awaited<
  ReturnType<typeof listExperimentsForUser>
>[number];

const createExperimentLinkStyles: React.CSSProperties = {
  background:
    "linear-gradient(180deg, var(--accent-primary-strong), var(--accent-primary))",
  color: "#08101f",
  border: "1px solid transparent",
  borderRadius: 12,
  boxShadow: "0 12px 24px rgba(124, 140, 255, 0.28)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 18px",
  fontWeight: 700,
};

function formatUpdatedAt(updatedAt: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(updatedAt);
}

function getStatusSummary(experiments: DashboardExperimentSummary[]) {
  return experiments.reduce(
    (summary, experiment) => {
      if (experiment.status === "generated") {
        summary.generated += 1;
      } else if (experiment.status === "generating") {
        summary.generating += 1;
      } else if (experiment.status === "generation_failed") {
        summary.failed += 1;
      } else {
        summary.draft += 1;
      }

      return summary;
    },
    { generated: 0, generating: 0, failed: 0, draft: 0 },
  );
}

export function CreateExperimentLink({
  children = "Create New Experiment",
}: {
  children?: React.ReactNode;
}) {
  return (
    <Link href="/experiments/new" style={createExperimentLinkStyles}>
      {children}
    </Link>
  );
}

export function DashboardContent({
  experiments,
  hasError = false,
}: {
  experiments: DashboardExperimentSummary[];
  hasError?: boolean;
}) {
  const statusSummary = getStatusSummary(experiments);

  if (hasError) {
    return (
      <ErrorBanner message="We couldn't load your experiments right now. Reload the page to try again." />
    );
  }

  if (experiments.length === 0) {
    return (
      <EmptyState
        title="Create your first experiment"
        description="Start with a structured brief, generate storefront variants, and return here to review saved experiments."
        action={<CreateExperimentLink />}
      />
    );
  }

  return (
    <div className="dashboard-layout">
      <Card style={{ padding: 0 }}>
        <div className="dashboard-summary">
          <div className="dashboard-summary-intro">
            <p className="eyebrow">Overview</p>
            <h2 className="dashboard-summary-title">Recent experiment activity</h2>
            <p className="dashboard-summary-description">
              Scan saved briefs, generation progress, and the latest runnable ideas
              before opening a detail view.
            </p>
          </div>

          <div className="dashboard-metrics" aria-label="Experiment status summary">
            <div className="dashboard-metric">
              <span className="dashboard-metric-label">Total experiments</span>
              <strong>{experiments.length}</strong>
            </div>
            <div className="dashboard-metric">
              <span className="dashboard-metric-label">Generated</span>
              <strong>{statusSummary.generated}</strong>
            </div>
            <div className="dashboard-metric">
              <span className="dashboard-metric-label">Generating</span>
              <strong>{statusSummary.generating}</strong>
            </div>
            <div className="dashboard-metric">
              <span className="dashboard-metric-label">Drafts</span>
              <strong>{statusSummary.draft}</strong>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <div className="dashboard-list-header">
          <div>
            <p className="dashboard-list-kicker">Experiment queue</p>
            <h2 className="dashboard-list-title">Recent experiments</h2>
          </div>
          <p className="dashboard-list-caption">Ordered by most recently updated.</p>
        </div>

        <div className="dashboard-table" role="list" aria-label="Saved experiments">
          {experiments.map((experiment) => (
            <Link
              key={experiment.id}
              href={`/experiments/${experiment.id}`}
              className="dashboard-row"
              role="listitem"
            >
              <div className="dashboard-row-primary">
                <div className="dashboard-row-title-block">
                  <h2 className="dashboard-row-title">{experiment.name}</h2>
                  <p className="dashboard-row-id">ID {experiment.id}</p>
                </div>
                <StatusBadge status={experiment.status} />
              </div>

              <div className="dashboard-row-meta">
                <div className="dashboard-row-meta-block">
                  <span className="dashboard-row-meta-label">Surface</span>
                  <span className="dashboard-row-meta-value">{experiment.pageType}</span>
                </div>
                <div className="dashboard-row-meta-block">
                  <span className="dashboard-row-meta-label">Updated</span>
                  <span className="dashboard-row-meta-value">
                    {formatUpdatedAt(experiment.updatedAt)}
                  </span>
                </div>
                <div className="dashboard-row-meta-block">
                  <span className="dashboard-row-meta-label">State</span>
                  <span className="dashboard-row-meta-value">
                    {experiment.latestGenerationRun?.status ?? "No run yet"}
                  </span>
                </div>
              </div>

              <span className="dashboard-row-arrow" aria-hidden="true">
                Open
              </span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
