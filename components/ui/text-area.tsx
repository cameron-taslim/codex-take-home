import React from "react";
import type { CSSProperties, TextareaHTMLAttributes } from "react";

export function TextArea({
  style,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  style?: CSSProperties;
}) {
  return (
    <textarea
      {...props}
      className="field-base"
      style={{
        minHeight: 120,
        padding: "12px 14px",
        resize: "vertical",
        ...style,
      }}
    />
  );
}
