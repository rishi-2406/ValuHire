import React from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Plus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import EmptyState from "./EmptyState";
import { DateNavigation } from "./InterviewSchedule/DateNavigation";
import { InterviewCard } from "./InterviewSchedule/InterviewCard";

export default function InterviewSchedule({
  days,
  selectedDay,
  setSelectedDay,
  loading,
  error,
  interviews,
  setShowScheduleModal,
  handleJoinRoom,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = (user?.role || "recruiter").toLowerCase();
  const isCandidate = role === "candidate";

  const filteredInterviews = interviews
    .filter((inv) => {
      if (!inv.scheduledAt && !inv.startsAt && !inv.time) return false;
      const date = new Date(inv.scheduledAt || inv.startsAt || inv.time);
      return date.toDateString() === selectedDay.toDateString();
    })
    .sort((a, b) => {
      const timeA = new Date(a.scheduledAt || a.startsAt || a.time).getTime();
      const timeB = new Date(b.scheduledAt || b.startsAt || b.time).getTime();
      return timeA - timeB;
    });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#F9F9FF] h-[calc(100vh-6rem)]">
      <div className="max-w-[1280px] mx-auto space-y-6">
        {/* Full Width Interview Management */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-[#F9F9FF]">
            <h3 className="text-xl font-semibold text-[#111C2D]">Interview Management</h3>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <Filter size={24} />
            </button>
          </div>

          <DateNavigation days={days} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

          {/* Interview List Area */}
          <div className="p-6 bg-[#F0F3FF] min-h-[400px]">
            <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
              Scheduled
            </h4>

            {loading ? (
              <p className="text-sm text-on-surface-variant">Loading interviews…</p>
            ) : error ? (
              <p className="text-sm text-error">Failed to load: {error}</p>
            ) : filteredInterviews.length === 0 ? (
              <EmptyState
                illustration="no-interviews"
                title="No interviews scheduled"
                description="Schedule your first interview to start collaborating with candidates."
                primaryAction={{
                  label: "Schedule interview",
                  icon: <Plus size={18} />,
                  onClick: () => setShowScheduleModal(true),
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.id || interview.interviewId}
                    interview={interview}
                    isCandidate={isCandidate}
                    navigate={navigate}
                    handleJoinRoom={handleJoinRoom}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
