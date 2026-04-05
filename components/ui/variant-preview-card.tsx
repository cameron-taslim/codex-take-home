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
  const alignmentClass =
    previewConfig.align === "center"
      ? "is-center"
      : previewConfig.align === "split"
        ? "is-split"
        : "is-left";

  return (
    <Card
      className={`variant-preview-card ${alignmentClass}`}
      style={{
        background: themeStyles.background,
        color: themeStyles.text,
      }}
    >
      <div className="variant-preview-topbar">
        <div className="stack" style={{ gap: 6 }}>
          <p className="variant-preview-label">{variant.label}</p>
          <p className="variant-preview-index" style={{ color: themeStyles.muted }}>
            Variant {variant.position + 1}
          </p>
        </div>
        <span className="variant-preview-chip" style={themeStyles.chip}>
          {previewConfig.emphasis}
        </span>
      </div>

      <div className="stack variant-preview-stage" style={{ gap: 14 }}>
        <div className="stack" style={{ gap: 8 }}>
          <h3 className="variant-preview-headline">{variant.headline}</h3>
          {variant.subheadline ? (
            <p className="variant-preview-subheadline">{variant.subheadline}</p>
          ) : null}
        </div>

        <p className="variant-preview-body" style={{ color: themeStyles.muted }}>
          {variant.bodyCopy}
        </p>
      </div>

      <div className="variant-preview-footer">
        <div className="variant-preview-cta-row">
          <span className="variant-preview-cta" style={themeStyles.cta}>
            {variant.ctaText}
          </span>
          <span className="variant-preview-layout" style={{ color: themeStyles.muted }}>
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
      background:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 38%), #1b2434",
      text: "#f9fbff",
      muted: "rgba(238, 242, 255, 0.72)",
      chip: {
        background: "rgba(124, 140, 255, 0.12)",
        color: "#dce2ff",
        border: "1px solid rgba(124, 140, 255, 0.24)",
      },
      cta: {
        background: "rgba(255, 255, 255, 0.08)",
        color: "#f9fbff",
        border: "1px solid rgba(255, 255, 255, 0.12)",
      },
    };
  }

  if (theme === "linen") {
    return {
      background:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.5), transparent 38%), #fbf5ea",
      text: "#32261b",
      muted: "rgba(50, 38, 27, 0.72)",
      chip: {
        background: "rgba(50, 38, 27, 0.08)",
        color: "#574130",
        border: "1px solid rgba(50, 38, 27, 0.14)",
      },
      cta: {
        background: "#2e2450",
        color: "#f8f4ff",
        border: "1px solid rgba(46, 36, 80, 0.18)",
      },
    };
  }

  return {
    background:
      "linear-gradient(180deg, rgba(124, 140, 255, 0.1), transparent 38%), var(--bg-panel)",
    text: "var(--text-primary)",
    muted: "var(--text-secondary)",
    chip: {
      background: "rgba(124, 140, 255, 0.12)",
      color: "var(--accent-primary-strong)",
      border: "1px solid rgba(124, 140, 255, 0.2)",
    },
    cta: {
      background: "rgba(255, 255, 255, 0.05)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-subtle)",
    },
  };
}
