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
      className="cluster page-header page-header-card"
      style={{ justifyContent: "space-between", alignItems: "flex-end" }}
    >
      <div className="stack" style={{ gap: 8 }}>
        <p className="eyebrow">Workspace</p>
        <h1 className="page-header-title">{title}</h1>
        {description ? (
          <p className="page-header-description">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
