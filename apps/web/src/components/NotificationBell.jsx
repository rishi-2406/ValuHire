import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, X, Megaphone, Calendar, Star } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

const ICON_MAP = {
  SHORTLISTED: Star,
  INTERVIEW_SCHEDULED: Calendar,
  DEFAULT: Megaphone
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

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications(user);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => setOpen((prev) => !prev);

  const handleMarkRead = async (n) => {
    if (!n.isRead) await markRead(n.id);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        type="button"
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-on-surface"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-xl border border-outline-variant/60 z-50 overflow-hidden"
          style={{ top: "calc(100% + 8px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#2563EB]" />
              <h3 className="font-bold text-on-surface text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] rounded-full text-xs font-bold">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-[#2563EB] font-semibold hover:underline"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} /> All read
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-sm text-on-surface-variant">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={32} className="mx-auto mb-3 text-outline-variant" />
                <p className="text-sm font-semibold text-on-surface-variant">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = ICON_MAP[n.type] || ICON_MAP.DEFAULT;
                const iconBg = n.type === "SHORTLISTED" ? "bg-[#FEF3C7] text-[#D97706]"
                  : n.type === "INTERVIEW_SCHEDULED" ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "bg-[#F3F4F6] text-[#6B7280]";
                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n)}
                    className={`flex items-start gap-3 px-5 py-4 border-b border-outline-variant/30 cursor-pointer transition-colors last:border-0 ${!n.isRead ? "bg-[#EFF6FF]/40 hover:bg-[#EFF6FF]/70" : "hover:bg-surface-light"}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-bold text-on-surface leading-tight ${!n.isRead ? "text-[#1E40AF]" : ""}`}>{n.title}</p>
                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-on-surface-variant mt-1 font-semibold">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
