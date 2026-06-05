import React from "react";
import { Mic, MicOff, Video, VideoOff, Wifi, CheckCircle2, AlertCircle } from "lucide-react";

export function LobbySystemCheck({ micWorking, cameraWorking, networkWorking }) {
  return (
    <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4">
      <h3 className="text-xl font-bold text-[#111C2D]">System Check</h3>
      <ul className="flex flex-col gap-3">
        <li
          className={
            "flex items-center justify-between p-3 rounded-lg " +
            (micWorking
              ? "bg-[#F9F9FF] border border-outline-variant/30"
              : "bg-[#FFDAD6]/20 border border-error/20")
          }
        >
          <div className="flex items-center gap-3">
            {micWorking ? (
              <Mic size={20} className="text-primary" />
            ) : (
              <MicOff size={20} className="text-error" />
            )}
            <span className="text-base text-[#111C2D]">Microphone</span>
          </div>
          {micWorking ? (
            <CheckCircle2 size={20} className="text-[#4648D4]" />
          ) : (
            <AlertCircle size={20} className="text-error" />
          )}
        </li>
        <li
          className={
            "flex items-center justify-between p-3 rounded-lg " +
            (cameraWorking
              ? "bg-[#F9F9FF] border border-outline-variant/30"
              : "bg-[#FFDAD6]/20 border border-error/20")
          }
        >
          <div className="flex items-center gap-3">
            {cameraWorking ? (
              <Video size={20} className="text-primary" />
            ) : (
              <VideoOff size={20} className="text-error" />
            )}
            <span className="text-base text-[#111C2D]">Camera</span>
          </div>
          {cameraWorking ? (
            <CheckCircle2 size={20} className="text-[#4648D4]" />
          ) : (
            <span className="text-xs font-semibold text-error bg-[#FFDAD6] px-2 py-0.5 rounded">
              Action Required
            </span>
          )}
        </li>
        <li 
          className={
            "flex items-center justify-between p-3 rounded-lg " +
            (networkWorking
              ? "bg-[#F9F9FF] border border-outline-variant/30"
              : "bg-[#FFDAD6]/20 border border-error/20")
          }
        >
          <div className="flex items-center gap-3">
            <Wifi size={20} className={networkWorking ? "text-primary" : "text-error"} />
            <span className="text-base text-[#111C2D]">Network Quality</span>
          </div>
          {networkWorking ? (
            <CheckCircle2 size={20} className="text-[#4648D4]" />
          ) : (
            <span className="text-xs font-semibold text-error bg-[#FFDAD6] px-2 py-0.5 rounded">
              Poor Connection
            </span>
          )}
        </li>
      </ul>
    </div>
  );
}
