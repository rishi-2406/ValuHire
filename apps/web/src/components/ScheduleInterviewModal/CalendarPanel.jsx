import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarPanel({
  displayName,
  MONTH_NAMES,
  viewMonth,
  viewYear,
  prevMonth,
  nextMonth,
  DAY_HEADERS,
  firstDayOfWeek,
  daysInMonth,
  isPast,
  selectedDay,
  setSelectedDay,
  isToday
}) {
  return (
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
  );
}
