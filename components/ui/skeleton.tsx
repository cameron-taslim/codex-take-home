export function Skeleton({
  height = 16,
  width = "100%",
}: {
  height?: number;
  width?: number | string;
}) {
  return (
    <div
      aria-hidden="true"
      className="skeleton"
      style={{
        height,
        width,
      }}
    />
  );
}
