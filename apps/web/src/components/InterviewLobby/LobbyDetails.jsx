import React from "react";

export function LobbyDetails({ activeInterview, initials, setShowDetailsModal }) {
  return (
    <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
      <h3 className="text-xl font-bold text-[#111C2D]">Interview Details</h3>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-outline uppercase">Position</p>
        <p className="text-base font-semibold text-[#111C2D]">
          {activeInterview.campaign?.title || activeInterview.role || activeInterview.position || "Candidate Role"}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-outline uppercase">Candidate</p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E7EEFF] text-primary flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <p className="text-base text-[#111C2D] font-medium">
            {activeInterview.candidate?.name || activeInterview.candidateName || activeInterview.name || "Candidate"}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-outline uppercase">Interviewer</p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F0F3FF] text-[#111C2D] flex items-center justify-center font-bold text-sm">
            {(activeInterview.recruiter?.name || activeInterview.interviewerName || "I").substring(0, 1).toUpperCase()}
          </div>
          <p className="text-base text-[#111C2D] font-medium">
            {activeInterview.recruiter?.name || activeInterview.interviewerName || "Interviewer"}
          </p>
        </div>
      </div>
      <button 
        onClick={() => setShowDetailsModal(true)}
        className="mt-2 w-full py-2 px-4 border border-primary text-primary font-medium text-sm rounded-lg hover:bg-primary/5 transition-colors"
      >
        View Details
      </button>
    </div>
  );
}
