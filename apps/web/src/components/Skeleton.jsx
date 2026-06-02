export default function Skeleton({ className = "", width, height, rounded = "rounded-lg" }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  return <div className={`skeleton ${rounded} ${className}`} style={style} aria-hidden="true" />;
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="flex-shrink-0" width={40} height={40} rounded="rounded-full" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton width="40%" height={14} />
        <Skeleton width="60%" height={12} />
      </div>
      <Skeleton width={80} height={24} rounded="rounded-full" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="flex flex-col gap-1" role="status" aria-label="Loading table">
      <div className="flex items-center gap-3 py-3 border-b border-outline">
        <Skeleton width="40%" height={12} />
        <Skeleton width="20%" height={12} />
        <Skeleton width="15%" height={12} />
        <Skeleton width="10%" height={12} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-outline rounded-xl p-6 flex flex-col gap-3" role="status" aria-label="Loading card">
      <Skeleton width="40%" height={14} />
      <Skeleton width="60%" height={28} />
      <Skeleton width="80%" height={12} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function SkeletonMetricGrid({ count = 4 }) {
  return (
    <div className="metric-grid" role="status" aria-label="Loading metrics">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="metric-card">
          <Skeleton width={40} height={40} rounded="rounded-lg" />
          <Skeleton width="60%" height={12} />
          <Skeleton width="40%" height={28} />
        </div>
      ))}
      <span className="sr-only">Loading metrics…</span>
    </div>
  );
}
