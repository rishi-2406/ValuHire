import { useEffect, useState } from "react";
import {
  Bell, CheckCheck, Megaphone, Calendar, Star, X,
  MapPin, Video, Clock, User, Briefcase, ArrowLeft, CheckCircle2
} from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const ICON_MAP = {
  SHORTLISTED: Star,
  INTERVIEW_SCHEDULED: Calendar,
  DEFAULT: Megaphone,
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Full-screen detail panel that slides over the list */
function NotificationDetail({ n, onBack }) {
  const meta = n.metadata || {};
  const isShortlisted = n.type === "SHORTLISTED";
  const isInterview = n.type === "INTERVIEW_SCHEDULED";

  const iconBg =
    n.type === "SHORTLISTED"
      ? "bg-[#FEF3C7] text-[#D97706]"
      : n.type === "INTERVIEW_SCHEDULED"
      ? "bg-[#EFF6FF] text-[#2563EB]"
      : "bg-[#F3F4F6] text-[#6B7280]";
  const Icon = ICON_MAP[n.type] || ICON_MAP.DEFAULT;

  return (
    <div className="h-full flex flex-col">
      {/* Detail header */}
      <div className="flex items-center gap-3 p-5 border-b border-outline-variant/40 bg-white sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        {!n.isRead && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold">
            New
          </span>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Hero */}
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface leading-tight">{n.title}</h2>
            <p className="text-xs text-on-surface-variant mt-1 font-medium">{timeAgo(n.createdAt)}</p>
          </div>
        </div>

        {/* Main message */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <p className="text-sm text-on-surface leading-relaxed">
            {isShortlisted
              ? "You have been shortlisted for this campaign. Congratulations!"
              : n.message}
          </p>
        </div>

        {/* ── SHORTLISTED details ── */}
        {isShortlisted && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Campaign Details</h3>
            <div className="bg-white rounded-xl border border-outline-variant/40 divide-y divide-outline-variant/20 overflow-hidden shadow-sm">
              {meta.campaignTitle && (
                <div className="flex items-center gap-4 px-5 py-4">
                  <Briefcase size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Campaign</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{meta.campaignTitle}</p>
                  </div>
                </div>
              )}
              {meta.position && (
                <div className="flex items-center gap-4 px-5 py-4">
                  <User size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Role</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{meta.position}</p>
                  </div>
                </div>
              )}
              {meta.nextStep && (
                <div className="flex items-start gap-4 px-5 py-4">
                  <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">What's Next</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">{meta.nextStep}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── INTERVIEW_SCHEDULED details ── */}
        {isInterview && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Meeting Details</h3>
            <div className="bg-white rounded-xl border border-outline-variant/40 divide-y divide-outline-variant/20 overflow-hidden shadow-sm">

              {meta.scheduledAt && (
                <div className="flex items-center gap-4 px-5 py-4">
                  <Clock size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Date &amp; Time</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">
                      {new Date(meta.scheduledAt).toLocaleString(undefined, {
                        weekday: "long", year: "numeric", month: "long",
                        day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    {meta.durationMinutes && (
                      <p className="text-xs text-on-surface-variant mt-0.5">{meta.durationMinutes} minutes</p>
                    )}
                  </div>
                </div>
              )}

              {meta.interviewerName && (
                <div className="flex items-center gap-4 px-5 py-4">
                  <User size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Interviewer</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{meta.interviewerName}</p>
                  </div>
                </div>
              )}

              {meta.campaignTitle && (
                <div className="flex items-center gap-4 px-5 py-4">
                  <Briefcase size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Campaign</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{meta.campaignTitle}</p>
                  </div>
                </div>
              )}

              {meta.meetingLink && (
                <div className="flex items-center gap-4 px-5 py-4">
                  <Video size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Meeting Link</p>
                    <a
                      href={meta.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary underline hover:no-underline break-all mt-0.5 block"
                    >
                      {meta.meetingLink}
                    </a>
                  </div>
                </div>
              )}

              {meta.location && (
                <div className="flex items-center gap-4 px-5 py-4">
                  <MapPin size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Location</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{meta.location}</p>
                  </div>
                </div>
              )}

              {/* Recruiter notes — the most important thing the user asked for */}
              {meta.notes && (
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Megaphone size={16} className="text-primary" />
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Notes from Interviewer</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30">
                    <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">{meta.notes}</p>
                  </div>
                </div>
              )}

              {/* Graceful empty state if no notes */}
              {!meta.notes && !meta.meetingLink && !meta.location && !meta.interviewerName && !meta.scheduledAt && (
                <div className="px-5 py-6 text-center text-sm text-on-surface-variant">
                  No additional details were provided by the interviewer yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { notifications, loading, markRead, markAllRead } = useNotifications(user);
  const [selected, setSelected] = useState(null); // active notification for detail view
  const isCandidate = user?.role?.toLowerCase() === "candidate";

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const handleSelect = async (n) => {
    setSelected(n);
    if (!n.isRead) await markRead(n.id);
  };

  if (authLoading) return null;

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role={user?.role?.toLowerCase() || "candidate"} />
      <main className="workspace">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-outline-variant/50 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {selected ? (
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft size={18} /> Notifications
              </button>
            ) : (
              <>
                <Bell size={24} className="text-primary" />
                <h1 className="text-title-lg font-bold text-on-surface">Notifications</h1>
              </>
            )}
          </div>
          {!selected && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-primary font-semibold rounded-lg hover:bg-surface-container transition-colors"
            >
              <CheckCheck size={18} />
              Mark all as read
            </button>
          )}
        </header>

        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden">

            {/* ── Detail view ── */}
            {selected ? (
              <NotificationDetail n={selected} onBack={() => setSelected(null)} />
            ) : (
              /* ── List view ── */
              <>
                {loading ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-24 text-center">
                    <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell size={32} className="text-on-surface-variant" />
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-2">You're all caught up!</h3>
                    <p className="text-on-surface-variant">No new notifications to display.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/30">
                    {notifications.map((n) => {
                      const Icon = ICON_MAP[n.type] || ICON_MAP.DEFAULT;
                      const iconBg =
                        n.type === "SHORTLISTED"
                          ? "bg-[#FEF3C7] text-[#D97706]"
                          : n.type === "INTERVIEW_SCHEDULED"
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : "bg-[#F3F4F6] text-[#6B7280]";

                      const displayMessage =
                        isCandidate && n.type === "SHORTLISTED"
                          ? "You have been shortlisted for this campaign."
                          : n.message;

                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => handleSelect(n)}
                          className={`w-full text-left flex items-start gap-4 px-6 py-5 transition-colors ${
                            !n.isRead ? "bg-[#EFF6FF]/20 hover:bg-[#EFF6FF]/50" : "hover:bg-surface-light"
                          }`}
                        >
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                            <Icon size={19} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <h4 className={`text-sm font-bold text-on-surface leading-snug ${!n.isRead ? "text-[#1E40AF]" : ""}`}>
                                {n.title}
                              </h4>
                              <span className="text-xs text-on-surface-variant font-medium shrink-0 mt-0.5">
                                {timeAgo(n.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed line-clamp-2">
                              {displayMessage}
                            </p>
                            {(n.type === "SHORTLISTED" || n.type === "INTERVIEW_SCHEDULED") && (
                              <span className="inline-block mt-2 text-xs font-semibold text-primary">
                                Tap to view details →
                              </span>
                            )}
                          </div>

                          {!n.isRead && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0 mt-1.5 shadow-sm" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
