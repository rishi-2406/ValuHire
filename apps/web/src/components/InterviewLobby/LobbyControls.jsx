import React from "react";
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, Settings } from "lucide-react";

export function LobbyControls({
  micOn, setMicOn,
  videoOn, setVideoOn,
  isScreenSharing, toggleScreenShare,
  onLeave,
  setShowSettingsModal
}) {
  return (
    <div className="flex items-center justify-center gap-4 bg-white rounded-xl border border-outline-variant p-4 shadow-sm">
      <button className="flex flex-col items-center gap-1 group" onClick={() => setMicOn(!micOn)}>
        <div
          className={
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors " +
            (micOn
              ? "bg-surface-variant text-on-surface-variant group-hover:bg-[#EEF3FF] group-hover:text-primary"
              : "bg-[#FFDAD6] text-[#93000A] hover:bg-[#BA1A1A] hover:text-white")
          }
        >
          {micOn ? <Mic size={24} /> : <MicOff size={24} />}
        </div>
        <span
          className={
            "text-xs font-semibold " +
            (micOn ? "text-on-surface-variant group-hover:text-primary" : "text-error")
          }
        >
          {micOn ? "Unmute" : "Muted"}
        </span>
      </button>

      <button className="flex flex-col items-center gap-1 group" onClick={() => setVideoOn(!videoOn)}>
        <div
          className={
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors " +
            (videoOn
              ? "bg-surface-variant text-on-surface-variant hover:bg-[#EEF3FF] hover:text-primary"
              : "bg-[#FFDAD6] text-[#93000A] hover:bg-[#BA1A1A] hover:text-white")
          }
        >
          {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </div>
        <span className={"text-xs font-semibold " + (videoOn ? "text-on-surface-variant" : "text-error")}>
          {videoOn ? "Stop Cam" : "Camera"}
        </span>
      </button>

      <div className="w-px h-8 bg-outline-variant mx-2"></div>

      <button className="flex flex-col items-center gap-1 group" onClick={toggleScreenShare}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          isScreenSharing 
          ? "bg-[#D3E3FD] text-primary hover:bg-[#A8C7FA]"
          : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest"
        }`}>
          <ScreenShare size={24} />
        </div>
        <span className={`text-xs font-semibold ${isScreenSharing ? "text-primary" : "text-on-surface-variant"}`}>
          {isScreenSharing ? "Sharing" : "Share"}
        </span>
      </button>

      <button className="flex flex-col items-center gap-1 group ml-auto" onClick={onLeave}>
        <div className="w-12 h-12 rounded-full bg-surface border border-outline-variant flex items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-error hover:border-error">
          <PhoneOff size={24} />
        </div>
        <span className="text-xs font-semibold text-on-surface-variant">Cancel</span>
      </button>

      <button className="flex flex-col items-center gap-1 group" onClick={() => setShowSettingsModal(true)}>
        <div className="w-12 h-12 rounded-full bg-surface border border-outline-variant flex items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-variant">
          <Settings size={24} />
        </div>
        <span className="text-xs font-semibold text-on-surface-variant">Settings</span>
      </button>
    </div>
  );
}
