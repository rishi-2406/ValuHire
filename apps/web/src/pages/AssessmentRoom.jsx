import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Circle, Clock, Code, Play, RotateCcw, TestTube, Terminal, ChevronDown, LogOut, Cloud, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { applicationService } from "../services/api";
import AssessmentMcq from "../components/AssessmentMcq";
import AssessmentCoding from "../components/AssessmentCoding";

const LANGUAGE_OPTIONS = [
  { id: "python", label: "Python 3", file: "main.py" },
  { id: "javascript", label: "JavaScript", file: "main.js" },
  { id: "java", label: "Java", file: "Main.java" },
  { id: "cpp", label: "C++", file: "main.cpp" },
];

export default function AssessmentRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activePhase, setActivePhase] = useState("loading"); // mcq | coding
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [activeMcqIndex, setActiveMcqIndex] = useState(0);
  const [activeCodingIndex, setActiveCodingIndex] = useState(0);

  const [activeBottomTab, setActiveBottomTab] = useState("testcases");
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [language, setLanguage] = useState("python");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [code, setCode] = useState("");
  
  const [mcqTime, setMcqTime] = useState(0);
  const [codingTime, setCodingTime] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    applicationService.getSessionDetails(sessionId)
      .then((data) => {
        const session = data.session || data;
        setSessionData(session);
        if (session.timeLeft) setTimeLeft(session.timeLeft);
        
        const hasMcq = session.assessment?.mcqQuestions?.length > 0;
        const hasCoding = session.assessment?.codingQuestions?.length > 0;
        
        if (hasMcq) setActivePhase("mcq");
        else if (hasCoding) setActivePhase("coding");
        else setActivePhase("done");

        if (hasCoding && session.assessment.codingQuestions[0]) {
          setCode(session.assessment.codingQuestions[0].statement || "# Write your code here");
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load session");
        navigate("/candidate");
      })
      .finally(() => setLoading(false));
  }, [sessionId, toast, navigate]);

  useEffect(() => {
    if (!sessionId || loading || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
      if (activePhase === "mcq") setMcqTime(p => p + 1);
      if (activePhase === "coding") setCodingTime(p => p + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId, loading, timeLeft, activePhase]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, "0") + ':' : ''}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMcqSelect = async (questionId, optionIndex) => {
    setMcqAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    try {
      await applicationService.submitMcqAnswer(sessionId, questionId, optionIndex.toString());
    } catch (err) {
      toast.error("Failed to save answer");
    }
  };

  const currentLanguage = LANGUAGE_OPTIONS.find((l) => l.id === language) || LANGUAGE_OPTIONS[0];
  const activeCodingQ = sessionData?.assessment?.codingQuestions?.[activeCodingIndex];

  const handleRunCode = useCallback(async () => {
    if (!activeCodingQ) return;
    setIsRunning(true);
    setActiveBottomTab("results");
    setOutput("Executing code...");

    try {
      const res = await applicationService.executeCode(sessionId, activeCodingQ.id, code, language);
      let subId = res.submission.id;
      
      const poll = setInterval(async () => {
        try {
          const statusRes = await applicationService.getSubmissionStatus(subId);
          const st = statusRes.submission.status;
          
          if (st !== "QUEUED" && st !== "RUNNING") {
            clearInterval(poll);
            setIsRunning(false);
            
            const results = statusRes.submission.testResults || [];
            const passed = results.filter(r => r.passed).length;
            const total = results.length;
            
            if (st === "PASSED" || st === "FAILED") {
              setOutput(`Execution Completed (${statusRes.submission.executionTimeMs || 0}ms)\nPassed: ${passed}/${total} test cases`);
              if (passed === total) toast.success("All test cases passed!");
              else toast.warning(`${passed}/${total} test cases passed.`);
            } else {
              const errDetails = results[0]?.stderr || results[0]?.error || "Code execution encountered an error.";
              setOutput(`Execution Status: ${st}\n${errDetails}`);
              toast.error(`Execution failed: ${st}`);
            }
          }
        } catch (err) {
          clearInterval(poll);
          setIsRunning(false);
          setOutput(`Error checking status: ${err.message}`);
        }
      }, 2000);
    } catch (err) {
      setIsRunning(false);
      setOutput(`Error: ${err.message}`);
      toast.error("Failed to execute code");
    }
  }, [sessionId, activeCodingQ, code, language, toast]);

  const handleSubmit = async () => {
    try {
      await applicationService.finalSubmit(sessionId, { mcqElapsed: mcqTime, codingElapsed: codingTime });
      toast.success("Assessment submitted!");
      setTimeout(() => navigate("/candidate"), 1500);
    } catch (err) {
      toast.error(`Submit failed: ${err.message}`);
    }
  };

  const handleExit = () => {
    navigate("/candidate");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
      <header className="flex-shrink-0 bg-white border-b border-outline-variant flex justify-between items-center px-6 h-16 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-title-lg font-bold text-primary">Technical Assessment</h1>
          <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-label-sm rounded-full border border-outline-variant/50">
            {activePhase === 'mcq' ? 'Phase 1: MCQ' : 'Phase 2: Coding'}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <Cloud size={16} />
            <span>Saved just now</span>
          </div>
          
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-mono font-bold tracking-wider">
            <Clock size={18} />
            {formatTime(displayTime)}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Exit
            </button>
            {activePhase === 'coding' || (!sessionData?.assessment?.codingQuestions?.length) ? (
               <button onClick={() => {
                 if (window.confirm("Are you sure you want to final submit?")) handleSubmit();
               }} className="px-6 py-2 bg-[#059669] text-white rounded-lg text-sm font-semibold hover:bg-[#047857] shadow-sm transition-colors">
                 Submit Assessment
               </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-40 w-5 h-16 bg-white border border-outline-variant rounded-r-lg flex items-center justify-center hover:bg-surface-container transition-all shadow-sm ${isSidebarOpen ? 'left-[300px]' : 'left-0'}`}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <aside className={`${isSidebarOpen ? 'w-[300px] border-r' : 'w-0 border-r-0 opacity-0 overflow-hidden'} transition-all duration-300 bg-surface-container-lowest border-outline-variant flex flex-col py-6 shrink-0 z-30`}>
          <div className="px-6 pb-4 mb-2 border-b border-outline-variant/30 whitespace-nowrap">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-1">
              {activePhase === 'mcq' ? "MCQ Navigation" : "Coding Challenges"}
            </h3>
            <p className="font-label-md text-label-md text-on-surface-variant">
              {activePhase === 'mcq' ? sessionData.assessment.mcqQuestions?.length : sessionData.assessment.codingQuestions?.length} Questions Total
            </p>
          </div>
          
          <nav className="flex flex-col flex-1 px-3 space-y-1">
            {activePhase === 'mcq' && sessionData.assessment.mcqQuestions?.map((q, idx) => {
              const isAttempted = mcqAnswers[q.id] !== undefined;
              const isActive = activeMcqIndex === idx;
              return (
                <button 
                  key={q.id}
                  onClick={() => setActiveMcqIndex(idx)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between rounded-lg transition-all ${isActive ? 'bg-primary-container/10 border-l-4 border-primary' : 'hover:bg-surface-container border-l-4 border-transparent'}`}
                >
                  <span className={`font-label-md text-label-md ${isActive ? 'font-bold text-primary' : 'text-on-surface-variant'}`}>
                    Question {idx + 1}
                  </span>
                  {isAttempted ? (
                    <CheckCircle className="text-[#059669]" size={18} />
                  ) : (
                    <Circle className="text-outline-variant" size={18} />
                  )}
                </button>
              );
            })}

            {activePhase === 'coding' && sessionData.assessment.codingQuestions?.map((q, idx) => {
              const isActive = activeCodingIndex === idx;
              return (
                <button 
                  key={q.id}
                  onClick={() => {
                    setActiveCodingIndex(idx);
                    setCode(q.statement || "# Write your code here");
                    setOutput("");
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between rounded-lg transition-all ${isActive ? 'bg-primary-container/10 border-l-4 border-primary' : 'hover:bg-surface-container border-l-4 border-transparent'}`}
                >
                  <span className={`font-label-md text-label-md ${isActive ? 'font-bold text-primary' : 'text-on-surface-variant'}`}>
                    Problem {idx + 1}
                  </span>
                </button>
              );
            })}
          </nav>
          
          {activePhase === 'mcq' && sessionData.assessment.codingQuestions?.length > 0 && (
            <div className="px-6 mt-4 pt-4 border-t border-outline-variant/30 whitespace-nowrap">
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to submit MCQs? You cannot return to this phase.")) {
                    setActivePhase('coding');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-semibold shadow-sm hover:opacity-90 transition-opacity"
              >
                Submit MCQs
                <Terminal size={18} />
              </button>
            </div>
          )}
        </aside>

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
    </div>
  );
}
