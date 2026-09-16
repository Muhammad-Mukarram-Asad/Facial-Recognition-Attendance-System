export interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  radius?: number | string;
}

export function Skeleton({ height = 16, width = '100%', radius = 8 }: SkeletonProps) {
  return (
    <span
      aria-hidden
      style={{
        display: 'block',
        height,
        width,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, var(--surface-sunken) 0%, var(--border-subtle) 40%, var(--surface-sunken) 80%)',
        backgroundSize: '420px 100%',
        animation: 'ftShimmer 1.4s linear infinite',
      }}
    />
  );
}

export function SkeletonRows({ rows = 5, height = 44 }: { rows?: number; height?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 4 }}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={height} radius={12} />
      ))}
    </div>
  );
}
