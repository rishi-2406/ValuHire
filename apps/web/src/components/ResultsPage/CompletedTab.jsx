import React, { useState } from "react";
import { CheckCircle2, FileText } from "lucide-react";

export default function CompletedTab({ completedApps, loading }) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  return (
    <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline-variant/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={20} className="text-[#059669]" />
          <h3 className="text-xl font-bold text-on-surface">Completed Interviews</h3>
          <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] rounded-full text-xs font-bold">{completedApps.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-on-surface-variant">Loading completed interviews…</div>
      ) : completedApps.length === 0 ? (
        <div className="py-16 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-outline-variant" />
          <h3 className="text-lg font-bold text-on-surface mb-2">No completed interviews yet</h3>
          <p className="text-sm text-on-surface-variant">Interviews marked as completed will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-surface-container-low">
          {completedApps.map(app => {
            const c = app.candidate || {};
            const name = c.name || "Candidate";
            const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2);
            // Find the completed interview slot
            const interviewSlot = c.interviewSlotsAsCandidate?.find(s => s.status === "COMPLETED");
            const feedback = interviewSlot?.feedback;

            return (
              <div key={app.id} className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center font-bold text-xl border border-[#C7D2FE] overflow-hidden">
                      {c.profilePicUrl ? <img src={c.profilePicUrl} alt={name} className="w-full h-full object-cover" /> : initials}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669]">
                      Completed
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-on-surface mb-1">{name}</h4>
                  <p className="text-sm text-on-surface-variant truncate mb-4">{c.email}</p>
                </div>
                
                <div className="pt-4 border-t border-outline-variant/50 flex flex-col gap-3">
                  {feedback && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-on-surface-variant">Recommendation:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        feedback.recommendation?.includes("No") ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#ECFDF5] text-[#059669]"
                      }`}>
                        {feedback.recommendation}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedFeedback(feedback || { notes: "No feedback submitted yet." })}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F8FAFC] text-on-surface border border-outline-variant/60 rounded-xl text-sm font-bold hover:bg-[#F1F5F9] transition-all shadow-sm"
                  >
                    <FileText size={16} /> View Remarks
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4">Interview Remarks</h3>
            
            <div className="mb-4">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Recommendation</span>
              {selectedFeedback.recommendation ? (
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                  selectedFeedback.recommendation.includes("No") ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#ECFDF5] text-[#059669]"
                }`}>
                  {selectedFeedback.recommendation}
                </span>
              ) : (
                <span className="text-sm text-on-surface-variant italic">N/A</span>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Notes & Feedback</span>
              <div className="bg-surface-container-low p-4 rounded-xl text-sm text-on-surface whitespace-pre-wrap max-h-60 overflow-y-auto border border-outline-variant/50">
                {selectedFeedback.notes || "No remarks provided."}
              </div>
            </div>

            <button
              onClick={() => setSelectedFeedback(null)}
              className="mt-6 w-full bg-[#111827] text-white py-2.5 rounded-xl font-bold hover:bg-[#1F2937]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
