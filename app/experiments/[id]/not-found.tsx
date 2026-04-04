import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";

export default function ExperimentNotFound() {
  return (
    <AppShell
      title="Experiment not found"
      description="This experiment is unavailable for your account or no longer exists."
    >
      <EmptyState
        title="Choose another experiment"
        description="Return to the dashboard to open one of your saved experiments or start a new brief."
        action={
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              padding: "0 18px",
              borderRadius: 999,
              fontWeight: 700,
              background: "var(--accent)",
              color: "#fff",
            }}
          >
            Return to Dashboard
          </Link>
        }
      />
    </AppShell>
  );
}
