export function Skeleton({ height = 16 }: { height?: number }) {
  return (
    <div
      aria-hidden="true"
      className="skeleton"
      style={{
        height,
        width: "100%",
      }}
    />
  );
}
