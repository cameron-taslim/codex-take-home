import React from "react";
import { Card } from "@/components/ui/card";
import type { VariantRecord } from "@/lib/domain/types";
import { previewConfigSchema } from "@/lib/validation/experiments";

export function VariantPreviewCard({ variant }: { variant: VariantRecord }) {
  const preview = previewConfigSchema.safeParse(variant.previewConfig);
  const previewConfig = preview.success
    ? preview.data
    : { align: "left" as const, emphasis: "headline" as const, theme: "linen" };
  const themeStyles = getThemeStyles(previewConfig.theme);

  return (
    <Card
      style={{
        padding: 20,
        background: themeStyles.background,
        color: themeStyles.text,
      }}
    >
      <div
        className="stack"
        style={{
          gap: 12,
          textAlign: previewConfig.align === "center" ? "center" : "left",
        }}
      >
        <div className="cluster" style={{ justifyContent: "space-between" }}>
          <strong>{variant.label}</strong>
          <span className="muted">Variant {variant.position + 1}</span>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <h2
            style={{
              margin: 0,
              fontSize: previewConfig.emphasis === "headline" ? "1.85rem" : "1.6rem",
            }}
          >
            {variant.headline}
          </h2>
          {variant.subheadline ? (
            <p style={{ margin: 0, fontWeight: 500 }}>{variant.subheadline}</p>
          ) : null}
        </div>
        <p
          className="muted"
          style={{
            margin: 0,
            fontSize: previewConfig.emphasis === "body" ? "1.05rem" : undefined,
            color: themeStyles.muted,
          }}
        >
          {variant.bodyCopy}
        </p>
        <div
          className="cluster"
          style={{
            justifyContent:
              previewConfig.align === "split" ? "space-between" : "flex-start",
            gap: 12,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: previewConfig.emphasis === "cta" ? "1.05rem" : undefined,
            }}
          >
            {variant.ctaText}
          </span>
          <span className="muted" style={{ color: themeStyles.muted }}>
            {variant.layoutNotes}
          </span>
        </div>
      </div>
    </Card>
  );
}

function getThemeStyles(theme: string) {
  if (theme === "charcoal") {
    return {
      background: "#1f2937",
      text: "#f9fafb",
      muted: "rgba(249, 250, 251, 0.72)",
    };
  }

  if (theme === "linen") {
    return {
      background: "#fbf5ea",
      text: "#32261b",
      muted: "rgba(50, 38, 27, 0.7)",
    };
  }

  return {
    background: "var(--surface)",
    text: "var(--text)",
    muted: "var(--text-muted)",
  };
}
