import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

export default function ScheduleInterviewModal({
  open,
  onClose,
  onSchedule,
  candidateName,
  candidateProfilePicUrl,
  interviews = [],
}) {
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [time, setTime] = useState("10:00");          // free-type HH:MM (24h)
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState("");
  const [savedTemplateMsg, setSavedTemplateMsg] = useState("");

  // Load default template when modal opens
  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("defaultInterviewAgenda");
      if (saved) setNotes(saved);
      setOverlapWarning("");
      setSavedTemplateMsg("");
    }
  }, [open]);

  // Overlap detection
  useEffect(() => {
    if (!selectedDay || !time || !open) return;
    const [h, m] = time.split(":").map(Number);
    const startsAt = new Date(viewYear, viewMonth, selectedDay, h || 0, m || 0).getTime();
    const endsAt = startsAt + duration * 60_000;
    
    let hasOverlap = false;
    for (const inv of interviews) {
      if (!inv.scheduledAt && !inv.startsAt && !inv.time) continue;
      if (inv.status === "COMPLETED" || inv.status === "CANCELLED") continue;

      const invStart = new Date(inv.scheduledAt || inv.startsAt || inv.time).getTime();
      const invDur = inv.durationMinutes || 45;
      const invEnd = invStart + invDur * 60_000;
      
      if (startsAt < invEnd && endsAt > invStart) {
        hasOverlap = true;
        break;
      }
    }
    
    if (hasOverlap) {
      setOverlapWarning("⚠️ You have an active overlapping interview at this time. Please check your calendar for free slots.");
    } else {
      setOverlapWarning("");
    }
  }, [selectedDay, viewMonth, viewYear, time, duration, interviews, open]);

  if (!open) return null;

  const displayName   = candidateName || "the Candidate";
  const initials      = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  const daysInMonth   = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfMonth(viewYear, viewMonth);

  // ── Calendar navigation ──────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
    setSelectedDay(null);
  };

  // Disable past dates
  const isPast = (d) => {
    const clicked = new Date(viewYear, viewMonth, d);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return clicked < todayMidnight;
  };

  const isToday = (d) =>
    d === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDay) return;
    setSubmitting(true);
    try {
      // Build ISO date string from selected year/month/day + time (24h "HH:MM")
      const [h, m] = time.split(":").map(Number);
      const startsAt = new Date(viewYear, viewMonth, selectedDay, h || 0, m || 0);
      const endsAt   = new Date(startsAt.getTime() + duration * 60_000);

      await onSchedule?.({
        date: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`,
        time,
        duration,
        notes,
        startsAt: startsAt.toISOString(),
        endsAt:   endsAt.toISOString(),
      });
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8 px-4"
      style={{ background: "rgba(17,28,45,0.60)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        className="relative w-full overflow-hidden flex flex-col md:flex-row border border-outline-variant/20"
        style={{
          maxWidth: 900,
          borderRadius: "0.5rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
          background: "linear-gradient(135deg,#ffffff 0%,#f0f3ff 100%)",
        }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-outline-variant/30">
          <h2 className="font-semibold text-lg text-on-surface">Schedule Interview</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-low text-on-surface-variant" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* ── Left: Calendar ─────────────────────────────────────── */}
        <div
          className="w-full md:w-[42%] border-r border-outline-variant/30 p-6 flex flex-col"
          style={{ background: "rgba(240,243,255,0.45)", backdropFilter: "blur(4px)" }}
        >
          <div className="mb-5">
            <h2 className="hidden md:block text-xl font-semibold text-on-surface leading-tight">Schedule Interview</h2>
            <p className="text-sm text-on-surface-variant mt-1">Select a date and time for {displayName}</p>
          </div>

          {/* Calendar card */}
          <div className="bg-white rounded-lg border border-outline-variant/50 p-4 shadow-sm flex-grow flex flex-col">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-on-surface">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={prevMonth} className="p-1 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors" aria-label="Previous month">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={nextMonth} className="p-1 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors" aria-label="Next month">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_HEADERS.map((d) => (
                <span key={d} className="text-center text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wide">{d}</span>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-y-0.5 flex-1">
              {/* Offset blank cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d     = i + 1;
                const past  = isPast(d);
                const sel   = selectedDay === d;
                const tod   = isToday(d);

                let cls = "w-8 h-8 mx-auto flex items-center justify-center text-xs rounded-md transition-all ";
                if (past) {
                  cls += "text-on-surface-variant/30 cursor-not-allowed ";
                } else if (sel) {
                  cls += "bg-primary text-white font-bold shadow-md scale-105 ";
                } else if (tod) {
                  cls += "border-2 border-primary text-primary font-semibold hover:bg-primary/10 cursor-pointer ";
                } else {
                  cls += "text-on-surface hover:bg-surface-container-high cursor-pointer ";
                }

                return (
                  <button
                    type="button"
                    key={d}
                    disabled={past}
                    onClick={() => setSelectedDay(d)}
                    className={cls}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 text-xs font-medium text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
              Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border-2 border-primary inline-block" />
              Today
            </span>
          </div>
        </div>

        {/* ── Right: Details ─────────────────────────────────────── */}
        <div className="w-full md:w-[58%] p-6 flex flex-col bg-transparent">
          {/* Close (desktop) */}
          <div className="hidden md:flex justify-end mb-3">
            <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container-low transition-colors" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-5 flex-1">
            {/* Candidate banner */}
            <div className="flex items-center gap-3 p-3 bg-surface-container-low/50 rounded-lg border border-outline-variant/20">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-outline-variant/30 bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center font-bold text-sm">
                {candidateProfilePicUrl
                  ? <img src={candidateProfilePicUrl} alt={displayName} className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div>
                <h3 className="font-semibold text-base text-on-surface leading-none">{displayName}</h3>
                <p className="text-sm text-on-surface-variant mt-0.5">Candidate Interview</p>
              </div>
            </div>

            {/* Selected date display */}
            <div className="px-3 py-2 rounded-lg bg-surface-container-low/40 border border-outline-variant/20 text-sm text-on-surface">
              <span className="text-on-surface-variant font-medium mr-2">Date:</span>
              {selectedDay
                ? <span className="font-semibold">{MONTH_NAMES[viewMonth]} {selectedDay}, {viewYear}</span>
                : <span className="italic text-on-surface-variant">Pick a date from the calendar</span>}
            </div>

            {/* Time + Duration */}
            <div className="grid grid-cols-2 gap-4">
              {/* Time — free text input (HH:MM 24h) */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Time <span className="text-on-surface-variant font-normal">(24-hour, e.g. 14:30)</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Overlap Warning */}
            {overlapWarning && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg p-3 text-sm text-[#DC2626] font-medium flex items-start gap-2">
                <span>{overlapWarning}</span>
              </div>
            )}

            {/* Agenda / Notes */}
            <div className="flex flex-col flex-1">
              <label className="block text-sm font-medium text-on-surface mb-2">Agenda &amp; Notes</label>
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setSavedTemplateMsg(""); }}
                placeholder={`Detail the interview structure, focus areas, or specific notes for ${displayName}...`}
                rows={5}
                className="w-full flex-1 min-h-[120px] p-4 rounded-lg border border-outline-variant bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none shadow-sm"
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("defaultInterviewAgenda", notes);
                    setSavedTemplateMsg("Template saved!");
                    setTimeout(() => setSavedTemplateMsg(""), 3000);
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Save as default template
                </button>
                {savedTemplateMsg && <span className="text-xs font-semibold text-[#059669]">{savedTemplateMsg}</span>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-outline-variant/50 bg-[#F9F9FF] flex items-center justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-on-surface hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !!overlapWarning || !selectedDay}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-[#003EA8] active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed min-w-[140px]"
            >
              {submitting ? "Scheduling..." : "Schedule Interview"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
