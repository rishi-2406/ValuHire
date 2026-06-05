import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DateNavigation({ days, selectedDay, setSelectedDay }) {
  return (
    <div className="p-6 border-b border-outline-variant bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            className="p-1 hover:bg-[#F0F3FF] rounded-full transition-colors"
            onClick={() => {
              const d = new Date(selectedDay);
              d.setDate(d.getDate() - 7);
              setSelectedDay(d);
            }}
          > 
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm font-medium text-[#111C2D]">
            {days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} –{" "}
            {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
          <button
            className="p-1 hover:bg-[#F0F3FF] rounded-full transition-colors"
            onClick={() => {
              const d = new Date(selectedDay);
              d.setDate(d.getDate() + 7);
              setSelectedDay(d);
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <button
          className="text-primary text-sm font-medium hover:underline"
          onClick={() => setSelectedDay(new Date())}
        >
          Today
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === selectedDay.toDateString();
          return (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={
                "flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors border " +
                (isSelected
                  ? "bg-primary text-white border-primary shadow-md"
                  : isToday
                  ? "bg-[#E7EEFF] text-primary border-primary/30 hover:border-primary"
                  : "bg-white border-outline-variant hover:border-primary")
              }
            >
              <span
                className={
                  "text-xs font-semibold " +
                  (isSelected ? "opacity-80" : "text-on-surface-variant")
                }
              >
                {day.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}
              </span>
              <span
                className={"text-xl font-semibold " + (isSelected ? "" : "text-[#111C2D]")}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
