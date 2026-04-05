import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExperimentDetailLoading() {
  return (
    <AppShell
      title="Loading experiment"
      description="Loading the saved brief, the latest persisted output, and the generation history."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.45fr) minmax(300px, 0.95fr)",
          gap: 20,
        }}
      >
        <div className="stack" style={{ gap: 20 }}>
          <Card style={{ padding: 24 }}>
            <div className="stack" style={{ gap: 16 }}>
              <Skeleton height={26} />
              <Skeleton height={18} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 16,
                }}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="stack" style={{ gap: 6 }}>
                    <Skeleton height={12} />
                    <Skeleton height={18} />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} style={{ padding: 20 }}>
                <div className="stack" style={{ gap: 12 }}>
                  <Skeleton height={18} />
                  <Skeleton height={28} />
                  <Skeleton height={16} />
                  <Skeleton height={88} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card style={{ padding: 24 }}>
          <div className="stack" style={{ gap: 12 }}>
            <Skeleton height={22} />
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} style={{ padding: 18 }}>
                <div className="stack" style={{ gap: 8 }}>
                  <Skeleton height={16} />
                  <Skeleton height={14} />
                  <Skeleton height={14} />
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
