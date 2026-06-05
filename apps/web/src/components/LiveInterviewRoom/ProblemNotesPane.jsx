import React from "react";
import { FileText } from "lucide-react";

export default function ProblemNotesPane({
  activeLeftTab,
  setActiveLeftTab,
  isRecruiter,
  campaign,
  handleQuestionChange,
  questionText,
  interviewerNotes,
  setInterviewerNotes
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="flex border-b border-outline-variant/50 bg-[#F8FAFC]">
        <button 
          onClick={() => setActiveLeftTab("problem")}
          className={`flex-1 py-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${activeLeftTab === "problem" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:bg-surface-container-low"}`}
        >
          PROBLEM STATEMENT
        </button>
        {isRecruiter && (
          <button 
            onClick={() => setActiveLeftTab("notes")}
            className={`flex-1 py-3 text-sm font-bold tracking-wider flex items-center justify-center gap-2 transition-colors border-b-2 ${activeLeftTab === "notes" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            <FileText size={16} /> REMARKS
          </button>
        )}
      </div>
      
      {activeLeftTab === "problem" && isRecruiter && campaign?.interviewQuestions?.length > 0 && (
        <div className="px-5 py-2 border-b border-outline-variant/50 bg-[#F1F5F9]">
          <select 
            className="w-full bg-white border border-outline-variant rounded p-1.5 text-xs font-semibold text-on-surface-variant outline-none"
            onChange={(e) => {
              if (!e.target.value) return;
              const q = campaign.interviewQuestions.find(cq => (cq.id || cq.title) === e.target.value);
              if (q) handleQuestionChange({ target: { value: q.statement } });
              e.target.value = "";
            }}
          >
            <option value="">Load question from campaign...</option>
            {campaign.interviewQuestions.map((q, idx) => (
              <option key={q.id || idx} value={q.id || q.title}>{q.title}</option>
            ))}
          </select>
        </div>
      )}
      
      <div className="flex-1 p-5 overflow-y-auto">
        {activeLeftTab === "problem" ? (
          isRecruiter ? (
            <textarea
              value={questionText}
              onChange={handleQuestionChange}
              className="w-full h-full resize-none border-none outline-none font-mono text-sm text-on-surface-variant bg-transparent whitespace-pre-wrap"
              placeholder="Paste or type problem statement here..."
            />
          ) : (
            <div className="w-full h-full font-mono text-sm text-on-surface-variant whitespace-pre-wrap overflow-y-auto">
              {questionText || "Waiting for interviewer to provide the problem..."}
            </div>
          )
        ) : (
          <textarea
            value={interviewerNotes}
            onChange={(e) => setInterviewerNotes(e.target.value)}
            placeholder="Jot down observations about the candidate's problem solving, communication, etc. This will be carried over to the final evaluation..."
            className="w-full h-full resize-none border-none outline-none text-sm text-on-surface-variant bg-transparent leading-relaxed"
          />
        )}
      </div>
    </div>
  );
}
