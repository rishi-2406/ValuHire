import React, { useState, useEffect } from "react";
import { X, Star, CheckCircle2, AlertTriangle, Send } from "lucide-react";

export default function InterviewFeedbackModal({ isOpen, onClose, onSubmit, candidateName, initialNotes = "" }) {
  const [recommendation, setRecommendation] = useState("Hire");
  const [notes, setNotes] = useState(initialNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes(initialNotes);
    }
  }, [isOpen, initialNotes]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ recommendation, notes });
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = [
    { value: "Strong Hire", color: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]", icon: Star },
    { value: "Hire", color: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]", icon: CheckCircle2 },
    { value: "No Hire", color: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]", icon: AlertTriangle },
    { value: "Strong No", color: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]", icon: X },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-[#F8FAFC]">
          <h2 className="text-xl font-bold text-on-surface">Interview Feedback</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-3">
              Recommendation for <span className="text-[#2563EB]">{candidateName || "Candidate"}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {options.map((opt) => {
                const isSelected = recommendation === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRecommendation(opt.value)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? `${opt.color} border-current shadow-sm scale-[1.02]` 
                        : "bg-white border-outline-variant/60 text-on-surface-variant hover:border-outline-variant hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <Icon size={24} className="mb-2" />
                    <span className="font-bold text-sm">{opt.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">
              Detailed Remarks
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide specific feedback on the candidate's performance, problem-solving skills, and communication..."
              className="w-full border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all resize-none bg-[#F8FAFC] focus:bg-white"
            />
          </div>

          <div className="pt-4 border-t border-outline-variant/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors"
            >
              Skip / Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !notes.trim()}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
