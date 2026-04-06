import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewExperimentLoading() {
  return (
    <AppShell title="Create experiment" description="" customHeader={<></>}>
      <Card style={{ padding: 24 }}>
        <div className="stack" style={{ gap: 14 }}>
          <Skeleton height={20} width="180px" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            <Card style={{ padding: 14, gridColumn: "1 / -1" }}>
              <div className="stack" style={{ gap: 10 }}>
                <Skeleton height={12} width="52px" />
                <Skeleton height={44} />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <Skeleton height={44} />
                  <Skeleton height={44} />
                  <Skeleton height={44} />
                </div>
              </div>
            </Card>
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} style={{ padding: 14 }}>
                <div className="stack" style={{ gap: 10 }}>
                  <Skeleton height={12} width="52px" />
                  <Skeleton height={88} />
                  <Skeleton height={44} />
                  <Skeleton height={88} />
                </div>
              </Card>
            ))}
          </div>
          <Card style={{ padding: 14 }}>
            <Skeleton height={44} width="220px" />
          </Card>
        </div>
      </Card>
    </AppShell>
  );
}
