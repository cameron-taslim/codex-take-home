import React from "react";
import { Card } from "@/components/ui/card";
import type { VariantRecord } from "@/lib/domain/types";
import { getBrandAssetSet } from "@/lib/brand-assets";
import { previewConfigSchema } from "@/lib/validation/experiments";

export function VariantHtmlPreview({ variant }: { variant: VariantRecord }) {
  const preview = previewConfigSchema.safeParse(variant.previewConfig);
  const previewConfig = preview.success
    ? preview.data
    : {
        layout: "spotlight" as const,
        emphasis: "headline" as const,
        theme: "atelier-spring" as const,
        assetSetKey: "atelier-spring",
      };
  const assetSet = getBrandAssetSet(previewConfig.assetSetKey);

  return (
    <Card
      className="variant-preview-card variant-html-preview-card"
      style={{
        background: assetSet.panel,
        color: assetSet.text,
      }}
    >
      <div
        className="variant-html-preview-frame"
        data-testid="saved-html-preview-frame"
      >
        <div className="variant-html-preview-surface">
          <div
            className="variant-html-preview-content"
            data-testid="saved-html-preview"
            dangerouslySetInnerHTML={{ __html: variant.htmlContent }}
          />
        </div>
      </div>
    </Card>
  );
}
