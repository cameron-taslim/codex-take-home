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
        description="Return to the experiment workspace to open one of your saved experiments or start a new brief."
        action={
          <Link
            href="/experiments/new"
            style={{
              background:
                "linear-gradient(180deg, var(--accent-primary-strong), var(--accent-primary))",
              color: "#08101f",
              border: "1px solid transparent",
              borderRadius: 12,
              boxShadow: "0 12px 24px rgba(124, 140, 255, 0.28)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              padding: "0 18px",
              fontWeight: 700,
            }}
          >
            Create Experiment
          </Link>
        }
      />
    </AppShell>
  );
}
