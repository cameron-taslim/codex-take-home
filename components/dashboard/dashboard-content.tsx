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
    <div className="stack">
      {experiments.map((experiment) => (
        <Link
          key={experiment.id}
          href={`/experiments/${experiment.id}`}
          style={{ display: "block" }}
        >
          <Card style={{ padding: 20 }}>
            <div
              className="cluster"
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <div className="stack" style={{ gap: 10 }}>
                <div className="cluster" style={{ gap: 10 }}>
                  <h2 style={{ margin: 0, fontSize: "1.15rem" }}>{experiment.name}</h2>
                  <StatusBadge status={experiment.status} />
                </div>
                <div className="cluster" style={{ gap: 16 }}>
                  <span className="muted">{experiment.pageType}</span>
                  <span className="muted">
                    Updated {formatUpdatedAt(experiment.updatedAt)}
                  </span>
                </div>
              </div>
              <span
                aria-hidden="true"
                style={{ fontSize: 22, color: "var(--text-tertiary)" }}
              >
                →
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
