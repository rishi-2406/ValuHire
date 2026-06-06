import React, { useEffect, useState } from "react";
import { VideoOff, MicOff, Maximize2, Monitor, Camera, ArrowLeftRight } from "lucide-react";

export default function MediaPane({
  stream,
  displayStream,
  videoOn,
  micOn,
  isScreenSharing,
  localVideoRef,
  localScreenRef,
  remoteCameraStream,
  remoteScreenStream,
  remoteVideoOn,
  remoteMicOn,
  remoteIsScreenSharing,
  remoteVideoRef,
  remoteScreenRef,
  remoteUserJoined,
  isRecruiter,
  interviewData,
  expandedView,
  setExpandedView,
  miniScreenPreference,
  setMiniScreenPreference
}) {
  const [localPreference, setLocalPreference] = useState("camera");
  const [remotePreference, setRemotePreference] = useState("camera");

  // Force local to camera if local-screen is expanded
  useEffect(() => {
    if (expandedView === "local-screen") setLocalPreference("camera");
  }, [expandedView]);

  // Force remote to camera if remote-screen is expanded
  useEffect(() => {
    if (expandedView === "remote-screen") setRemotePreference("camera");
  }, [expandedView]);

  const hasLocalBoth = (stream && videoOn) && (displayStream && isScreenSharing);
  const showLocalScreen = isScreenSharing && (localPreference === "screen" || !videoOn);
  
  const hasRemoteBoth = remoteCameraStream && remoteVideoOn && remoteScreenStream && remoteIsScreenSharing;
  const showRemoteScreen = remoteIsScreenSharing && (remotePreference === "screen" || !remoteVideoOn);

  // Bind streams to video elements dynamically as they mount/unmount based on preferences
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(console.error);
    }
  }, [stream, videoOn, showLocalScreen, localVideoRef]);

  useEffect(() => {
    if (localScreenRef.current && displayStream) {
      localScreenRef.current.srcObject = displayStream;
      localScreenRef.current.play().catch(console.error);
    }
  }, [displayStream, isScreenSharing, showLocalScreen, localScreenRef]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteCameraStream) {
      remoteVideoRef.current.srcObject = remoteCameraStream;
      remoteVideoRef.current.play().catch(console.error);
    }
  }, [remoteCameraStream, remoteVideoOn, showRemoteScreen, remoteVideoRef]);

  useEffect(() => {
    if (remoteScreenRef.current && remoteScreenStream) {
      remoteScreenRef.current.srcObject = remoteScreenStream;
      remoteScreenRef.current.play().catch(console.error);
    }
  }, [remoteScreenStream, remoteIsScreenSharing, showRemoteScreen, remoteScreenRef]);

  return (
    <div className="p-4 flex gap-3 border-b border-outline-variant/50 shrink-0">
      {/* Local Video Box */}
      <div className="flex-1 aspect-video bg-inverse-surface rounded-xl relative overflow-hidden border border-outline-variant/60 shadow-sm group">
        
        {/* Toggle between cam/screen if both exist */}
        {hasLocalBoth && expandedView !== "local-screen" && (
          <button 
            onClick={() => setLocalPreference(prev => prev === "camera" ? "screen" : "camera")}
            className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-md z-30 transition-colors backdrop-blur flex items-center gap-1 text-[10px] font-bold"
            title="Switch View"
          >
            <ArrowLeftRight size={12} /> {localPreference === "camera" ? "View Screen" : "View Camera"}
          </button>
        )}

        {showLocalScreen ? (
          <>
            <video
              ref={localScreenRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Expand Hover Overlay */}
            {expandedView !== "local-screen" && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                <button 
                  onClick={() => setExpandedView("local-screen")}
                  className="bg-black/60 text-white px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-black font-semibold text-xs backdrop-blur transition-all hover:scale-105"
                >
                  <Maximize2 size={14} /> Expand Screen
                </button>
              </div>
            )}
          </>
        ) : (
          stream && videoOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant bg-surface-variant">
              <VideoOff size={32} />
            </div>
          )
        )}
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded z-20 flex items-center gap-1">
          {showLocalScreen ? <Monitor size={10} /> : <Camera size={10} />} You
        </div>
        {!micOn && <div className="absolute top-2 right-2 bg-[#DC2626] text-white p-1 rounded-md z-20"><MicOff size={12}/></div>}
      </div>
      
      {/* Remote Video Box */}
      <div className="flex-1 aspect-video bg-inverse-surface rounded-xl relative overflow-hidden border border-outline-variant/60 shadow-sm group">
        
        {hasRemoteBoth && expandedView !== "remote-screen" && (
          <button 
            onClick={() => setRemotePreference(prev => prev === "camera" ? "screen" : "camera")}
            className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-md z-30 transition-colors backdrop-blur flex items-center gap-1 text-[10px] font-bold"
            title="Switch View"
          >
            <ArrowLeftRight size={12} /> {remotePreference === "camera" ? "View Screen" : "View Camera"}
          </button>
        )}

        {showRemoteScreen ? (
          <>
            <video
              ref={remoteScreenRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {expandedView !== "remote-screen" && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                <button 
                  onClick={() => setExpandedView("remote-screen")}
                  className="bg-black/60 text-white px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-black font-semibold text-xs backdrop-blur transition-all hover:scale-105"
                >
                  <Maximize2 size={14} /> Expand Screen
                </button>
              </div>
            )}
          </>
        ) : (
          remoteCameraStream && remoteVideoOn ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant bg-surface-variant">
              <VideoOff size={32} />
            </div>
          )
        )}
        
        {!remoteUserJoined && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="text-white text-xs font-semibold">
              {isRecruiter ? "Waiting for candidate..." : "Waiting for recruiter..."}
            </span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded z-20 flex items-center gap-1">
          {showRemoteScreen ? <Monitor size={10} /> : <Camera size={10} />}
          {isRecruiter ? (interviewData?.candidate?.name || "Candidate") : (interviewData?.recruiter?.name || "Interviewer")}
        </div>
        {!remoteMicOn && <div className="absolute top-2 right-2 bg-[#DC2626] text-white p-1 rounded-md z-20"><MicOff size={12}/></div>}
      </div>
    </div>
  );
}
