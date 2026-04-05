import React from "react";
import { formatExperimentStatus } from "@/lib/domain/status";

const statusStyles: Record<string, React.CSSProperties> = {
  draft: {},
  generating: {},
  generated: {},
  generation_failed: {},
  live: {},
};

export function StatusBadge({ status }: { status: string }) {
  const statusClass =
    status === "draft"
      ? "status-draft"
      : status === "generating"
        ? "status-generating"
        : status === "generated"
          ? "status-generated"
          : status === "live"
            ? "status-live"
          : "status-failed";

  return (
    <span className={`status-badge ${statusClass}`} style={statusStyles[status]}>
      <span aria-hidden="true" className="status-dot" />
      {formatExperimentStatus(status)}
    </span>
  );
}
