import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <AppShell
      title="Opening experiment workspace"
      description="Loading your saved experiments and redirecting to the current workspace."
    >
      <div className="stack" style={{ gap: 14 }}>
        <Skeleton height={18} width="22%" />
        <Skeleton height={52} width="100%" />
        <Skeleton height={52} width="100%" />
        <Skeleton height={52} width="100%" />
      </div>
    </AppShell>
  );
}
