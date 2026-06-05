import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import InterviewFeedbackModal from "../components/InterviewFeedbackModal";
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
    remoteVideoOn, remoteMicOn, remoteUserJoined, showFeedbackModal, setShowFeedbackModal,
    isRunning, output, leftWidth, isDragging,
    activeLocalStream, remoteStream, localVideoRef, remoteVideoRef, remoteAudioRef,
    isScreenSharing, toggleScreenShare, handleCodeChange, handleQuestionChange,
    handleLanguageChange, handleRunCode, handleEndInterview, handleFeedbackSubmit
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

      {/* Main Content Split: Left (Problem + Cameras) | Right (Code) */}
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
            activeLocalStream={activeLocalStream}
            videoOn={videoOn}
            isScreenSharing={isScreenSharing}
            localVideoRef={localVideoRef}
            micOn={micOn}
            remoteStream={remoteStream}
            remoteVideoOn={remoteVideoOn}
            remoteVideoRef={remoteVideoRef}
            remoteUserJoined={remoteUserJoined}
            isRecruiter={isRecruiter}
            interviewData={interviewData}
            remoteMicOn={remoteMicOn}
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
