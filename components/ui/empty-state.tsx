import React from "react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card style={{ padding: 0 }}>
      <div className="stack empty-state" style={{ gap: 8 }}>
        <h2 className="empty-state-title">{title}</h2>
        <p className="muted" style={{ margin: 0 }}>
          {description}
        </p>
        {action}
      </div>
    </Card>
  );
}
