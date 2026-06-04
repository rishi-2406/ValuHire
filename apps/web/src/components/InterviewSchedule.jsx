import React from "react";
import { useNavigate } from "react-router-dom";
import { Filter, ChevronRight, ChevronLeft, Calendar, User, Video, Eye, Plus, FileText, Clock, Building } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import EmptyState from "./EmptyState";

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

          {/* Date Navigation */}
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
                {filteredInterviews.map((interview) => {
                  const id = interview.id || interview.interviewId;
                  
                  // Dynamic display names based on role
                  let displayName = "Interview";
                  let subName = "";
                  let profilePicUrl = null;
                  if (isCandidate) {
                    displayName = interview.recruiter?.name || interview.interviewerName || interview.campaign?.company?.name || "ValuHire Recruiter";
                    subName = interview.campaign?.title || "Technical Interview";
                    profilePicUrl = interview.recruiter?.profilePicUrl;
                  } else {
                    displayName = interview.candidate?.name || interview.candidateName || interview.name || "Candidate";
                    subName = interview.campaign?.targetRole || interview.role || interview.position || "Candidate";
                    profilePicUrl = interview.candidate?.profilePicUrl;
                  }
                  
                  const initials = displayName.substring(0, 2).toUpperCase();
                  
                  const d = new Date(interview.scheduledAt || interview.startsAt || interview.time);
                  const timeString = d.toLocaleString([], { hour: 'numeric', minute: '2-digit' });
                  const duration = interview.durationMinutes || 45;
                  const endsAt = new Date(d.getTime() + duration * 60000);
                  const endTimeString = endsAt.toLocaleString([], { hour: 'numeric', minute: '2-digit' });

                  return (
                    <div
                      key={id}
                      className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {profilePicUrl ? (
                          <img 
                            src={profilePicUrl} 
                            alt={displayName}
                            className="w-12 h-12 rounded-full object-cover border border-outline-variant" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#E7EEFF] text-[#2563EB] flex items-center justify-center font-bold text-lg">
                            {initials}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <h5 className="text-xl font-semibold text-[#111C2D]">
                            {displayName}
                          </h5>
                          <span className="text-xs font-semibold text-primary uppercase line-clamp-1">
                            {subName}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <Clock size={16} className="text-primary" />
                          <span className="text-sm font-bold text-[#111C2D]">
                            {timeString} - {endTimeString}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          {isCandidate ? <Building size={16} className="text-primary" /> : <User size={16} className="text-primary" />}
                          <span className="text-sm font-medium">
                            {isCandidate ? `With: ${displayName}` : `Interviewer: ${interview.interviewerName || "Staff"}`}
                          </span>
                        </div>
                        {interview.notes && (
                          <div className="flex items-start gap-2 text-on-surface-variant mt-2 p-3 bg-[#F8FAFC] rounded-lg border border-outline-variant/50">
                            <FileText size={16} className="text-primary mt-0.5 shrink-0" />
                            <div className="text-sm font-medium italic line-clamp-3 leading-snug">
                              "{interview.notes}"
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 mt-auto">
                        <button
                          onClick={() => handleJoinRoom(id)}
                          className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#003EA8] transition-colors shadow-sm"
                        >
                          <Video size={18} />
                          Join Call
                        </button>
                        <button 
                          onClick={() => {
                            if (interview.campaignId) {
                              navigate(isCandidate ? `/campaigns/${interview.campaignId}/details` : `/campaigns/${interview.campaignId}`);
                            }
                          }}
                          className="w-full py-2 bg-[#F0F3FF] text-[#111C2D] rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#DEE8FF] transition-colors border border-outline-variant"
                        >
                          <Eye size={18} />
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
