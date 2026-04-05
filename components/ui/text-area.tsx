import React from "react";
import type { TextareaHTMLAttributes } from "react";

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="field-base"
      style={{
        minHeight: 120,
        padding: "12px 14px",
        resize: "vertical",
      }}
    />
  );
}
