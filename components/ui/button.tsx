import React, { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background:
      "linear-gradient(180deg, var(--accent-primary-strong), var(--accent-primary))",
    color: "#08101f",
    border: "1px solid transparent",
  },
  secondary: {
    background: "rgba(255, 255, 255, 0.03)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-subtle)",
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
  const className = `button-base ${
    variant === "secondary" ? "button-secondary" : "button-primary"
  }`;

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={className}
      style={{
        cursor: loading ? "progress" : "pointer",
        ...variantStyles[variant],
        ...style,
      }}
    >
      {loading ? "Working..." : children}
    </button>
  );
}
