import React from "react";
import { Clock, FileText, Code, Sparkles, CheckCircle2, Play } from "lucide-react";

export function AssessmentSummaryCard({
  hasAssessment,
  totalDur,
  totalMcqs,
  mcqDur,
  totalCodings,
  codingDur,
  isSubmitted,
  assessmentResult,
  application,
  starting,
  applying,
  handleApplyAndStart,
  handleApplyOnly
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-sm flex flex-col">
        <h3 className="text-lg font-bold text-on-surface mb-4">Assessment Summary</h3>

        {hasAssessment ? (
          <div className="space-y-4 mb-6">
            {/* Total Duration */}
            <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Total Duration</div>
                <div className="text-base font-extrabold text-on-surface">{totalDur} minutes</div>
              </div>
            </div>

            {/* MCQ Details */}
            {totalMcqs > 0 && (
              <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">MCQ Section</div>
                  <div className="text-base font-extrabold text-on-surface">
                    {totalMcqs} Questions {mcqDur > 0 && `(${mcqDur}m)`}
                  </div>
                </div>
              </div>
            )}

            {/* Coding Details */}
            {totalCodings > 0 && (
              <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                  <Code size={18} />
                </div>
                <div>
                  <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Coding Challenges</div>
                  <div className="text-base font-extrabold text-on-surface">
                    {totalCodings} Tasks {codingDur > 0 && `(${codingDur}m)`}
                  </div>
                </div>
              </div>
            )}

            {/* Total Points */}
            <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Evaluation Method</div>
                <div className="text-base font-extrabold text-on-surface">Structured Sandbox</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-on-surface-variant font-semibold text-sm">
            No active assessment set up for this campaign.
          </div>
        )}

        {/* Status & Actions */}
        <div className="pt-6 border-t border-outline-variant/40 mt-auto space-y-4">
          {isSubmitted ? (
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 text-center space-y-4">
              <div className="flex justify-center text-[#059669]">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-[#047857] mb-1">Assessment Completed</div>
                <p className="text-xs text-[#065F46] font-medium leading-relaxed">
                  You have successfully submitted your assessment. Your results will be analyzed by the recruiting team shortly.
                </p>
              </div>
              {assessmentResult && (
                <div className="mt-4 pt-4 border-t border-[#A7F3D0]/50 flex justify-between items-center text-sm font-semibold">
                  <span className="text-[#065F46]">Your Rank</span>
                  <span className="text-[#047857] text-lg font-bold">#{assessmentResult.rank} <span className="text-xs font-normal">/ {assessmentResult.totalApplicants}</span></span>
                </div>
              )}
            </div>
          ) : (
            <>
              {application ? (
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 text-center">
                  <p className="text-xs text-[#1E40AF] font-bold leading-relaxed">
                    You have applied to this campaign. You can start the assessment whenever you are ready.
                  </p>
                </div>
              ) : null}

              {hasAssessment && (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
