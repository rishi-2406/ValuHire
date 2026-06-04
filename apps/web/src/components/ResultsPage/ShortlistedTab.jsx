import React from "react";
import { Star, Calendar, CheckCircle2 } from "lucide-react";

export default function ShortlistedTab({ shortlistedApps, shortlistLoading, setScheduleTarget, campaignId }) {
  return (
    <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline-variant/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star size={20} className="text-[#D97706]" />
          <h3 className="text-xl font-bold text-on-surface">Shortlisted Candidates</h3>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] rounded-full text-xs font-bold">{shortlistedApps.length}</span>
        </div>
      </div>

      {shortlistLoading ? (
        <div className="py-16 text-center text-on-surface-variant">Loading shortlisted candidates…</div>
      ) : shortlistedApps.length === 0 ? (
        <div className="py-16 text-center">
          <Star size={40} className="mx-auto mb-3 text-outline-variant" />
          <h3 className="text-lg font-bold text-on-surface mb-2">No shortlisted candidates yet</h3>
          <p className="text-sm text-on-surface-variant">Go to Candidate Rankings and select candidates to shortlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-surface-container-low">
          {shortlistedApps.map(app => {
            const c = app.candidate || {};
            const name = c.name || "Candidate";
            const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2);
            const isScheduled = app.status === "INTERVIEW_SCHEDULED";
            const statusColor = isScheduled ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FEF3C7] text-[#D97706]";
            const statusLabel = isScheduled ? "Interview Scheduled" : "Awaiting Interview";
            
            return (
              <div key={app.id} className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center font-bold text-xl border border-[#C7D2FE] overflow-hidden">
                      {c.profilePicUrl ? <img src={c.profilePicUrl} alt={name} className="w-full h-full object-cover" /> : initials}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-on-surface mb-1">{name}</h4>
                  <p className="text-sm text-on-surface-variant truncate mb-4">{c.email}</p>
                  
                  {c.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {c.skills.slice(0, 4).map(s => (
                        <span key={s} className="px-2 py-1 bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] rounded-md text-xs font-semibold">{s}</span>
                      ))}
                      {c.skills.length > 4 && <span className="text-xs text-on-surface-variant font-semibold self-center">+{c.skills.length - 4}</span>}
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-outline-variant/50">
                  {app.status === "SHORTLISTED" && (
                    <button
                      id={`schedule-interview-btn-${c.id}`}
                      onClick={() => setScheduleTarget({ candidateId: c.id, candidateName: name, campaignId, candidateProfilePicUrl: c.profilePicUrl })}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white rounded-xl text-sm font-bold hover:bg-[#1F2937] transition-all shadow-sm active:scale-95"
                    >
                      <Calendar size={16} /> Schedule Interview
                    </button>
                  )}
                  {isScheduled && (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F8FAFC] border border-outline-variant/60 text-[#059669] rounded-xl text-sm font-bold">
                      <CheckCircle2 size={16} /> Scheduled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
