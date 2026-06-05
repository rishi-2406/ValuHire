import { X, Calendar, Clock, User, Briefcase, FileText } from "lucide-react";

export default function InterviewDetailsModal({ open, onClose, activeInterview }) {
  if (!open) return null;

  const candidateName = activeInterview?.candidate?.name || activeInterview?.candidateName || activeInterview?.name || "Candidate";
  const interviewerName = activeInterview?.recruiter?.name || activeInterview?.interviewerName || "Interviewer";
  const role = activeInterview?.campaign?.title || activeInterview?.role || activeInterview?.position || "Position not specified";
  const startsAt = activeInterview?.scheduledAt || activeInterview?.startsAt;
  const duration = activeInterview?.durationMinutes || 45;

  const dateString = startsAt
    ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(startsAt))
    : "Not Scheduled";

  const timeString = startsAt
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(startsAt))
    : "--:--";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(17,28,45,0.60)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
          <h2 className="text-lg font-bold text-on-surface">Interview Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/30">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
              {candidateName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-on-surface leading-tight">{candidateName}</h3>
              <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                <Briefcase size={14} />
                {role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 p-3 rounded-lg border border-outline-variant/30 bg-[#F9F9FF]">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                Date
              </span>
              <span className="text-sm font-medium text-on-surface">{dateString}</span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg border border-outline-variant/30 bg-[#F9F9FF]">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                Time & Duration
              </span>
              <span className="text-sm font-medium text-on-surface">{timeString} ({duration} mins)</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-lg border border-outline-variant/30 bg-[#F9F9FF]">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide flex items-center gap-1.5">
              <User size={14} className="text-primary" />
              Interviewer
            </span>
            <span className="text-sm font-medium text-on-surface">{interviewerName}</span>
          </div>

          {activeInterview?.notes && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                Agenda / Notes
              </span>
              <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-sm text-on-surface whitespace-pre-wrap">
                {activeInterview.notes}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-outline-variant/30 bg-[#F9F9FF] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-surface-variant text-on-surface-variant font-medium text-sm rounded-lg hover:bg-surface-container-highest transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
