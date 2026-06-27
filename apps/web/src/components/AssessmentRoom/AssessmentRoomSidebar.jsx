import React from "react";
import { CheckCircle, Circle, Terminal } from "lucide-react";
import { LANGUAGE_TEMPLATES } from "../../hooks/useAssessmentRoom";

export function AssessmentRoomSidebar({
  isSidebarOpen,
  activePhase,
  sessionData,
  mcqAnswers,
  activeMcqIndex,
  setActiveMcqIndex,
  activeCodingIndex,
  setActiveCodingIndex,
  setCode,
  setOutput,
  setActivePhase,
  language,
  setShowMcqSubmitConfirm
}) {
  return (
    <aside className={`${isSidebarOpen ? 'w-[300px] border-r' : 'w-0 border-r-0 opacity-0 overflow-hidden'} transition-all duration-300 bg-surface-container-lowest border-outline-variant flex flex-col py-6 shrink-0 z-30`}>
      <div className="px-6 pb-4 mb-2 border-b border-outline-variant/30 whitespace-nowrap">
        <h3 className="font-title-lg text-title-lg text-on-surface mb-1">
          {activePhase === 'mcq' ? "MCQ Navigation" : "Coding Challenges"}
        </h3>
        <p className="font-label-md text-label-md text-on-surface-variant">
          {activePhase === 'mcq' ? sessionData?.assessment?.mcqQuestions?.length : sessionData?.assessment?.codingQuestions?.length} Questions Total
        </p>
      </div>
      
      <nav className="flex flex-col flex-1 px-3 space-y-1">
        {activePhase === 'mcq' && sessionData?.assessment?.mcqQuestions?.map((q, idx) => {
          const isAttempted = mcqAnswers[q.id] !== undefined;
          const isActive = activeMcqIndex === idx;
          return (
            <button 
              key={q.id}
              onClick={() => setActiveMcqIndex(idx)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between rounded-lg transition-all ${isActive ? 'bg-primary-container/10 border-l-4 border-primary' : 'hover:bg-surface-container border-l-4 border-transparent'}`}
            >
              <span className={`font-label-md text-label-md ${isActive ? 'font-bold text-primary' : 'text-on-surface-variant'}`}>
                Question {idx + 1}
              </span>
              {isAttempted ? (
                <CheckCircle className="text-[#059669]" size={18} />
              ) : (
                <Circle className="text-outline-variant" size={18} />
              )}
            </button>
          );
        })}

        {activePhase === 'coding' && sessionData?.assessment?.codingQuestions?.map((q, idx) => {
          const isActive = activeCodingIndex === idx;
          return (
            <button 
              key={q.id}
              onClick={() => {
                setActiveCodingIndex(idx);
                setCode(LANGUAGE_TEMPLATES[q.language || "python"] || "");
                setOutput("");
              }}
              className={`w-full text-left px-4 py-3 flex items-center justify-between rounded-lg transition-all ${isActive ? 'bg-primary-container/10 border-l-4 border-primary' : 'hover:bg-surface-container border-l-4 border-transparent'}`}
            >
              <span className={`font-label-md text-label-md ${isActive ? 'font-bold text-primary' : 'text-on-surface-variant'}`}>
                Problem {idx + 1}
              </span>
            </button>
          );
        })}
      </nav>
      
      {activePhase === 'mcq' && sessionData?.assessment?.codingQuestions?.length > 0 && (
        <div className="px-6 mt-4 pt-4 border-t border-outline-variant/30 whitespace-nowrap">
          <button 
            onClick={() => {
              setShowMcqSubmitConfirm(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            Submit MCQs
            <Terminal size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}
