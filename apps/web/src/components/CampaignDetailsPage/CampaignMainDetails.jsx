import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Briefcase, FileText, Award, Users, Clock, Code, Calendar, Video, AlertTriangle, ShieldCheck } from "lucide-react";

export function CampaignMainDetails({ campaign, application, hasAssessment, isSubmitted, assessmentResult, setIsBreakdownOpen, totalDur, totalMcqs, totalCodings, handleJoinRoom }) {
  const isInterviewStage = application && ["SHORTLISTED", "INTERVIEW", "INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "OFFER", "HIRED"].includes(application.status);
  const interviewSlot = application?.candidate?.interviewSlots?.find(slot => slot.campaignId === campaign.id);

  const showAssessment = hasAssessment;

  const [expanded, setExpanded] = useState({
    jobDescription: true,
    assessment: application && showAssessment && !isInterviewStage,
    interviewDetails: isInterviewStage
  });

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="space-y-4">
        {/* Job Description Accordion */}
        <div className="bg-white border border-outline-variant/60 rounded-3xl overflow-hidden shadow-sm transition-all duration-200">
          <button 
            onClick={() => toggleSection("jobDescription")}
            className="w-full flex items-center justify-between p-6 bg-white hover:bg-surface-light transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Briefcase size={20} />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Job Description & Details</h3>
            </div>
            <div className="text-on-surface-variant">
              {expanded.jobDescription ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>
          
          {expanded.jobDescription && (
            <div className="p-6 pt-0 border-t border-outline-variant/30">
              <div className="pt-4 flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Target Role</h4>
                  <p className="text-sm font-semibold text-on-surface">{campaign.targetRole || "Not specified"}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Required Skills</h4>
                  {campaign.requiredSkills && campaign.requiredSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {campaign.requiredSkills.map((skill, idx) => (
                        <span key={idx} className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-lg text-xs font-semibold border border-outline-variant/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant font-medium">No specific skills listed.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Description</h4>
                  <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap font-medium">
                    {campaign.description || "No description provided for this job campaign."}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Assessment Accordion */}
        {showAssessment && (
          <div className="bg-white border border-outline-variant/60 rounded-3xl overflow-hidden shadow-sm transition-all duration-200">
            <button 
              onClick={() => toggleSection("assessment")}
              className="w-full flex items-center justify-between p-6 bg-white hover:bg-surface-light transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSubmitted ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
                  {isSubmitted ? <Award size={20} /> : <FileText size={20} />}
                </div>
                <h3 className="text-lg font-bold text-on-surface">
                  {isSubmitted ? "Assessment Results" : "Assessment Details"}
                </h3>
              </div>
              <div className="text-on-surface-variant">
                {expanded.assessment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            
            {expanded.assessment && (
              <div className="p-6 pt-0 border-t border-outline-variant/30">
                {isSubmitted && assessmentResult ? (
                  <>
                    {(() => {
                      const flags = assessmentResult.session?.proctorEvents?.length ?? assessmentResult.proctorEventCount ?? assessmentResult.integrityFlags ?? 0;
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {/* Points Card */}
                          <div className="relative overflow-hidden bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-3xl p-6 text-white shadow-md shadow-[#2563EB]/20">
                            <div className="absolute -top-4 -right-4 p-4 opacity-10 rotate-12">
                              <Sparkles size={100} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                              <div className="text-blue-200 font-bold uppercase tracking-widest text-[10px]">Total Points Earned</div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-5xl font-black tracking-tighter">{assessmentResult.totalScore}</span>
                                <span className="text-lg font-bold text-blue-300">pts</span>
                              </div>
                            </div>
                          </div>

                          {/* Rank Card */}
                          {assessmentResult.rank ? (
                            <div className="relative overflow-hidden bg-gradient-to-br from-[#059669] to-[#064E3B] rounded-3xl p-6 text-white shadow-md shadow-[#059669]/20">
                              <div className="absolute -top-4 -right-4 p-4 opacity-10 rotate-12">
                                <Award size={100} />
                              </div>
                              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                <div className="text-emerald-200 font-bold uppercase tracking-widest text-[10px]">Your Rank</div>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-5xl font-black tracking-tighter">#{assessmentResult.rank}</span>
                                  <span className="text-lg font-bold text-emerald-300">/ {assessmentResult.totalApplicants}</span>
                                </div>
                              </div>
                            </div>
                          ) : <div />}

                          {/* Integrity Card */}
                          <div className={`relative overflow-hidden bg-gradient-to-br ${flags > 0 ? 'from-[#DC2626] to-[#991B1B]' : 'from-[#059669] to-[#064E3B]'} rounded-3xl p-6 text-white shadow-md`}>
                            <div className="absolute -top-4 -right-4 p-4 opacity-10 rotate-12">
                              {flags > 0 ? <AlertTriangle size={100} /> : <ShieldCheck size={100} />}
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                              <div className="text-white/70 font-bold uppercase tracking-widest text-[10px]">Integrity Status</div>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-3xl font-black tracking-tighter leading-tight">
                                  {flags > 0 ? `${flags} Flags` : 'Passed'}
                                </span>
                                {flags >= 5 && (
                                  <span className="text-xs font-bold text-red-200 bg-red-900/50 px-2 py-1 rounded w-fit uppercase tracking-wider">Auto-Submitted</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    
                    <div className="mt-6 flex justify-end">
                      <button 
                        onClick={() => setIsBreakdownOpen(true)}
                        className="bg-surface-container-low border border-outline-variant/50 hover:bg-surface-container-high text-on-surface px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm"
                      >
                        View Detailed Breakdown
                      </button>
                    </div>
                  </>
                ) : campaign.assessment?.instructions ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
                      <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                          <Clock size={20} />
                        </div>
                        <div>
                          <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Duration</div>
                          <div className="text-sm font-extrabold text-on-surface">{totalDur} min</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                        <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">MCQs</div>
                          <div className="text-sm font-extrabold text-on-surface">{totalMcqs} Questions</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                        <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                          <Code size={20} />
                        </div>
                        <div>
                          <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Coding</div>
                          <div className="text-sm font-extrabold text-on-surface">{totalCodings} Tasks</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap font-medium bg-[#F8FAFC] border border-outline-variant/50 rounded-2xl p-5">
                      {campaign.assessment.instructions}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Interview Details Accordion */}
        {isInterviewStage && (
          <div className="bg-white border border-outline-variant/60 rounded-3xl overflow-hidden shadow-sm transition-all duration-200">
            <button 
              onClick={() => toggleSection("interviewDetails")}
              className="w-full flex items-center justify-between p-6 bg-white hover:bg-surface-light transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                  <Users size={20} />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Interview Details</h3>
              </div>
              <div className="text-on-surface-variant">
                {expanded.interviewDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            
            {expanded.interviewDetails && (
              <div className="p-6 pt-0 border-t border-outline-variant/30">
                {interviewSlot ? (
                  <div className="bg-[#F8FAFC] border border-outline-variant/50 rounded-2xl p-5 mt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-on-surface mb-1">
                          {interviewSlot.status === "COMPLETED" ? "Interview Completed" : "Interview Scheduled"}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium mt-3">
                          <Calendar size={16} />
                          <span>{new Date(interviewSlot.startsAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium mt-1.5">
                          <Clock size={16} />
                          <span>{new Date(interviewSlot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(interviewSlot.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        interviewSlot.status === "COMPLETED" ? "bg-[#ECFDF5] text-[#059669]" :
                        interviewSlot.status === "LIVE" ? "bg-[#FEF2F2] text-[#DC2626] animate-pulse" :
                        "bg-[#EFF6FF] text-[#2563EB]"
                      }`}>
                        {interviewSlot.status}
                      </span>
                    </div>

                    {(interviewSlot.status === "SCHEDULED" || interviewSlot.status === "LIVE") && (
                      <div className="mt-6 pt-4 border-t border-outline-variant/50">
                        <p className="text-sm text-on-surface-variant font-medium mb-3">Join your interview using the link below at the scheduled time.</p>
                        <button 
                          onClick={() => handleJoinRoom(interviewSlot.id || interviewSlot.interviewId || interviewSlot.roomCode)}
                          className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm"
                        >
                          <Video size={16} /> Join Interview Room
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-on-surface-variant leading-relaxed font-medium mt-4">
                    <p className="mb-2">Your interview process is active. We are currently reviewing availability.</p>
                    <p>Check your email for formal invitations, meeting links, and schedules once they are finalized.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
