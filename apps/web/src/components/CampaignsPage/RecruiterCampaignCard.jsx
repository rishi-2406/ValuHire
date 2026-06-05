import React from "react";
import { Briefcase, Users, ArrowRight } from "lucide-react";
import { formatTimeAgo } from "../../pages/CampaignsPage";

export function RecruiterCampaignCard({ c, navigate }) {
  const isOpen = (c.status || "").toUpperCase() === "OPEN";

  return (
    <div 
      onClick={() => navigate(`/campaigns/${c.id}`)}
      className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:border-[#2563EB]/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-on-surface-variant font-bold text-xl shadow-sm">
          {(c.company?.name || c.title || "C")[0]}
        </div>
        <div>
          <div className="flex items-center gap-3">
             <h4 className="text-xl font-bold text-on-surface group-hover:text-[#2563EB] transition-colors">{c.title}</h4>
             <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold ${isOpen ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#F3F4F6] text-[#4B5563]'}`}>
               {isOpen ? 'OPEN' : 'CLOSED'}
             </span>
          </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant mt-3">
              <span className="flex items-center gap-1.5"><Briefcase size={14} /> {c.targetRole || "General"}</span>
              <span className="flex items-center gap-1.5"><Users size={14} /> {c._count?.applications || 0} Applied</span>
              <span className="flex items-center gap-1.5 bg-surface-container-low px-2 py-0.5 rounded text-on-surface-variant">
                Published {formatTimeAgo(c.createdAt)}
              </span>
            </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
         <button onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${c.id}`); }} className="text-[#2563EB] font-bold flex items-center gap-2 bg-[#EFF6FF] px-4 py-2 rounded-lg border border-[#BFDBFE] hover:bg-[#DBEAFE]">
           View Details <ArrowRight size={16} />
         </button>
      </div>
    </div>
  );
}
