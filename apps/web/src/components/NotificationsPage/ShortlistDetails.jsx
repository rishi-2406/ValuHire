import React from "react";
import { Briefcase, User, CheckCircle2 } from "lucide-react";

export function ShortlistDetails({ meta }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Campaign Details</h3>
      <div className="bg-white rounded-xl border border-outline-variant/40 divide-y divide-outline-variant/20 overflow-hidden shadow-sm">
        {meta.campaignTitle && (
          <div className="flex items-center gap-4 px-5 py-4">
            <Briefcase size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Campaign</p>
              <p className="text-sm font-semibold text-on-surface mt-0.5">{meta.campaignTitle}</p>
            </div>
          </div>
        )}
        {meta.position && (
          <div className="flex items-center gap-4 px-5 py-4">
            <User size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Role</p>
              <p className="text-sm font-semibold text-on-surface mt-0.5">{meta.position}</p>
            </div>
          </div>
        )}
        {meta.nextStep && (
          <div className="flex items-start gap-4 px-5 py-4">
            <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">What's Next</p>
              <p className="text-sm text-on-surface-variant mt-0.5">{meta.nextStep}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
