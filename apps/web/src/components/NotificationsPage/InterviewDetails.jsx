import React from "react";
import { Clock, User, Briefcase, Video, MapPin, Megaphone } from "lucide-react";

export function InterviewDetails({ meta }) {
  return (
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

        {/* Recruiter notes */}
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
  );
}
