import React from "react";

export function ProgressSteps({ currentStatus, isCompletedResult }) {
  const steps = [
    { id: "applied", label: "Apply" },
    { id: "assessment", label: "Take Assessment" },
    { id: "shortlist", label: "Shortlist" },
    { id: "interview", label: "Interview Invite" },
    { id: "interview_completed", label: "Interview Complete" }
  ];
  
  let activeIndex = 0;
  
  if (currentStatus === "ASSESSMENT_INVITED") activeIndex = 1;
  if (currentStatus === "ASSESSMENT_COMPLETED" || currentStatus === "SUBMITTED" || isCompletedResult) activeIndex = 1;
  if (currentStatus === "SHORTLISTED") activeIndex = 2;
  if (currentStatus === "INTERVIEW_SCHEDULED" || currentStatus === "INTERVIEW") activeIndex = 3;
  if (currentStatus === "INTERVIEW_COMPLETED") activeIndex = 4;
  if (currentStatus === "OFFER" || currentStatus === "HIRED") activeIndex = 5;

  return (
    <div className="relative mt-6 px-4">
      <div className="absolute top-2.5 left-8 right-8 h-[2px] bg-outline-variant">
        <div 
          className="absolute top-0 left-0 h-full bg-[#2563EB]" 
          style={{ width: `${(Math.min(activeIndex, steps.length - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <div className="relative flex justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center z-10 ${
                  isCompleted 
                    ? 'bg-[#2563EB] text-white border-2 border-[#2563EB]' 
                    : isActive 
                      ? 'bg-white border-[3px] border-[#2563EB]' 
                      : 'bg-white border-2 border-outline-variant'
                }`}
              >
                {isCompleted && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4.5L3.5 7L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
              </div>
              <span className={`text-xs font-semibold ${isActive || isCompleted ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
