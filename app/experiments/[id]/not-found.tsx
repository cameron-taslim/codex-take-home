import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateExperimentLink } from "@/components/dashboard/dashboard-content";

export default function ExperimentNotFound() {
  return (
    <AppShell
      title="Experiment not found"
      description="This experiment is unavailable for your account or no longer exists."
    >
      <EmptyState
        title="Choose another experiment"
        description="Return to the dashboard to open one of your saved experiments or start a new brief."
        action={<CreateExperimentLink>Create New Experiment</CreateExperimentLink>}
      />
    </AppShell>
  );
}
