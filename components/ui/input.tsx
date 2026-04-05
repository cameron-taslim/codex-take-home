import React, { type InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="field-base"
      style={{
        minHeight: 46,
        padding: "0 14px",
      }}
    />
  );
}
