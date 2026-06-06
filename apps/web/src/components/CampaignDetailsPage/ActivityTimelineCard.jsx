import React from "react";
import { CheckCircle2, Play } from "lucide-react";

export function ActivityTimelineCard({
  hasAssessment,
  isSubmitted,
  assessmentResult,
  application,
  starting,
  applying,
  handleApplyAndStart,
  handleApplyOnly
}) {
  const steps = [
    { id: "applied", label: "Apply" },
    { id: "assessment", label: "Take Assessment" },
    { id: "shortlist", label: "Shortlist" },
    { id: "interview", label: "Interview Invite" },
    { id: "interview_completed", label: "Interview Complete" }
  ];

  let activeIndex = -1;
  if (application) {
    activeIndex = 0;
    let currentStatus = application.status;
    
    if (application.candidate?.interviewSlots) {
      const slot = application.candidate.interviewSlots.find(s => s.campaignId === application.campaignId);
      if (slot && slot.status === "COMPLETED" && currentStatus !== "OFFER" && currentStatus !== "HIRED") {
        currentStatus = "INTERVIEW_COMPLETED";
      }
    }

    if (currentStatus === "ASSESSMENT_INVITED") activeIndex = 1;
    if (currentStatus === "ASSESSMENT_COMPLETED" || currentStatus === "SUBMITTED" || isSubmitted) activeIndex = 1;
    if (currentStatus === "SHORTLISTED") activeIndex = 2;
    if (currentStatus === "INTERVIEW_SCHEDULED" || currentStatus === "INTERVIEW") activeIndex = 3;
    if (currentStatus === "INTERVIEW_COMPLETED") activeIndex = 4;
    if (currentStatus === "OFFER" || currentStatus === "HIRED") activeIndex = 5;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-sm flex flex-col">
        <h3 className="text-lg font-bold text-on-surface mb-6">Activity Timeline</h3>

        <div className="relative pl-4 mb-8">
          <div className="absolute top-2 bottom-2 left-[27px] w-[2px] bg-outline-variant/50" />
          
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div key={step.id} className="relative flex items-center gap-4 mb-6 last:mb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  isCompleted ? "bg-[#2563EB] text-white" :
                  isActive ? "bg-white border-[3px] border-[#2563EB]" :
                  "bg-white border-2 border-outline-variant"
                }`}>
                  {isCompleted && <CheckCircle2 size={16} className="text-white" />}
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />}
                </div>
                <div className={`${
                  isActive || isCompleted ? "text-on-surface font-bold" : "text-on-surface-variant font-medium"
                }`}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status & Actions */}
        {activeIndex <= 0 && (
          <div className="pt-6 border-t border-outline-variant/40 mt-auto space-y-4">
            {application && activeIndex === 0 && (
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 text-center">
                <p className="text-xs text-[#1E40AF] font-bold leading-relaxed">
                  You have applied to this campaign. You can start the assessment whenever you are ready.
                </p>
              </div>
            )}

            {hasAssessment && activeIndex <= 0 && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApplyAndStart}
                  disabled={starting || applying}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-[#2563EB]/25"
                >
                  <Play size={16} fill="currentColor" />
                  <span>{starting ? "Starting..." : application ? "Start Assessment" : "Apply & Start Assessment"}</span>
                </button>
                
                {!application && (
                  <button
                    onClick={handleApplyOnly}
                    disabled={starting || applying}
                    className="w-full bg-white hover:bg-surface-light border border-outline-variant text-on-surface font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-0"
                  >
                    <span>{applying ? "Applying..." : "Apply Only"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
