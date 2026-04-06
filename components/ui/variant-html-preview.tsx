import React from "react";
import type { VariantRecord } from "@/lib/domain/types";

export function VariantHtmlPreview({ variant }: { variant: VariantRecord }) {
  return (
    <section className="variant-html-preview-card">
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
    </section>
  );
}
