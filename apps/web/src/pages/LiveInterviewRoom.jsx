import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import InterviewFeedbackModal from "../components/common/InterviewFeedbackModal";
import InterviewHeader from "../components/LiveInterviewRoom/InterviewHeader";
import MediaPane from "../components/LiveInterviewRoom/MediaPane";
import ProblemNotesPane from "../components/LiveInterviewRoom/ProblemNotesPane";
import CodeEditorPane from "../components/LiveInterviewRoom/CodeEditorPane";
import { useInterviewRoom } from "../components/LiveInterviewRoom/useInterviewRoom";

const LANGUAGE_OPTIONS = [
  { id: "python", label: "Python 3" },
  { id: "javascript", label: "JavaScript" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

export default function LiveInterviewRoom() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const isRecruiter = user?.role === "RECRUITER" || user?.role === "ADMIN";

  const {
    loading, interviewData, campaign, code, language, questionText,
    showLangDropdown, setShowLangDropdown, micOn, setMicOn, videoOn, setVideoOn,
    interviewerNotes, setInterviewerNotes, activeLeftTab, setActiveLeftTab,
    remoteVideoOn, remoteMicOn, remoteIsScreenSharing, remoteUserJoined, showFeedbackModal, setShowFeedbackModal,
    isRunning, output, leftWidth, setLeftWidth, isDragging,
    stream, displayStream, remoteCameraStream, remoteScreenStream,
    localVideoRef, localScreenRef, remoteVideoRef, remoteScreenRef, remoteAudioRef, expandedVideoRef,
    isScreenSharing, toggleScreenShare, handleCodeChange, handleQuestionChange,
    handleLanguageChange, handleRunCode, handleEndInterview, handleFeedbackSubmit,
    expandedView, setExpandedView, miniScreenPreference, setMiniScreenPreference
  } = useInterviewRoom(sessionId, user, isRecruiter);

  if (loading) {
    return (
      <div className="h-screen bg-surface flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentLanguage = LANGUAGE_OPTIONS.find((l) => l.id === language) || LANGUAGE_OPTIONS[0];

  return (
    <div className="h-screen w-full flex flex-col bg-background font-sans overflow-hidden">
      
      <InterviewHeader
        isRecruiter={isRecruiter}
        interviewData={interviewData}
        micOn={micOn}
        setMicOn={setMicOn}
        videoOn={videoOn}
        setVideoOn={setVideoOn}
        isScreenSharing={isScreenSharing}
        toggleScreenShare={toggleScreenShare}
        handleEndInterview={handleEndInterview}
      />

      {/* Hidden audio element to ensure remote mic plays even if remote video is unmounted */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Main Content Split: Left (Problem + Cameras) | Right (Code or Expanded Screen) */}
      <div 
        className="flex-1 flex overflow-hidden min-h-0" 
        style={{ cursor: isDragging.current ? 'col-resize' : 'auto' }}
      >
        
        {/* Left Side: Cameras and Problem Statement */}
        <div 
          className="flex flex-col bg-[#F8FAFC] shrink-0"
          style={{ width: leftWidth }}
        >
          <MediaPane
            stream={stream}
            displayStream={displayStream}
            videoOn={videoOn}
            micOn={micOn}
            isScreenSharing={isScreenSharing}
            localVideoRef={localVideoRef}
            localScreenRef={localScreenRef}
            remoteCameraStream={remoteCameraStream}
            remoteScreenStream={remoteScreenStream}
            remoteVideoOn={remoteVideoOn}
            remoteMicOn={remoteMicOn}
            remoteIsScreenSharing={remoteIsScreenSharing}
            remoteVideoRef={remoteVideoRef}
            remoteScreenRef={remoteScreenRef}
            remoteUserJoined={remoteUserJoined}
            isRecruiter={isRecruiter}
            interviewData={interviewData}
            expandedView={expandedView}
            setExpandedView={setExpandedView}
            miniScreenPreference={miniScreenPreference}
            setMiniScreenPreference={setMiniScreenPreference}
          />

          <ProblemNotesPane
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
            isRecruiter={isRecruiter}
            campaign={campaign}
            handleQuestionChange={handleQuestionChange}
            questionText={questionText}
            interviewerNotes={interviewerNotes}
            setInterviewerNotes={setInterviewerNotes}
          />
        </div>

        {/* Resize Handle */}
        <div 
          className="w-1.5 bg-outline-variant/50 hover:bg-primary/50 active:bg-primary cursor-col-resize shrink-0 z-10 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            isDragging.current = true;
          }}
        />

        {expandedView !== "none" ? (
          <div className="flex-1 bg-black relative min-w-0">
            <video
              ref={expandedVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-contain ${expandedView === "local-screen" ? "" : ""}`}
            />
            <button
              onClick={() => setExpandedView("none")}
              className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black transition-colors z-50"
              title="Close Screenshare"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-md z-50">
              {expandedView === "local-screen" ? "Your Screen" : `${isRecruiter ? interviewData?.candidate?.name || "Candidate" : interviewData?.recruiter?.name || "Interviewer"}'s Screen`}
            </div>
          </div>
        ) : (
          <CodeEditorPane
            LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
            currentLanguage={currentLanguage}
            showLangDropdown={showLangDropdown}
            setShowLangDropdown={setShowLangDropdown}
            language={language}
            handleLanguageChange={handleLanguageChange}
            isRunning={isRunning}
            handleRunCode={handleRunCode}
            code={code}
            handleCodeChange={handleCodeChange}
            output={output}
          />
        )}
      </div>

      <InterviewFeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        candidateName={interviewData?.candidateName || interviewData?.name || "the candidate"}
        initialNotes={interviewerNotes}
      />
    </div>
  );
}
