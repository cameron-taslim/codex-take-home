import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ExperimentBuilderForm } from "@/components/experiment-builder/builder-form";
import { requireUserSession } from "@/lib/auth/session";

export default async function NewExperimentPage() {
  await requireUserSession();

  return (
    <AppShell
      title="Create experiment"
      description=""
      customHeader={<></>}
      activeSidebarItem="new"
    >
      <ExperimentBuilderForm />
    </AppShell>
  );
}
