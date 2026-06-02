import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Video, Phone, Building2, UserPlus } from "lucide-react";

const DURATION_OPTIONS = ["30m", "45m", "60m"];
const TIME_SLOTS = ["1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"];

export default function ScheduleInterviewModal({ open, onClose, onSchedule }) {
  const [selectedDate, setSelectedDate] = useState(16);
  const [time, setTime] = useState("2:00 PM");
  const [duration, setDuration] = useState("45m");
  const [interviewType, setInterviewType] = useState("Video Call");
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState([
    { id: "1", name: "John Doe", initials: "JD", color: "bg-[#2563EB]" },
    { id: "2", name: "Alice Smith", initials: "AS", color: "bg-[#6366F1]" }
  ]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const removeAttendee = (id) => {
    setAttendees(attendees.filter(a => a.id !== id));
  };

  const handleAttendeeInput = (e) => {
    if (e.key === "Enter" && attendeeInput.trim()) {
      e.preventDefault();
      const name = attendeeInput.trim();
      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2) || "U";
      setAttendees([...attendees, { id: Date.now().toString(), name, initials, color: "bg-[#475569]" }]);
      setAttendeeInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSchedule?.({
        date: `2023-10-${selectedDate}`,
        time,
        duration: parseInt(duration),
        type: interviewType,
        attendees,
        notes
      });
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar rendering helper for October 2023 (as in mockup)
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const dates = [];
  // Oct 1 was Sunday
  for(let i=1; i<=31; i++) dates.push(i);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <form className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[550px]" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        
        {/* Left Column: Calendar */}
        <div className="w-full md:w-[320px] bg-[#F8FAFC] p-8 border-r border-outline-variant/50 flex flex-col shrink-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface mb-1">Schedule Interview</h2>
            <p className="text-sm text-on-surface-variant">Select a date and time for Sarah Jenkins</p>
          </div>

          <div className="bg-white border border-outline-variant/50 rounded-xl p-5 shadow-sm mb-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-on-surface text-sm">October 2023</span>
              <div className="flex gap-2 text-on-surface-variant">
                <button type="button" className="hover:text-black transition-colors"><ChevronLeft size={16} /></button>
                <button type="button" className="hover:text-black transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-2 mb-2">
              {days.map(d => <div key={d} className="text-center text-xs font-semibold text-on-surface-variant/70">{d}</div>)}
              {/* Empty slot for Saturday offset if needed, but Oct 1 2023 is Sunday so we start right away */}
              {dates.map(d => {
                const isSelected = d === selectedDate;
                const isAvailable = [15, 17].includes(d);
                let btnClass = "w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm transition-colors ";
                
                if (isSelected) {
                  btnClass += "bg-[#2563EB] text-white font-bold shadow-sm";
                } else if (isAvailable) {
                  btnClass += "bg-[#EFF6FF] text-[#2563EB] font-semibold hover:bg-[#DBEAFE]";
                } else {
                  btnClass += "text-on-surface hover:bg-surface-light";
                }

                return (
                  <button type="button" key={d} onClick={() => setSelectedDate(d)} className={btnClass}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-6 px-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span> Selected
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-[#93C5FD]"></span> Available
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="flex-1 flex flex-col relative bg-white">
          <button type="button" className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors p-1" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>

          <div className="p-8 pt-12 overflow-y-auto flex-1">
            <div className="flex flex-col gap-8 max-w-lg">
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Time Slot (PST)</label>
                  <div className="relative">
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full border border-outline-variant/80 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface appearance-none bg-[#F8FAFC]"
                    >
                      {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Duration</label>
                  <div className="flex items-center bg-[#F8FAFC] border border-outline-variant/80 rounded-lg p-1">
                    {DURATION_OPTIONS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${duration === d ? 'bg-white text-[#2563EB] shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Interview Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Video Call", icon: Video },
                    { label: "Phone", icon: Phone },
                    { label: "On-site", icon: Building2 },
                  ].map(type => {
                    const Icon = type.icon;
                    const isSelected = interviewType === type.label;
                    return (
                      <button
                        key={type.label}
                        type="button"
                        onClick={() => setInterviewType(type.label)}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-semibold transition-colors ${isSelected ? 'border-[#2563EB] text-[#2563EB] bg-[#EFF6FF]' : 'border-outline-variant/80 text-on-surface-variant hover:border-outline-variant bg-white'}`}
                      >
                        <Icon size={16} />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Attendees</label>
                <div className="relative mb-3">
                  <UserPlus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    onKeyDown={handleAttendeeInput}
                    placeholder="Add team members..."
                    className="w-full border border-outline-variant/80 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {attendees.map(a => (
                    <span key={a.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F1F5F9] rounded-full text-sm font-semibold text-[#334155]">
                      <span className={`w-5 h-5 rounded-full ${a.color} text-white text-[10px] flex items-center justify-center`}>
                        {a.initials}
                      </span>
                      {a.name}
                      <button type="button" onClick={() => removeAttendee(a.id)} className="text-on-surface-variant hover:text-black ml-1"><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Agenda / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes or an agenda for the candidate and interviewers..."
                  rows={4}
                  className="w-full border border-outline-variant/80 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface resize-none bg-[#F8FAFC]"
                />
              </div>

            </div>
          </div>

          <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-white mt-auto">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-outline-variant/80 hover:bg-surface-light text-on-surface rounded-lg font-bold text-sm transition-colors" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm inline-flex items-center gap-2" disabled={submitting}>
              <span>{submitting ? "Scheduling…" : "Schedule"}</span>
              {!submitting && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14 0"/><path d="m12 5 7 7-7 7"/></svg>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
