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
      <div className="dashboard-layout">
        <Card style={{ padding: 0 }}>
          <div className="dashboard-summary">
            <div className="dashboard-summary-intro">
              <Skeleton height={14} width="28%" />
              <Skeleton height={38} width="62%" />
              <Skeleton height={16} width="84%" />
            </div>
            <div className="dashboard-metrics">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="dashboard-metric">
                  <Skeleton height={12} width="70%" />
                  <Skeleton height={28} width="48%" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div className="dashboard-list-header">
            <div className="stack" style={{ gap: 8 }}>
              <Skeleton height={12} width="26%" />
              <Skeleton height={28} width="40%" />
            </div>
            <Skeleton height={14} width="24%" />
          </div>

          <div className="dashboard-table">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="dashboard-row dashboard-row-loading">
                <div className="dashboard-row-primary">
                  <div className="dashboard-row-title-block">
                    <Skeleton height={24} width="52%" />
                    <Skeleton height={12} width="28%" />
                  </div>
                  <Skeleton height={28} width="18%" />
                </div>
                <div className="dashboard-row-meta">
                  <Skeleton height={12} width="22%" />
                  <Skeleton height={12} width="18%" />
                  <Skeleton height={12} width="20%" />
                </div>
                <Skeleton height={16} width="10%" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
