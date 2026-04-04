import React, { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "white",
    border: "1px solid transparent",
  },
  secondary: {
    background: "var(--surface-strong)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  },
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 44,
        padding: "0 16px",
        borderRadius: 999,
        fontWeight: 600,
        cursor: loading ? "progress" : "pointer",
        transition: "transform 120ms ease, opacity 120ms ease",
        ...variantStyles[variant],
        ...style,
      }}
    >
      {loading ? "Working..." : children}
    </button>
  );
}
