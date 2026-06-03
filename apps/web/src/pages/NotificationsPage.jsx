import { useEffect } from "react";
import { Bell, CheckCheck, Megaphone, Calendar, Star } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

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

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { notifications, loading, markRead, markAllRead } = useNotifications(user);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleMarkRead = async (n) => {
    if (!n.isRead) await markRead(n.id);
  };

  if (authLoading) return null;

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role={user?.role?.toLowerCase() || "candidate"} />
      <main className="workspace">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-outline-variant/50 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-primary" />
            <h1 className="text-title-lg font-bold text-on-surface">Notifications</h1>
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-primary font-semibold rounded-lg hover:bg-surface-container transition-colors"
          >
            <CheckCheck size={18} />
            Mark all as read
          </button>
        </header>
        
        <div className="p-8 max-w-4xl mx-auto">
          <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden">
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
                  const iconBg = n.type === "SHORTLISTED" ? "bg-[#FEF3C7] text-[#D97706]"
                    : n.type === "INTERVIEW_SCHEDULED" ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "bg-[#F3F4F6] text-[#6B7280]";
                  
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n)}
                      className={`flex items-start gap-4 p-6 cursor-pointer transition-colors ${!n.isRead ? "bg-[#EFF6FF]/20 hover:bg-[#EFF6FF]/40" : "hover:bg-surface-light"}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className={`text-base font-bold text-on-surface leading-tight ${!n.isRead ? "text-[#1E40AF]" : ""}`}>
                            {n.title}
                          </h4>
                          <span className="text-xs text-on-surface-variant font-medium shrink-0">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="w-3 h-3 rounded-full bg-[#2563EB] shrink-0 mt-2 shadow-sm" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
