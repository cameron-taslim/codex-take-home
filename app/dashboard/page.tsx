import React from "react";
import {
  DashboardContent,
  CreateExperimentLink,
  type DashboardExperimentSummary,
} from "@/components/dashboard/dashboard-content";
import { AppShell } from "@/components/layout/app-shell";
import { requireUserSession } from "@/lib/auth/session";
import { listExperimentsForUser } from "@/lib/repositories/experiment-repository";

export default async function DashboardPage() {
  const session = await requireUserSession();
  let experiments: DashboardExperimentSummary[] = [];
  let hasError = false;

  try {
    experiments = await listExperimentsForUser(session.user.id);
  } catch {
    hasError = true;
  }

  return (
    <AppShell
      title="Dashboard"
      description="Scan recent experiments, check generation status, and jump back into the latest saved outputs."
      headerAction={<CreateExperimentLink />}
    >
      <DashboardContent experiments={experiments} hasError={hasError} />
    </AppShell>
  );
}
