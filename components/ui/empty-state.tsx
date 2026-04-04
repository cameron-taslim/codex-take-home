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
    <Card style={{ padding: 28 }}>
      <div className="stack" style={{ gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{title}</h2>
        <p className="muted" style={{ margin: 0 }}>
          {description}
        </p>
        {action}
      </div>
    </Card>
  );
}
