import React from "react";

export function MetricCard({ icon: Icon, label, value, subtext, trendIcon: TrendIcon, colorClass }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
      <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={80} className={colorClass} />
      </div>
      <div className="relative z-10">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">{label}</p>
        <h2 className="text-display-lg text-on-surface font-bold">{value}</h2>
      </div>
      <div className={`mt-4 flex items-center relative z-10 ${colorClass}`}>
        <TrendIcon size={16} className="mr-1" />
        <span className="text-label-sm font-medium">{subtext}</span>
      </div>
    </div>
  );
}
