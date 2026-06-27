import { useParams, useNavigate } from "react-router-dom";
import { LogOut, ChevronLeft, ChevronRight, Maximize } from "lucide-react";
import AssessmentMcq from "../components/AssessmentRoom/AssessmentMcq";
import AssessmentCoding from "../components/AssessmentCoding";
import { useAssessmentRoom } from "../hooks/useAssessmentRoom";
import { AssessmentRoomHeader } from "../components/AssessmentRoom/AssessmentRoomHeader";
import { AssessmentRoomSidebar } from "../components/AssessmentRoom/AssessmentRoomSidebar";
import { useProctoring } from "../hooks/useProctoring";

export default function AssessmentRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const {
    sessionData, loading, activePhase, setActivePhase, mcqAnswers,
    activeMcqIndex, setActiveMcqIndex, activeCodingIndex, setActiveCodingIndex,
    activeBottomTab, setActiveBottomTab, activeTestCase, setActiveTestCase,
    language, setLanguage, showLangDropdown, setShowLangDropdown,
    timeLeft, output, setOutput, isRunning,
    showExitConfirm, setShowExitConfirm, code, setCode, mcqTime, codingTime,
    isSidebarOpen, setIsSidebarOpen,
    handleMcqSelect, handleRunCode, handleSubmit, handleExit,
    LANGUAGE_OPTIONS, activeCodingQ,
    showMcqSubmitConfirm, setShowMcqSubmitConfirm,
    showFinalSubmitConfirm, setShowFinalSubmitConfirm,
    isSubmitting
  } = useAssessmentRoom(sessionId, navigate);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, "0") + ':' : ''}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isProctoringActive = (activePhase === 'mcq' || activePhase === 'coding') && !isSubmitting;
  const { isFullscreen, requestFullscreen, violationsCount, MAX_VIOLATIONS } = useProctoring(sessionId, isProctoringActive, handleSubmit);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      </div>
    );
  }

  if (isProctoringActive && !isFullscreen) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-surface font-sans antialiased text-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-outline-variant/50">
          <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center mx-auto mb-6">
            <Maximize size={32} />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-4">Fullscreen Required</h2>
          <p className="text-on-surface-variant mb-6 text-sm">
            This is a proctored assessment. You must remain in fullscreen mode. 
            Exiting fullscreen, switching tabs, or losing focus will be recorded as a violation.
          </p>
          {violationsCount > 0 && (
            <p className="text-error-coral font-semibold mb-6">
              Violations: {violationsCount} / {MAX_VIOLATIONS}
            </p>
          )}
          <button 
            onClick={requestFullscreen}
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Maximize size={18} />
            Enter Fullscreen to Continue
          </button>
        </div>
      </div>
    );
  }

  const mcqDuration = sessionData?.assessment?.mcqDurationMinutes ? sessionData.assessment.mcqDurationMinutes * 60 : 0;
  const codingDuration = sessionData?.assessment?.codingDurationMinutes ? sessionData.assessment.codingDurationMinutes * 60 : 0;
  
  let displayTime = timeLeft;
  if (activePhase === 'mcq' && mcqDuration) displayTime = Math.max(0, mcqDuration - mcqTime);
  else if (activePhase === 'coding' && codingDuration) displayTime = Math.max(0, codingDuration - codingTime);

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden font-sans antialiased">
      <AssessmentRoomHeader 
        activePhase={activePhase}
        formatTime={formatTime}
        displayTime={displayTime}
        setShowExitConfirm={setShowExitConfirm}
        sessionData={sessionData}
        handleSubmit={handleSubmit}
        setShowFinalSubmitConfirm={setShowFinalSubmitConfirm}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-40 w-5 h-16 bg-white border border-outline-variant rounded-r-lg flex items-center justify-center hover:bg-surface-container transition-all shadow-sm ${isSidebarOpen ? 'left-[300px]' : 'left-0'}`}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <AssessmentRoomSidebar 
          isSidebarOpen={isSidebarOpen}
          activePhase={activePhase}
          sessionData={sessionData}
          mcqAnswers={mcqAnswers}
          activeMcqIndex={activeMcqIndex}
          setActiveMcqIndex={setActiveMcqIndex}
          activeCodingIndex={activeCodingIndex}
          setActiveCodingIndex={setActiveCodingIndex}
          setCode={setCode}
          setOutput={setOutput}
          setActivePhase={setActivePhase}
          language={language}
          setShowMcqSubmitConfirm={setShowMcqSubmitConfirm}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-background relative min-h-full">
          {activePhase === 'mcq' && sessionData.assessment.mcqQuestions?.[activeMcqIndex] && (
            <AssessmentMcq
              sessionData={sessionData}
              activeMcqIndex={activeMcqIndex}
              setActiveMcqIndex={setActiveMcqIndex}
              mcqAnswers={mcqAnswers}
              handleMcqSelect={handleMcqSelect}
            />
          )}

          {activePhase === 'coding' && activeCodingQ && (
            <AssessmentCoding
              activeCodingQ={activeCodingQ}
              language={language}
              setLanguage={setLanguage}
              showLangDropdown={showLangDropdown}
              setShowLangDropdown={setShowLangDropdown}
              LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
              code={code}
              setCode={setCode}
              isRunning={isRunning}
              handleRunCode={handleRunCode}
              activeBottomTab={activeBottomTab}
              setActiveBottomTab={setActiveBottomTab}
              activeTestCase={activeTestCase}
              output={output}
            />
          )}
        </main>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm" onClick={() => setShowExitConfirm(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-title-lg font-bold text-on-surface mb-2">Exit assessment?</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              Your progress will be saved, but the session timer keeps running.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg" onClick={() => setShowExitConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="px-4 py-2 text-sm font-semibold bg-error-coral text-white rounded-lg flex items-center gap-2 hover:bg-error-coral/90" onClick={handleExit}>
                <LogOut size={16} />
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {showMcqSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm" onClick={() => setShowMcqSubmitConfirm(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-title-lg font-bold text-on-surface mb-2">Submit MCQs?</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              Are you sure you want to submit MCQs? You cannot return to this phase.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg" onClick={() => setShowMcqSubmitConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:opacity-90 transition-opacity" onClick={() => {
                setShowMcqSubmitConfirm(false);
                setActivePhase('coding');
              }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinalSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm" onClick={() => setShowFinalSubmitConfirm(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-title-lg font-bold text-on-surface mb-2">Submit Assessment?</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              Are you sure you want to final submit your assessment? You won't be able to make any changes after this.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg" onClick={() => setShowFinalSubmitConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="px-4 py-2 text-sm font-semibold bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors" onClick={() => {
                setShowFinalSubmitConfirm(false);
                handleSubmit();
              }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
