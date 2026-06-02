export default function Skeleton({ className = "", width, height, rounded = "rounded-lg", dark = false }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  const bgClass = dark ? "bg-[#334155]/50" : "bg-[#F1F5F9]";
  return <div className={`animate-pulse ${bgClass} ${rounded} ${className}`} style={style} aria-hidden="true" />;
}

// 1. Dashboard Metrics Skeleton
export function SkeletonMetricGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="status" aria-label="Loading metrics">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-outline-variant/50 rounded-xl p-6 flex justify-between">
          <div className="flex flex-col gap-4 w-1/2 mt-1">
            <Skeleton width="100%" height={12} />
            <Skeleton width="70%" height={24} />
          </div>
          <Skeleton width={40} height={40} rounded="rounded-full" />
        </div>
      ))}
      <span className="sr-only">Loading metrics…</span>
    </div>
  );
}

// 2. Campaign Table Skeleton
export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white border border-outline-variant/50 rounded-xl overflow-hidden" role="status" aria-label="Loading table">
      <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border-b border-outline-variant/50">
        <Skeleton width="10%" height={16} />
        <Skeleton width="15%" height={16} />
        <Skeleton width="15%" height={16} />
        <Skeleton width="10%" height={16} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border-b border-outline-variant/30 last:border-0">
          <Skeleton width="15%" height={16} />
          <Skeleton width="20%" height={16} />
          <Skeleton width="10%" height={16} />
          <Skeleton width="10%" height={16} />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// 3. Content Card Skeleton
export function SkeletonCard() {
  return (
    <div className="bg-white border border-outline-variant/50 rounded-xl p-6 flex flex-col gap-4 w-full" role="status" aria-label="Loading card">
      <Skeleton width="100%" height={180} rounded="rounded-lg" className="mb-2" />
      <Skeleton width="70%" height={16} />
      <Skeleton width="90%" height={16} />
      <div className="flex justify-between items-center mt-2">
        <Skeleton width="20%" height={24} />
        <Skeleton width="30%" height={24} />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// 4. Avatar & List Skeleton
export function SkeletonList({ rows = 3 }) {
  return (
    <div className="bg-white border border-outline-variant/50 rounded-xl p-6 flex flex-col gap-6" role="status" aria-label="Loading list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton width={48} height={48} rounded="rounded-full" className="flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2.5 mt-1">
            <Skeleton width="40%" height={14} />
            <Skeleton width="60%" height={14} />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// 5. Complex View: Assessment Room Loading
export function SkeletonAssessmentRoom() {
  return (
    <div className="flex flex-col md:flex-row gap-6 h-[500px]" role="status" aria-label="Loading assessment room">
      <div className="w-full md:w-1/3 bg-white border border-outline-variant/50 rounded-xl h-full p-4" />
      <div className="w-full md:w-2/3 bg-[#1E293B] rounded-xl h-full p-6 flex flex-col gap-4 font-mono">
        <div className="flex gap-3 mb-4">
          <Skeleton width={80} height={20} dark />
          <Skeleton width={80} height={20} dark />
        </div>
        {[40, 30, 60, 50, 20, 25].map((w, i) => (
          <div key={i} className="flex items-center gap-4 text-[#475569] text-sm">
            <span>{i + 1}</span>
            <Skeleton width={`${w}%`} height={12} dark />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// 6. Full Page / Splash Loading
export function SkeletonSplash() {
  return (
    <div className="fixed inset-0 bg-[#F8FAFC] flex flex-col items-center justify-center z-50 animate-fade-in">
      <div className="flex flex-col items-center justify-center">
        {/* Simple CSS Spinner */}
        <div className="w-12 h-12 border-4 border-[#DBEAFE] border-t-[#2563EB] rounded-full animate-spin mb-6" />
        <h1 className="text-2xl font-bold text-[#1E293B] mb-2">ValuHire</h1>
        <p className="text-sm text-on-surface-variant">Loading platform...</p>
      </div>
    </div>
  );
}
