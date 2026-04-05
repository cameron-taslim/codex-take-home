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
    <div className="stack form-field">
      <label htmlFor={htmlFor} className="form-label">
        <span>
          {label}
          {required ? (
            <span className="form-required"> *</span>
          ) : null}
        </span>
      </label>
      {children}
      {error ? (
        <p role="alert" className="form-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
