import React from "react";
import { Shield, Clock, ArrowRight } from "lucide-react";
import { formatTimeAgo } from "../../pages/CampaignsPage";

export function CandidateCampaignCard({ c, navigate }) {
  return (
    <div 
      onClick={() => navigate(`/campaigns/${c.id}/details`)}
      className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm flex flex-col group hover:border-[#2563EB]/50 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-on-surface-variant font-bold text-lg shadow-sm shrink-0">
          {(c.company?.name || c.title || "C")[0]}
        </div>
        <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full text-xs font-bold border border-[#BFDBFE] max-w-[150px] truncate">
          {c.targetRole || "Engineering"}
        </span>
      </div>
      
      <h4 className="text-xl font-bold text-on-surface mb-2 group-hover:text-[#2563EB] transition-colors line-clamp-2" title={c.title}>{c.title}</h4>
      <p className="text-sm text-on-surface-variant font-medium mb-4">{c.company?.name || "Hiring Company"}</p>
      
      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2 flex-1" title={c.description}>
        {c.description || "Join our team and take part in solving exciting challenges. Apply now to start your assessment process and showcase your skills."}
      </p>

      {/* Skills Section */}
      {c.requiredSkills && c.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {c.requiredSkills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-md text-[10px] font-semibold border border-outline-variant/30 truncate max-w-[100px]" title={skill}>
              {skill}
            </span>
          ))}
          {c.requiredSkills.length > 3 && (
            <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-md text-[10px] font-semibold border border-outline-variant/30">
              +{c.requiredSkills.length - 3}
            </span>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
        <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2">
          <Shield size={14} className="text-primary/70" shrink-0 />
          <span className="truncate" title={c.durationDays ? `${c.durationDays} Days` : "Remote"}>{c.durationDays ? `${c.durationDays} Days` : "Remote"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2">
          <Clock size={14} className="text-primary/70" shrink-0 />
          <span>{c.assessment?.durationMinutes || 60} mins</span>
        </div>
      </div>
      
      <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-4">
        Published {formatTimeAgo(c.createdAt)}
      </div>
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/campaigns/${c.id}/details`);
        }} 
        className="w-full flex items-center justify-center gap-2 bg-[#F8FAFC] text-on-surface-variant group-hover:bg-[#2563EB] group-hover:text-white px-4 py-3 rounded-xl font-bold text-sm border border-[#E2E8F0] group-hover:border-[#2563EB] transition-all"
      >
        View Details <ArrowRight size={16} />
      </button>
    </div>
  );
}
