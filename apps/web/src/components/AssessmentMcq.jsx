import React from "react";
import { CheckCircle, Shield } from "lucide-react";

export default function AssessmentMcq({
  sessionData,
  activeMcqIndex,
  setActiveMcqIndex,
  mcqAnswers,
  handleMcqSelect,
}) {
  const currentQ = sessionData.assessment.mcqQuestions?.[activeMcqIndex];
  if (!currentQ) return null;

  return (
    <div className="w-full max-w-[800px] mx-auto p-12 overflow-y-auto">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-semibold">
                Multiple Choice
              </span>
            </div>
            <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold">
              {currentQ.points} pts
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-6 leading-snug">
            {currentQ.prompt}
          </h1>
          <div className="space-y-3">
            {currentQ.options.map((opt, oIdx) => {
              const qId = currentQ.id;
              const isSelected = mcqAnswers[qId] === oIdx;
              return (
                <label
                  key={oIdx}
                  className={`group flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary-container/5 border-2"
                      : "border-outline-variant hover:border-primary hover:bg-surface-container-low"
                  }`}
                >
                  <input
                    type="radio"
                    name={qId}
                    checked={isSelected}
                    onChange={() => handleMcqSelect(qId, oIdx)}
                    className="w-5 h-5 text-primary focus:ring-primary"
                  />
                  <span
                    className={`ml-4 text-base ${
                      isSelected ? "text-primary font-semibold" : "text-on-surface"
                    }`}
                  >
                    {opt}
                  </span>
                  {isSelected && <CheckCircle className="ml-auto text-primary" size={20} />}
                </label>
              );
            })}
          </div>
        </div>

        <div className="px-8 py-4 bg-surface-container-lowest border-t border-outline-variant flex justify-between items-center">
          <button
            disabled={activeMcqIndex === 0}
            onClick={() => setActiveMcqIndex((p) => p - 1)}
            className="flex items-center gap-2 text-on-surface-variant font-medium hover:text-primary transition-colors disabled:opacity-50 disabled:hover:text-on-surface-variant"
          >
            Previous
          </button>
          <div className="text-sm font-medium text-on-surface-variant">
            {activeMcqIndex + 1} of {sessionData.assessment.mcqQuestions.length}
          </div>
          <button
            disabled={activeMcqIndex === sessionData.assessment.mcqQuestions.length - 1}
            onClick={() => setActiveMcqIndex((p) => p + 1)}
            className="flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex items-start gap-4 p-6 bg-surface-container-low rounded-lg border border-primary/10 mb-20">
        <Shield size={20} className="text-primary mt-0.5" />
        <p className="text-sm text-on-surface-variant">
          <strong>Note:</strong> Your progress is automatically saved. Make sure to attempt all
          questions before proceeding.
        </p>
      </div>
    </div>
  );
}
