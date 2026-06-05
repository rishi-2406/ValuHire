import { X } from "lucide-react";
import { CalendarPanel } from "./ScheduleInterviewModal/CalendarPanel";
import { InterviewFormPanel } from "./ScheduleInterviewModal/InterviewFormPanel";
import { useScheduleInterview } from "../hooks/useScheduleInterview";

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
  const {
    viewYear,
    viewMonth,
    selectedDay,
    setSelectedDay,
    time,
    setTime,
    duration,
    setDuration,
    notes,
    setNotes,
    submitting,
    overlapWarning,
    savedTemplateMsg,
    setSavedTemplateMsg,
    prevMonth,
    nextMonth,
    isPast,
    isToday,
    handleSubmit,
  } = useScheduleInterview({ open, interviews, onSchedule, onClose });

  if (!open) return null;

  const displayName   = candidateName || "the Candidate";
  const initials      = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  const daysInMonth   = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfMonth(viewYear, viewMonth);

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

        <CalendarPanel
          displayName={displayName}
          MONTH_NAMES={MONTH_NAMES}
          viewMonth={viewMonth}
          viewYear={viewYear}
          prevMonth={prevMonth}
          nextMonth={nextMonth}
          DAY_HEADERS={DAY_HEADERS}
          firstDayOfWeek={firstDayOfWeek}
          daysInMonth={daysInMonth}
          isPast={isPast}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          isToday={isToday}
        />

        <InterviewFormPanel
          onClose={onClose}
          candidateProfilePicUrl={candidateProfilePicUrl}
          displayName={displayName}
          initials={initials}
          selectedDay={selectedDay}
          MONTH_NAMES={MONTH_NAMES}
          viewMonth={viewMonth}
          viewYear={viewYear}
          time={time}
          setTime={setTime}
          duration={duration}
          setDuration={setDuration}
          overlapWarning={overlapWarning}
          notes={notes}
          setNotes={setNotes}
          setSavedTemplateMsg={setSavedTemplateMsg}
          savedTemplateMsg={savedTemplateMsg}
          submitting={submitting}
        />
      </form>
    </div>
  );
}
