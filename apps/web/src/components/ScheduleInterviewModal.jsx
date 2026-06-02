import { useState } from "react";
import { X, Calendar, Clock, Video, Plus, Trash2 } from "lucide-react";

const DURATION_OPTIONS = ["15", "30", "45", "60", "90"];
const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00"
];

function formatDateInput(date) {
  return date.toISOString().slice(0, 10);
}

export default function ScheduleInterviewModal({ open, onClose, onSchedule, candidates = [] }) {
  const today = new Date();
  const [date, setDate] = useState(formatDateInput(today));
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("30");
  const [candidateId, setCandidateId] = useState(candidates[0]?.id || "");
  const [agenda, setAgenda] = useState("");
  const [interviewers, setInterviewers] = useState([""]);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const updateInterviewer = (i, value) => {
    setInterviewers(interviewers.map((v, idx) => (idx === i ? value : v)));
  };

  const addInterviewer = () => setInterviewers([...interviewers, ""]);
  const removeInterviewer = (i) => {
    if (interviewers.length === 1) return;
    setInterviewers(interviewers.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!candidateId) return;
    setSubmitting(true);
    try {
      await onSchedule?.({
        candidateId,
        date,
        time,
        duration: Number(duration),
        agenda: agenda.trim(),
        interviewers: interviewers.filter((v) => v.trim())
      });
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="schedule-interview-title">
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div>
            <h2 id="schedule-interview-title">Schedule Interview</h2>
            <p>Invite a candidate to a live interview session.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="stack">
            <div className="form-row">
              <label htmlFor="schedule-candidate">Candidate</label>
              <select
                id="schedule-candidate"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                required
              >
                <option value="" disabled>Select a candidate…</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.role || c.email}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="form-row col-span-2">
                <label htmlFor="schedule-date">Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    id="schedule-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={formatDateInput(today)}
                    className="w-full h-11 pl-9 pr-3 border border-outline rounded-lg text-sm bg-white"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="schedule-time">Time</label>
                <select id="schedule-time" value={time} onChange={(e) => setTime(e.target.value)}>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="schedule-duration">Duration</label>
              <div className="flex flex-wrap items-center gap-2">
                <Clock size={16} className="text-on-surface-variant" />
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={
                      "px-3 h-9 rounded-lg text-sm font-semibold border transition-colors " +
                      (duration === d
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-on-surface-variant border-outline hover:border-primary hover:text-primary")
                    }
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="schedule-agenda">Agenda</label>
              <textarea
                id="schedule-agenda"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                rows={3}
                placeholder="Topics to cover, coding focus, system design areas…"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-on-surface">Interviewers</label>
                <button type="button" onClick={addInterviewer} className="tertiary-button text-sm">
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
              <div className="stack">
                {interviewers.map((value, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Video size={16} className="text-on-surface-variant flex-shrink-0" />
                    <input
                      value={value}
                      onChange={(e) => updateInterviewer(i, e.target.value)}
                      placeholder="interviewer@company.com"
                      className="flex-1 h-10 px-3 border border-outline rounded-lg text-sm bg-white"
                      type="email"
                    />
                    {interviewers.length > 1 ? (
                      <button type="button" onClick={() => removeInterviewer(i)} className="icon-button" aria-label="Remove interviewer">
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              <span className="helper">A video link will be generated automatically.</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="secondary-button" disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={submitting || !candidateId}>
            <Calendar size={16} />
            <span>{submitting ? "Scheduling…" : "Schedule Interview"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
