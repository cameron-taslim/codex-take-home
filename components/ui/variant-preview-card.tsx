import { Card } from "@/components/ui/card";
import type { VariantRecord } from "@/lib/domain/types";

export function VariantPreviewCard({ variant }: { variant: VariantRecord }) {
  return (
    <Card style={{ padding: 20 }}>
      <div className="stack" style={{ gap: 12 }}>
        <div className="cluster" style={{ justifyContent: "space-between" }}>
          <strong>{variant.label}</strong>
          <span className="muted">Variant {variant.position + 1}</span>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <h2 style={{ margin: 0 }}>{variant.headline}</h2>
          {variant.subheadline ? (
            <p style={{ margin: 0, fontWeight: 500 }}>{variant.subheadline}</p>
          ) : null}
        </div>
        <p className="muted" style={{ margin: 0 }}>
          {variant.bodyCopy}
        </p>
        <div className="cluster" style={{ justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700 }}>{variant.ctaText}</span>
          <span className="muted">{variant.layoutNotes}</span>
        </div>
      </div>
    </Card>
  );
}
