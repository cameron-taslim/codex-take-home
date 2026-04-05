"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteExperimentButton } from "@/components/layout/delete-experiment-button";

export function ExperimentDetailHeader({
  experimentId,
  title,
  failureMessage,
  metadata,
  approvedBrief,
}: {
  experimentId: string;
  title: string;
  failureMessage?: React.ReactNode;
  metadata: React.ReactNode;
  approvedBrief?: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="page-header page-header-card detail-header-card">
      <div className="detail-header-topbar">
        <div className="stack" style={{ gap: 8 }}>
          <h1 className="page-header-title">{title}</h1>
        </div>

        <div className="detail-header-actions">
          <DeleteExperimentButton
            experimentId={experimentId}
            experimentName={title}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Collapse overview" : "Expand overview"}
          </Button>
        </div>
      </div>

      {isExpanded ? (
        <div className="stack detail-summary-body">
          {failureMessage}
          {metadata}
          {approvedBrief}
        </div>
      ) : null}
    </section>
  );
}
