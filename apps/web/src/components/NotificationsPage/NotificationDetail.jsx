import React from "react";
import { Megaphone, ArrowLeft, Calendar, Star } from "lucide-react";
import { ShortlistDetails } from "./ShortlistDetails";
import { InterviewDetails } from "./InterviewDetails";

const ICON_MAP = {
  SHORTLISTED: Star,
  INTERVIEW_SCHEDULED: Calendar,
  DEFAULT: Megaphone,
};

export function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationDetail({ n, onBack }) {
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

        {isShortlisted && <ShortlistDetails meta={meta} />}
        {isInterview && <InterviewDetails meta={meta} />}
      </div>
    </div>
  );
}
