import React from "react";
import { Users, ShieldCheck, BarChart3, Edit3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function MetricsCards({ totalCandidates, qualifiedMatches, conversionRate, integrityPassRate, avgScore, campaignId }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-outline-variant/60 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {[
          { label: "Total Candidates", value: totalCandidates, icon: Users, color: "text-[#2563EB] bg-[#EFF6FF]" },
          { label: "Integrity Pass Rate", value: `${integrityPassRate}%`, icon: ShieldCheck, color: "text-[#059669] bg-[#ECFDF5]" },
          { label: "Avg. Assessment Score", value: `${avgScore} pts`, icon: BarChart3, color: "text-on-surface-variant bg-surface-container-high" },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-xs text-on-surface-variant font-medium">{m.label}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface">{m.value}</span>
                    {m.sub && <span className="text-[10px] font-semibold text-on-surface-variant px-1.5 py-0.5 bg-surface-container rounded-md">{m.sub}</span>}
                  </div>
                </div>
              </div>
              {m.label !== "Avg. Assessment Score" && <div className="hidden lg:block w-px h-8 bg-outline-variant/50 mx-2"></div>}
            </div>
          );
        })}
      </div>

      {campaignId && (
        <Link 
          to={`/campaigns/${campaignId}/builder`}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm"
        >
          <Edit3 size={16} />
          Edit Assessment Questions
        </Link>
      )}
    </div>
  );
}
