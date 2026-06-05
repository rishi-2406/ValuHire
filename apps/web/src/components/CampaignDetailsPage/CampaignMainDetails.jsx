import React from "react";
import { Sparkles } from "lucide-react";

export function CampaignMainDetails({ campaign, hasAssessment, isSubmitted, assessmentResult, setIsBreakdownOpen }) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-on-surface mb-3">Job Description & Details</h3>
          <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap font-medium">
            {campaign.description || "No description provided for this job campaign. Please refer to the assessment parameters on the right."}
          </div>
        </div>

        {hasAssessment && campaign.assessment.instructions && (
          <div className="pt-6 border-t border-outline-variant/40">
            <h3 className="text-lg font-bold text-on-surface mb-3">Assessment Instructions</h3>
            <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap font-medium bg-[#F8FAFC] border border-outline-variant/50 rounded-2xl p-5">
              {campaign.assessment.instructions}
            </div>
          </div>
        )}

        {isSubmitted && assessmentResult && (
          <div className="pt-6 border-t border-outline-variant/40">
            <h3 className="text-lg font-bold text-on-surface mb-4">Your Results</h3>
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Points Earned</div>
                    <div className="text-2xl font-black text-on-surface">
                      {assessmentResult.totalScore} <span className="text-sm font-semibold text-on-surface-variant">pts</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-outline-variant/30 flex justify-end">
                <button 
                  onClick={() => setIsBreakdownOpen(true)}
                  className="bg-primary text-on-primary hover:bg-primary/90 px-6 py-2 rounded-xl font-bold transition-colors shadow-sm"
                >
                  View Breakdown
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
