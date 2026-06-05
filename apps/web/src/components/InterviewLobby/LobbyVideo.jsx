import React from "react";
import { Mic, MicOff, VideoOff } from "lucide-react";

export function LobbyVideo({
  videoRef,
  isScreenSharing,
  cameraWorking,
  micWorking,
  user
}) {
  return (
    <div className="relative w-full aspect-video bg-inverse-surface rounded-xl overflow-hidden shadow-sm border border-outline-variant flex items-center justify-center group">
      {isScreenSharing || cameraWorking ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${isScreenSharing ? "" : "transform -scale-x-100"}`}
        />
      ) : (
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full border-4 border-surface shadow-md bg-primary/20 text-primary flex items-center justify-center text-4xl font-bold">
            {user?.name?.charAt(0) || "Y"}
          </div>
          <span className="bg-surface-variant text-on-surface-variant text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <VideoOff size={16} />
            Camera Off
          </span>
        </div>
      )}

      {/* Audio Visualizer Overlay */}
      <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-md rounded-lg p-2 flex items-center gap-2 border border-outline-variant/50 z-20 shadow-sm">
        {micWorking ? (
          <Mic size={20} className="text-primary" />
        ) : (
          <MicOff size={20} className="text-error" />
        )}
        {micWorking && (
          <div className="flex items-end gap-[2px] h-[20px] pb-1 px-1">
            <div className="w-1 bg-primary rounded-sm h-1 animate-pulse"></div>
            <div className="w-1 bg-primary rounded-sm h-2 animate-pulse" style={{ animationDelay: '100ms' }}></div>
            <div className="w-1 bg-primary rounded-sm h-3 animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-1 bg-primary rounded-sm h-[6px] animate-pulse" style={{ animationDelay: '300ms' }}></div>
            <div className="w-1 bg-primary rounded-sm h-[10px] animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
