import { useState, useEffect } from "react";

export function useScheduleInterview({
  open,
  interviews,
  onSchedule,
  onClose,
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

  return {
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
  };
}
