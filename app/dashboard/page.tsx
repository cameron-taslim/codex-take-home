import React from "react";
import {
  CreateExperimentLink,
  DashboardContent,
} from "@/components/dashboard/dashboard-content";
import { AppShell } from "@/components/layout/app-shell";
import { requireUserSession } from "@/lib/auth/session";
import { listExperimentsForUser } from "@/lib/repositories/experiment-repository";

export default async function DashboardPage() {
  const session = await requireUserSession();
  let experiments = [];
  let hasError = false;

  try {
    experiments = await listExperimentsForUser(session.user.id);
  } catch {
    hasError = true;
  }

  return (
    <AppShell
      title="Dashboard"
      description="Review saved experiments, track their status, and open the next variant workflow."
      headerAction={<CreateExperimentLink />}
    >
      <DashboardContent experiments={experiments} hasError={hasError} />
    </AppShell>
  );
}
