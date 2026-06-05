import React from "react";
import { Briefcase, Clock, Video } from "lucide-react";

export function StatsOverview({ applications, navigate }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-6 bg-white rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between group hover:border-[#2563EB]/40 transition-all cursor-pointer" onClick={() => navigate("/applications")}>
        <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Briefcase size={20} />
        </div>
        <div>
          <div className="text-3xl font-extrabold text-on-surface">{applications.length}</div>
          <div className="text-sm text-on-surface-variant font-semibold mt-1">Total Applied</div>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between group hover:border-[#D97706]/40 transition-all cursor-pointer" onClick={() => navigate("/applications")}>
        <div className="w-10 h-10 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Clock size={20} />
        </div>
        <div>
          <div className="text-3xl font-extrabold text-on-surface">{applications.filter(a => a.campaign?.assessment && !["SUBMITTED", "ASSESSMENT_COMPLETED", "REJECTED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED"].includes(a.status)).length}</div>
          <div className="text-sm text-on-surface-variant font-semibold mt-1">Pending Test</div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between group hover:border-[#059669]/40 transition-all cursor-pointer" onClick={() => navigate("/interviews")}>
        <div className="w-10 h-10 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Video size={20} />
        </div>
        <div>
          <div className="text-3xl font-extrabold text-on-surface">{applications.filter(a => ["INTERVIEW_SCHEDULED", "INTERVIEW"].includes(a.status)).length}</div>
          <div className="text-sm text-on-surface-variant font-semibold mt-1">Interviews</div>
        </div>
      </div>
    </div>
  );
}
