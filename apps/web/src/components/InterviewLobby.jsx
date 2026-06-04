import React, { useRef, useEffect, useState } from "react";
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, Settings, CheckCircle2, Wifi, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useMediaDevices } from "../hooks/useMediaDevices";
import DeviceSettingsModal from "./DeviceSettingsModal";
import InterviewDetailsModal from "./InterviewDetailsModal";

export default function InterviewLobby({
  activeInterview,
  initials,
  user,
  videoOn,
  setVideoOn,
  micOn,
  setMicOn,
  onLeave,
  onJoin,
}) {
  const toast = useToast();
  const videoRef = useRef(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    stream,
    displayStream,
    micWorking,
    cameraWorking,
    networkWorking,
    isScreenSharing,
    toggleScreenShare,
    error,
    devices,
    selectedAudioId,
    setSelectedAudioId,
    selectedVideoId,
    setSelectedVideoId
  } = useMediaDevices(videoOn, micOn);

  // Show error toast if media device fails
  useEffect(() => {
    if (error) {
      toast.error(`Media Error: ${error}`);
    }
  }, [error, toast]);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current) {
      if (isScreenSharing && displayStream) {
        videoRef.current.srcObject = displayStream;
      } else if (stream && cameraWorking) {
        videoRef.current.srcObject = stream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream, displayStream, isScreenSharing, cameraWorking]);

  return (
    <>
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-8 flex flex-col xl:flex-row gap-6 overflow-y-auto bg-[#F9F9FF] h-[calc(100vh-6rem)]">
        {/* Left Column: Video & Controls */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Video Container */}
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

          {/* Controls Bar */}
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
        </div>

        {/* Right Column: Details & Checklist */}
        <div className="w-full xl:w-96 flex flex-col gap-6 shrink-0">
          {/* Interview Info Card */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
            <h3 className="text-xl font-bold text-[#111C2D]">Interview Details</h3>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-outline uppercase">Position</p>
              <p className="text-base font-semibold text-[#111C2D]">
                {activeInterview.campaign?.title || activeInterview.role || activeInterview.position || "Candidate Role"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-outline uppercase">Candidate</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E7EEFF] text-primary flex items-center justify-center font-bold text-sm">
                  {initials}
                </div>
                <p className="text-base text-[#111C2D] font-medium">
                  {activeInterview.candidate?.name || activeInterview.candidateName || activeInterview.name || "Candidate"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-outline uppercase">Interviewer</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F0F3FF] text-[#111C2D] flex items-center justify-center font-bold text-sm">
                  {(activeInterview.recruiter?.name || activeInterview.interviewerName || "I").substring(0, 1).toUpperCase()}
                </div>
                <p className="text-base text-[#111C2D] font-medium">
                  {activeInterview.recruiter?.name || activeInterview.interviewerName || "Interviewer"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowDetailsModal(true)}
              className="mt-2 w-full py-2 px-4 border border-primary text-primary font-medium text-sm rounded-lg hover:bg-primary/5 transition-colors"
            >
              View Details
            </button>
          </div>

          {/* Readiness Checklist */}
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

          {/* Primary CTA Area */}
          <div className="mt-auto flex flex-col gap-3">
            <button
              className="w-full bg-primary text-white font-medium text-sm py-4 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,74,198,0.2)] hover:bg-[#0053DB] hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onJoin}
              disabled={!((micOn ? micWorking : true) && (videoOn ? cameraWorking : true) && networkWorking)}
            >
              <span>Join Interview</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <DeviceSettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        devices={devices}
        selectedAudioId={selectedAudioId}
        setSelectedAudioId={setSelectedAudioId}
        selectedVideoId={selectedVideoId}
        setSelectedVideoId={setSelectedVideoId}
      />
      
      <InterviewDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        activeInterview={activeInterview}
      />
    </>
  );
}
