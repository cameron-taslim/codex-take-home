import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <AppShell
      title="Dashboard"
      description="Review saved experiments, track their status, and open the next variant workflow."
    >
      <div className="stack">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} style={{ padding: 20 }}>
            <div className="stack" style={{ gap: 12 }}>
              <Skeleton height={24} />
              <Skeleton height={16} />
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
