export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="cluster"
      style={{ justifyContent: "space-between", alignItems: "flex-end" }}
    >
      <div className="stack" style={{ gap: 6 }}>
        <h1 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.05 }}>{title}</h1>
        {description ? (
          <p className="muted" style={{ margin: 0, maxWidth: 720 }}>
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
