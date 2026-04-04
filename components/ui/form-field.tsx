import React from "react";

export function FormField({
  children,
  label,
  htmlFor,
  required = false,
  error,
}: {
  children: React.ReactNode;
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="stack" style={{ gap: 8 }}>
      <label htmlFor={htmlFor} style={{ fontWeight: 600 }}>
        {label} {required ? <span aria-hidden="true">*</span> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" style={{ margin: 0, color: "var(--danger)", fontSize: 14 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
