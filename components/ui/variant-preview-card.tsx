import React from "react";
import { Card } from "@/components/ui/card";
import type { VariantRecord } from "@/lib/domain/types";
import { getBrandAssetSet } from "@/lib/brand-assets";
import { previewConfigSchema } from "@/lib/validation/experiments";

export function VariantPreviewCard({
  variant,
  editableCopy,
}: {
  variant: VariantRecord;
  editableCopy?: React.ReactNode;
}) {
  const preview = previewConfigSchema.safeParse(variant.previewConfig);
  const previewConfig = preview.success
    ? preview.data
    : {
        layout: "spotlight" as const,
        emphasis: "headline" as const,
        theme: "atelier-spring" as const,
        assetSetKey: "atelier-spring",
        lockedElements: [],
      };
  const assetSet = getBrandAssetSet(previewConfig.assetSetKey);

  return (
    <Card
      className={`variant-preview-card variant-layout-${previewConfig.layout}`}
      style={{
        background: assetSet.panel,
        color: assetSet.text,
      }}
    >
      <div className="variant-preview-topbar">
        <div className="stack" style={{ gap: 6 }}>
          <p className="variant-preview-label">{variant.label}</p>
          <p className="variant-preview-index">{previewConfig.emphasis}</p>
        </div>
        <div className="variant-locked-rail">
          {previewConfig.lockedElements.map((item) => (
            <span key={item} className="variant-preview-chip">
              {item.replace("Lock ", "")}
            </span>
          ))}
        </div>
      </div>

      <div className="variant-live-preview">
        <div
          className="variant-preview-hero"
          style={{ background: assetSet.heroImage }}
          aria-hidden="true"
        />
        <div className="variant-preview-surface">
          <div className="variant-logo-row">
            <span className="variant-logo-mark" style={{ background: assetSet.accent }} />
            <span className="variant-logo-wordmark">{assetSet.logoWordmark}</span>
          </div>
          <p className="variant-preview-kicker">{assetSet.eyebrow}</p>
          <h3 className="variant-preview-headline">{variant.headline}</h3>
          {variant.subheadline ? (
            <p className="variant-preview-subheadline">{variant.subheadline}</p>
          ) : null}
          <div className="variant-preview-footer">
            <span className="variant-preview-cta">{variant.ctaText}</span>
            <p className="variant-preview-body">{variant.bodyCopy}</p>
          </div>
        </div>
      </div>

      {editableCopy ? <div className="variant-editor-shell">{editableCopy}</div> : null}
    </Card>
  );
}
