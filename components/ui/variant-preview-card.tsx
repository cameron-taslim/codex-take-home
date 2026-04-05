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
  const headlineTone = getHeadlineTone(variant.headline);

  return (
    <Card
      className={`variant-preview-card variant-layout-${previewConfig.layout} variant-headline-${headlineTone}`}
      style={{
        background: assetSet.panel,
        color: assetSet.text,
      }}
    >
      <div className="variant-live-preview">
        <div
          className="variant-preview-surface"
          style={{
            background: `linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 30%), ${assetSet.heroImage}`,
          }}
        >
          <div className="variant-preview-hero-block">
            <div className="variant-preview-copy variant-preview-copy-hero">
              <h3 className="variant-preview-headline">{variant.headline}</h3>
              {variant.subheadline ? (
                <p className="variant-preview-subheadline">{variant.subheadline}</p>
              ) : null}
            </div>
          </div>

          <div className="variant-preview-content-card">
            <div className="variant-preview-footer">
              <span className="variant-preview-cta">{variant.ctaText}</span>
              <p className="variant-preview-body">{variant.bodyCopy}</p>
            </div>
          </div>
        </div>
      </div>

      {editableCopy ? <div className="variant-editor-shell">{editableCopy}</div> : null}
    </Card>
  );
}

function getHeadlineTone(headline: string) {
  const compactHeadline = headline.trim();

  if (compactHeadline.length > 68 || /\d{6,}/.test(compactHeadline)) {
    return "utility";
  }

  if (compactHeadline.length > 38) {
    return "long";
  }

  return "display";
}
