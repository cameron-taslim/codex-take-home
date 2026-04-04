export function Skeleton({ height = 16 }: { height?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height,
        width: "100%",
        borderRadius: 999,
        background:
          "linear-gradient(90deg, rgba(22,20,18,0.06), rgba(22,20,18,0.12), rgba(22,20,18,0.06))",
      }}
    />
  );
}
