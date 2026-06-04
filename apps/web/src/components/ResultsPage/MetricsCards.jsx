import React from "react";
import { Users, Target, ShieldCheck, BarChart3 } from "lucide-react";

export default function MetricsCards({ totalCandidates, qualifiedMatches, conversionRate, integrityPassRate, avgScore }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: "Total Candidates", value: totalCandidates, icon: Users, color: "bg-[#EFF6FF] text-[#2563EB]", textColor: "text-on-surface" },
        { label: "Qualified Matches", value: qualifiedMatches, icon: Target, color: "bg-[#EFF6FF] text-[#2563EB]", textColor: "text-[#2563EB]", sub: `${conversionRate}% Conversion` },
        { label: "Integrity Pass Rate", value: `${integrityPassRate}%`, icon: ShieldCheck, color: "bg-[#ECFDF5] text-[#059669]", textColor: "text-on-surface" },
        { label: "Avg. Assessment Score", value: `${avgScore}%`, icon: BarChart3, color: "bg-surface-container-high text-on-surface-variant", textColor: "text-on-surface" },
      ].map(m => {
        const Icon = m.icon;
        return (
          <div key={m.label} className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-on-surface-variant font-semibold">{m.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}><Icon size={16} /></div>
            </div>
            <div className={`text-4xl font-bold mb-1 ${m.textColor}`}>{m.value}</div>
            {m.sub && <div className="text-xs font-bold text-on-surface-variant">{m.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}
