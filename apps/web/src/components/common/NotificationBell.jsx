import { Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export default function NotificationBell({ user }) {
  const { unreadCount } = useNotifications(user);
  const navigate = useNavigate();
  const [showPopover, setShowPopover] = useState(false);
  const btnRef = useRef(null);
  const popoverRef = useRef(null);
  const [popPos, setPopPos] = useState({ top: 0, left: 0 });

  // Calculate popover position anchored to the button, always on-screen
  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const PW = 220; // popover width
    const PH = 130; // approximate popover height
    const margin = 8;

    // Try to open to the right first; fallback left
    let left = r.right + margin;
    if (left + PW > window.innerWidth - margin) {
      left = r.left - PW - margin;
    }
    // Try to open upward from button center; clamp to viewport
    let top = r.top + r.height / 2 - PH / 2;
    top = Math.max(margin, Math.min(top, window.innerHeight - PH - margin));

    setPopPos({ top, left });
  }, []);

  useEffect(() => {
    if (!showPopover) return;
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [showPopover, updatePos]);

  // Close on outside click
  useEffect(() => {
    if (!showPopover) return;
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        popoverRef.current && !popoverRef.current.contains(e.target)
      ) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPopover]);

  const handleClick = () => {
    if (unreadCount > 0) {
      navigate("/notifications");
    } else {
      setShowPopover((v) => !v);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-on-surface"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center px-0.5 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Portalled popover — renders at document.body to escape any overflow/z-index traps */}
      {showPopover && unreadCount === 0 && createPortal(
        <div
          ref={popoverRef}
          style={{ position: "fixed", top: popPos.top, left: popPos.left, width: 220, zIndex: 9999 }}
          className="bg-white border border-outline-variant/50 rounded-xl shadow-xl p-4 text-center"
        >
          <Bell size={20} className="text-on-surface-variant mx-auto mb-2" />
          <p className="text-sm font-semibold text-on-surface">No new notifications</p>
          <p className="text-xs text-on-surface-variant mt-0.5">You're all caught up!</p>
          <button
            type="button"
            onClick={() => { setShowPopover(false); navigate("/notifications"); }}
            className="mt-3 text-xs font-bold text-primary hover:underline"
          >
            View all notifications
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
