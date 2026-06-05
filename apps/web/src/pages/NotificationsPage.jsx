import { useEffect, useState } from "react";
import {
  Bell, CheckCheck, Megaphone, Calendar, Star, ArrowLeft
} from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { NotificationDetail, timeAgo } from "../components/NotificationsPage/NotificationDetail";

const ICON_MAP = {
  SHORTLISTED: Star,
  INTERVIEW_SCHEDULED: Calendar,
  DEFAULT: Megaphone,
};

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
