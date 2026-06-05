import React, { useRef, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useMediaDevices } from "../hooks/useMediaDevices";
import DeviceSettingsModal from "./DeviceSettingsModal";
import InterviewDetailsModal from "./InterviewDetailsModal";

import { LobbyVideo } from "./InterviewLobby/LobbyVideo";
import { LobbyControls } from "./InterviewLobby/LobbyControls";
import { LobbyDetails } from "./InterviewLobby/LobbyDetails";
import { LobbySystemCheck } from "./InterviewLobby/LobbySystemCheck";

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
          <LobbyVideo
            videoRef={videoRef}
            isScreenSharing={isScreenSharing}
            cameraWorking={cameraWorking}
            micWorking={micWorking}
            user={user}
          />

          <LobbyControls
            micOn={micOn} setMicOn={setMicOn}
            videoOn={videoOn} setVideoOn={setVideoOn}
            isScreenSharing={isScreenSharing} toggleScreenShare={toggleScreenShare}
            onLeave={onLeave}
            setShowSettingsModal={setShowSettingsModal}
          />
        </div>

        {/* Right Column: Details & Checklist */}
        <div className="w-full xl:w-96 flex flex-col gap-6 shrink-0">
          <LobbyDetails
            activeInterview={activeInterview}
            initials={initials}
            setShowDetailsModal={setShowDetailsModal}
          />

          <LobbySystemCheck
            micWorking={micWorking}
            cameraWorking={cameraWorking}
            networkWorking={networkWorking}
          />

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
