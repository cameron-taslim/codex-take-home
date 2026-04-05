import React from "react";

export function Card({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section className={className ? `panel ${className}` : "panel"} style={style}>
      {children}
    </section>
  );
}
