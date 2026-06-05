import React from "react";
import { X } from "lucide-react";

export function InterviewFormPanel({
  onClose,
  candidateProfilePicUrl,
  displayName,
  initials,
  selectedDay,
  MONTH_NAMES,
  viewMonth,
  viewYear,
  time,
  setTime,
  duration,
  setDuration,
  overlapWarning,
  notes,
  setNotes,
  setSavedTemplateMsg,
  savedTemplateMsg,
  submitting
}) {
  return (
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
  );
}
