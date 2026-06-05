import React from "react";
import { Cloud, Clock } from "lucide-react";

export function AssessmentRoomHeader({
  activePhase,
  formatTime,
  displayTime,
  setShowExitConfirm,
  sessionData,
  handleSubmit
}) {
  return (
    <header className="flex-shrink-0 bg-white border-b border-outline-variant flex justify-between items-center px-6 h-16 z-50">
      <div className="flex items-center gap-4">
        <h1 className="text-title-lg font-bold text-primary">Technical Assessment</h1>
        <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-label-sm rounded-full border border-outline-variant/50">
          {activePhase === 'mcq' ? 'Phase 1: MCQ' : 'Phase 2: Coding'}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-on-surface-variant text-sm">
          <Cloud size={16} />
          <span>Saved just now</span>
        </div>
        
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-mono font-bold tracking-wider">
          <Clock size={18} />
          {formatTime(displayTime)}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
          >
            Exit
          </button>
          {activePhase === 'coding' || (!sessionData?.assessment?.codingQuestions?.length) ? (
            <button onClick={() => {
              if (window.confirm("Are you sure you want to final submit?")) handleSubmit();
            }} className="px-6 py-2 bg-[#059669] text-white rounded-lg text-sm font-semibold hover:bg-[#047857] shadow-sm transition-colors">
              Submit Assessment
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
