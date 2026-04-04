import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ExperimentBuilderForm } from "@/components/experiment-builder/builder-form";
import { requireUserSession } from "@/lib/auth/session";

export default async function NewExperimentPage() {
  await requireUserSession();

  return (
    <AppShell
      title="Experiment Builder"
      description="Capture the structured brief, save a recoverable draft, and trigger a server-side Codex generation run."
    >
      <ExperimentBuilderForm />
    </AppShell>
  );
}
