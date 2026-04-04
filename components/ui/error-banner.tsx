import React from "react";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        padding: "12px 14px",
        borderRadius: "var(--radius-sm)",
        background: "var(--danger-soft)",
        color: "var(--danger)",
        border: "1px solid rgba(180, 35, 24, 0.2)",
      }}
    >
      {message}
    </div>
  );
}
