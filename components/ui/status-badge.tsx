import { formatExperimentStatus } from "@/lib/domain/status";

const statusStyles: Record<string, React.CSSProperties> = {
  draft: {
    background: "var(--surface-muted)",
    color: "var(--text)",
  },
  generating: {
    background: "var(--warning-soft)",
    color: "var(--warning)",
  },
  generated: {
    background: "var(--success-soft)",
    color: "var(--success)",
  },
  generation_failed: {
    background: "var(--danger-soft)",
    color: "var(--danger)",
  },
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 28,
        padding: "0 10px",
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 13,
        ...statusStyles[status],
      }}
    >
      {formatExperimentStatus(status)}
    </span>
  );
}
