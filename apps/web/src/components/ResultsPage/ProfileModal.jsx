import React from "react";
import {
  X,
  Globe,
  FileText,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Star
} from "lucide-react";

export default function ProfileModal({ candidate, campaignId, onClose, onShortlist }) {
  const p = candidate?.candidateProfile || {};
  const name = candidate?.name || "Candidate";
  const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 800, maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-white border-b border-outline-variant/50 px-8 py-6 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center text-xl font-bold border border-[#C7D2FE] overflow-hidden">
              {p.profilePicUrl
                ? <img src={p.profilePicUrl} alt={name} className="w-full h-full object-cover" />
                : initials}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-on-surface">{name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-on-surface-variant text-sm font-medium">{candidate.role}</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${candidate.rank === 1 ? "bg-[#FEF08A] text-[#854D0E]" : "bg-surface-container-high text-on-surface"}`}>
                  #{candidate.rank} Ranked
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-8 bg-[#F8FAFC]">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Column */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              
              {/* Overall Score Card */}
              <div className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm text-center">
                <div className="text-sm font-bold text-on-surface-variant mb-2">Total Score</div>
                <div className="text-5xl font-black text-[#2563EB] mb-1">{candidate.score} <span className="text-xl font-bold opacity-70">pts</span></div>
              </div>

              {/* Contact / Links */}
              {p.resumeUrl && (
                <div className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-4 flex items-center gap-2"><Globe size={14}/> Connect</h4>
                  <div className="flex flex-col gap-3">
                    <a
                      href={p.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm font-semibold text-[#2563EB] hover:opacity-80 transition-opacity"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-outline-variant/30"><FileText size={16} /></div>
                      View Resume
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">
              
              {/* Detailed Scores */}
              <div className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-4">Assessment Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "MCQ Score", value: candidate.mcqScore, color: "bg-[#ECFDF5] text-[#059669]", duration: candidate.mcqDurationSeconds },
                    { label: "Coding Score", value: candidate.codingScore, color: "bg-[#FEF3C7] text-[#D97706]", duration: candidate.codingDurationSeconds },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 flex items-center justify-between ${s.color}`}>
                      <div>
                        <div className="text-2xl font-extrabold">{s.value} <span className="text-sm font-semibold opacity-70">pts</span></div>
                        <div className="text-xs font-semibold mt-1 opacity-80">{s.label}</div>
                      </div>
                      <div className="text-right">
                        <Clock size={16} className="inline mr-1 opacity-70"/>
                        <span className="text-xs font-bold">{Math.floor((s.duration||0)/60)}m {(s.duration||0)%60}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio & Skills */}
              {(p.bio || p.skills?.length > 0) && (
                <div className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm space-y-6">
                  {p.bio && (
                    <div>
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">About</h4>
                      <p className="text-sm text-on-surface leading-relaxed">{p.bio}</p>
                    </div>
                  )}
                  {p.skills?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">Skills & Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {p.skills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] rounded-lg text-xs font-bold shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Integrity */}
              <div className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Integrity Status</h4>
                    <p className="text-xs text-on-surface-variant">Proctoring alerts and session tracking</p>
                  </div>
                  {candidate.integrityFlags > 0 ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#FEF2F2] text-[#DC2626] rounded-xl text-sm font-bold border border-[#FCA5A5]">
                        <AlertTriangle size={16} /> {candidate.integrityFlags} Flags Detected
                      </span>
                      {candidate.integrityFlags >= 5 && (
                        <span className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-1 rounded">Auto-Submitted due to Violations</span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#ECFDF5] text-[#059669] rounded-xl text-sm font-bold border border-[#6EE7B7]">
                      <ShieldCheck size={16} /> Passed
                    </span>
                  )}
                </div>
                
                {candidate.integrityFlags > 0 && candidate.proctorEvents && candidate.proctorEvents.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h5 className="text-xs font-semibold text-on-surface-variant mb-3 uppercase tracking-wide">Violation Details</h5>
                    {candidate.proctorEvents.map((event, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-2 px-4 bg-[#FEF2F2]/50 border border-[#FCA5A5]/30 rounded-lg text-[#991B1B]">
                        <span className="font-semibold capitalize">{event.type.replace(/_/g, ' ')}</span>
                        <span className="text-xs opacity-80">{new Date(event.occurredAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/50 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-5 py-2 border border-outline-variant/80 rounded-lg text-sm font-semibold hover:bg-surface-light transition-colors">
            Close
          </button>
          {onShortlist && (
            <button
              onClick={() => { onShortlist(candidate); onClose(); }}
              className="flex items-center gap-2 px-5 py-2 bg-[#111827] text-white rounded-lg text-sm font-bold hover:bg-[#1F2937] transition-all shadow-md active:scale-95"
            >
              <Star size={14} className="text-[#FBBF24]" fill="currentColor" /> Shortlist Candidate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
