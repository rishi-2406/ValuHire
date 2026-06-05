import React from "react";
import { Briefcase, Award, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { ProgressSteps } from "./ProgressSteps";

export function ApplicationCard({ app, resultsMap, navigate }) {
  const hasAssessment = !!app.campaign?.assessment;
  const isCompleted = app.status === "ASSESSMENT_COMPLETED" || app.status === "SUBMITTED" || (app.campaign && !!resultsMap[app.campaign.id]);
  
  return (
    <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
      <div className="flex-1 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#111827]">{app.campaign?.title || "Role"}</h3>
            <div className="flex items-center gap-2 text-on-surface-variant text-sm font-semibold mt-1">
              <Briefcase size={16} className="text-[#2563EB]/70" />
              <span>{app.campaign?.company?.name || "Company Inc."}</span>
            </div>
          </div>
          <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
            isCompleted 
              ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' 
              : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
          }`}>
            {app.status === "INTERVIEW" ? "Interviewing" : isCompleted ? "Assessment Done" : "Assessment Pending"}
          </span>
        </div>

        <ProgressSteps currentStatus={app.status} isCompletedResult={isCompleted} />

        {isCompleted && resultsMap[app.campaign.id] && (
          <div className="mt-4 p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold shadow-sm border border-[#A7F3D0]">
                <Award size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Total Score</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-on-surface">{resultsMap[app.campaign.id].totalScore ?? 0}</span>
                  <span className="text-xs font-semibold text-on-surface-variant">pts</span>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">MCQ</p>
                <span className="text-sm font-bold text-on-surface">{resultsMap[app.campaign.id].mcqScore ?? 0}</span>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Coding</p>
                <span className="text-sm font-bold text-on-surface">{resultsMap[app.campaign.id].codingScore ?? 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-outline-variant/40 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
        {hasAssessment && (
          <div className="text-left md:text-right">
            <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Assessment</div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold ${isCompleted ? 'text-[#059669]' : 'text-[#D97706]'}`}>
              {isCompleted ? (
                <><CheckCircle2 size={14} /> Completed</>
              ) : (
                <><Clock size={14} /> Pending Action</>
              )}
            </span>
          </div>
        )}

        <button
          onClick={() => navigate(`/campaigns/${app.campaign.id}/details`)}
          className={`w-full md:w-auto font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm border ${
            isCompleted
              ? 'bg-white hover:bg-surface-light border-outline-variant text-on-surface'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-transparent shadow-sm'
          }`}
        >
          {isCompleted ? "View Details" : "Start Assessment"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
