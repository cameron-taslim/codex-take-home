import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewExperimentLoading() {
  return (
    <AppShell
      title="Experiment Builder"
      description="Capture the structured brief, save a recoverable draft, and trigger a server-side Codex generation run."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.9fr)",
          gap: 20,
        }}
      >
        <Card style={{ padding: 24 }}>
          <div className="stack" style={{ gap: 16 }}>
            <Skeleton height={28} />
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="stack" style={{ gap: 8 }}>
                <Skeleton height={14} />
                <Skeleton height={index % 3 === 1 ? 112 : 44} />
              </div>
            ))}
          </div>
        </Card>

        <div className="stack">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} style={{ padding: 24 }}>
              <div className="stack" style={{ gap: 12 }}>
                <Skeleton height={22} />
                <Skeleton height={16} />
                <Skeleton height={16} />
                <Skeleton height={index === 0 ? 108 : 160} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
