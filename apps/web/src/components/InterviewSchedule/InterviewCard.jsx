import React from "react";
import { User, Video, Eye, FileText, Clock, Building, CheckCircle2 } from "lucide-react";

export function InterviewCard({ interview, isCandidate, navigate, handleJoinRoom }) {
  const id = interview.id || interview.interviewId;
  
  // Dynamic display names based on role
  let displayName = "Interview";
  let subName = "";
  let profilePicUrl = null;
  if (isCandidate) {
    displayName = interview.recruiter?.name || interview.interviewerName || interview.campaign?.company?.name || "ValuHire Recruiter";
    subName = interview.campaign?.title || "Technical Interview";
    profilePicUrl = interview.recruiter?.profilePicUrl;
  } else {
    displayName = interview.candidate?.name || interview.candidateName || interview.name || "Candidate";
    subName = interview.campaign?.targetRole || interview.role || interview.position || "Candidate";
    profilePicUrl = interview.candidate?.profilePicUrl;
  }
  
  const initials = displayName.substring(0, 2).toUpperCase();
  
  const d = new Date(interview.scheduledAt || interview.startsAt || interview.time);
  const timeString = d.toLocaleString([], { hour: 'numeric', minute: '2-digit' });
  const duration = interview.durationMinutes || 45;
  const endsAt = new Date(d.getTime() + duration * 60000);
  const endTimeString = endsAt.toLocaleString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        {profilePicUrl ? (
          <img 
            src={profilePicUrl} 
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover border border-outline-variant" 
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#E7EEFF] text-[#2563EB] flex items-center justify-center font-bold text-lg">
            {initials}
          </div>
        )}
        <div className="flex flex-col">
          <h5 className="text-xl font-semibold text-[#111C2D]">
            {displayName}
          </h5>
          <span className="text-xs font-semibold text-primary uppercase line-clamp-1">
            {subName}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Clock size={16} className="text-primary" />
          <span className="text-sm font-bold text-[#111C2D]">
            {timeString} - {endTimeString}
          </span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          {isCandidate ? <Building size={16} className="text-primary" /> : <User size={16} className="text-primary" />}
          <span className="text-sm font-medium">
            {isCandidate ? `With: ${displayName}` : `Interviewer: ${interview.interviewerName || "Staff"}`}
          </span>
        </div>
        {interview.feedback ? (
          <div className="flex flex-col gap-2 mt-3">
            {!isCandidate && (
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide rounded-md ${
                  interview.feedback.recommendation.includes("No") 
                    ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]" 
                    : "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                }`}>
                  {interview.feedback.recommendation}
                </span>
              </div>
            )}
          </div>
        ) : interview.notes ? (
          <div className="flex items-start gap-2 text-on-surface-variant mt-2 p-3 bg-[#F8FAFC] rounded-lg border border-outline-variant/50">
            <FileText size={16} className="text-primary mt-0.5 shrink-0" />
            <div className="text-sm font-medium italic line-clamp-3 leading-snug">
              "{interview.notes}"
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        {interview.status === "COMPLETED" ? (
          <div className="w-full py-2 bg-surface-variant text-on-surface-variant rounded-lg text-sm font-bold flex items-center justify-center gap-2 border border-outline-variant/60">
            <CheckCircle2 size={18} className="text-[#059669]" />
            Interview Completed
          </div>
        ) : (
          <button
            onClick={() => handleJoinRoom(id)}
            className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#003EA8] transition-colors shadow-sm"
          >
            <Video size={18} />
            Join Call
          </button>
        )}
        <button 
          onClick={() => {
            if (interview.campaignId) {
              navigate(isCandidate ? `/campaigns/${interview.campaignId}/details` : `/campaigns/${interview.campaignId}`);
            }
          }}
          className="w-full py-2 bg-[#F0F3FF] text-[#111C2D] rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#DEE8FF] transition-colors border border-outline-variant"
        >
          <Eye size={18} />
          Details
        </button>
      </div>
    </div>
  );
}
