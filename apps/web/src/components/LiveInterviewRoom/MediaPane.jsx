import React from "react";
import { VideoOff, MicOff } from "lucide-react";

export default function MediaPane({
  activeLocalStream,
  videoOn,
  isScreenSharing,
  localVideoRef,
  micOn,
  remoteStream,
  remoteVideoOn,
  remoteVideoRef,
  remoteUserJoined,
  isRecruiter,
  interviewData,
  remoteMicOn
}) {
  return (
    <div className="p-4 flex gap-3 border-b border-outline-variant/50 shrink-0">
      {/* Local Camera */}
      <div className="flex-1 aspect-video bg-inverse-surface rounded-xl relative overflow-hidden border border-outline-variant/60 shadow-sm group">
        {activeLocalStream && (videoOn || isScreenSharing) ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${!isScreenSharing ? "transform -scale-x-100" : ""}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant bg-surface-variant">
            <VideoOff size={32} />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">You</div>
        {!micOn && <div className="absolute top-2 right-2 bg-[#DC2626] text-white p-1 rounded-md"><MicOff size={12}/></div>}
      </div>
      
      {/* Remote Camera */}
      <div className="flex-1 aspect-video bg-inverse-surface rounded-xl relative overflow-hidden border border-outline-variant/60 shadow-sm group">
        {remoteStream && remoteVideoOn ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant bg-surface-variant">
            <VideoOff size={32} />
          </div>
        )}
        
        {!remoteUserJoined && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="text-white text-xs font-semibold">
              {isRecruiter ? "Waiting for candidate..." : "Waiting for recruiter..."}
            </span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded z-20">
          {isRecruiter ? (interviewData?.candidate?.name || "Candidate") : (interviewData?.recruiter?.name || "Interviewer")}
        </div>
        {!remoteMicOn && <div className="absolute top-2 right-2 bg-[#DC2626] text-white p-1 rounded-md z-20"><MicOff size={12}/></div>}
      </div>
    </div>
  );
}
