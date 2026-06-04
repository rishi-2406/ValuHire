import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Circle, Clock, Code, Play, RotateCcw, TestTube, Terminal, ChevronDown, LogOut, Cloud, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { applicationService } from "../services/api";
import { Editor } from "@monaco-editor/react";

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
             <div className="w-full max-w-[800px] mx-auto p-12 overflow-y-auto">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden mb-8">
                   <div className="p-8">
                     <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                         <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-semibold">Multiple Choice</span>
                       </div>
                       <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold">
                         {sessionData.assessment.mcqQuestions[activeMcqIndex].points} pts
                       </span>
                     </div>
                     <h1 className="text-2xl font-bold text-on-surface mb-6 leading-snug">
                       {sessionData.assessment.mcqQuestions[activeMcqIndex].prompt}
                     </h1>
                     <div className="space-y-3">
                       {sessionData.assessment.mcqQuestions[activeMcqIndex].options.map((opt, oIdx) => {
                          const qId = sessionData.assessment.mcqQuestions[activeMcqIndex].id;
                          const isSelected = mcqAnswers[qId] === oIdx;
                          return (
                            <label key={oIdx} className={`group flex items-center p-4 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary-container/5 border-2' : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'}`}>
                               <input type="radio" name={qId} checked={isSelected} onChange={() => handleMcqSelect(qId, oIdx)} className="w-5 h-5 text-primary focus:ring-primary" />
                               <span className={`ml-4 text-base ${isSelected ? 'text-primary font-semibold' : 'text-on-surface'}`}>{opt}</span>
                               {isSelected && <CheckCircle className="ml-auto text-primary" size={20} />}
                            </label>
                          )
                       })}
                     </div>
                   </div>
                   
                   <div className="px-8 py-4 bg-surface-container-lowest border-t border-outline-variant flex justify-between items-center">
                     <button 
                       disabled={activeMcqIndex === 0}
                       onClick={() => setActiveMcqIndex(p => p - 1)}
                       className="flex items-center gap-2 text-on-surface-variant font-medium hover:text-primary transition-colors disabled:opacity-50 disabled:hover:text-on-surface-variant"
                     >
                       Previous
                     </button>
                     <div className="text-sm font-medium text-on-surface-variant">
                       {activeMcqIndex + 1} of {sessionData.assessment.mcqQuestions.length}
                     </div>
                     <button 
                       disabled={activeMcqIndex === sessionData.assessment.mcqQuestions.length - 1}
                       onClick={() => setActiveMcqIndex(p => p + 1)}
                       className="flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                     >
                       Next
                     </button>
                   </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-surface-container-low rounded-lg border border-primary/10 mb-20">
                  <Shield size={20} className="text-primary mt-0.5" />
                  <p className="text-sm text-on-surface-variant">
                    <strong>Note:</strong> Your progress is automatically saved. Make sure to attempt all questions before proceeding.
                  </p>
                </div>
             </div>
          )}

          {activePhase === 'coding' && activeCodingQ && (
          <div className="flex-1 flex flex-row w-full h-full overflow-hidden">
            <aside className="w-1/3 min-w-[350px] max-w-[500px] flex flex-col bg-surface-container-lowest border-r border-outline-variant h-full overflow-y-auto">
              <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2 border-b border-outline-variant pb-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-headline-md font-bold text-on-surface">{activeCodingQ.title}</h2>
                    <span className="bg-surface-container px-2 py-1 rounded text-label-sm font-semibold text-primary">{activeCodingQ.points} pts</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-surface-container text-on-surface-variant text-label-sm font-semibold border border-outline-variant rounded capitalize">
                      {activeCodingQ.language}
                    </span>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-on-surface-variant space-y-4 whitespace-pre-wrap">
                  {activeCodingQ.statement}
                </div>
              </div>
            </aside>

            {/* Right Panel: Code Editor and Tests */}
            <section className="flex-1 flex flex-col bg-editor-bg border-r border-editor-outline h-full overflow-hidden">
              {/* IDE Header Bar */}
              <div className="flex justify-between items-center bg-editor-surface border-b border-editor-outline px-4 py-2">
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-editor-bg border border-editor-outline px-3 py-1 rounded text-editor-text text-sm cursor-pointer hover:bg-editor-outline transition-colors"
                    onClick={() => setShowLangDropdown(!showLangDropdown)}
                  >
                    <Code size={16} />
                    <span>{currentLanguage.label}</span>
                    <ChevronDown size={16} />
                  </button>
                  {showLangDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-[#252526] border border-editor-outline rounded shadow-2xl z-[9999]">
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <button
                          key={lang.id}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3c3c3c] ${language === lang.id ? 'text-white font-bold' : 'text-[#d4d4d4]'}`}
                          onClick={() => { setLanguage(lang.id); setShowLangDropdown(false); }}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    className="flex items-center gap-1 text-editor-text hover:text-white px-3 py-1 rounded transition-colors text-sm"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to reset your code? All your progress will be lost and restored to the initial problem statement.")) {
                        setCode(activeCodingQ.statement || "");
                      }
                    }}
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex items-center gap-1 bg-primary text-on-primary hover:bg-primary/90 px-4 py-1 rounded transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    <Play size={16} className="fill-current" />
                    {isRunning ? "Running..." : "Run Code"}
                  </button>
                </div>
              </div>

              {/* Editor and Console Stack */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Editor Area */}
                <div className="flex-1 relative w-full min-h-[300px] z-0">
                  <Editor
                    height="100%"
                    defaultLanguage={language === "javascript" ? "javascript" : language === "python" ? "python" : language === "cpp" ? "cpp" : "java"}
                    language={language === "javascript" ? "javascript" : language === "python" ? "python" : language === "cpp" ? "cpp" : "java"}
                    value={code}
                    theme="vs-dark"
                    onChange={(val) => setCode(val || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      tabSize: 4,
                      wordWrap: "on",
                      padding: { top: 16 },
                      quickSuggestions: true,
                      suggestOnTriggerCharacters: true,
                      wordBasedSuggestions: "allDocuments",
                      parameterHints: { enabled: true },
                      snippetSuggestions: "inline"
                    }}
                    beforeMount={(monaco) => {
                      // Enable basic TS/JS completion
                      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                        noSemanticValidation: true,
                        noSyntaxValidation: false,
                      });
                      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                        target: monaco.languages.typescript.ScriptTarget.ES6,
                        allowNonTsExtensions: true,
                      });
                    }}
                  />
                </div>

                {/* Bottom Docked Console Panel */}
                <div className="h-[280px] bg-surface-container-lowest border-t border-editor-outline flex flex-col">
                  {/* Tabs */}
                  <div className="flex border-b border-outline-variant bg-surface-container-low">
                    <button
                      className={`px-6 py-2 text-sm flex items-center justify-center gap-2 font-bold ${activeBottomTab === 'testcases' ? 'text-primary border-b-2 border-primary bg-surface-container' : 'text-on-surface-variant hover:bg-surface-container-low transition-colors'}`}
                      onClick={() => setActiveBottomTab('testcases')}
                    >
                      <TestTube size={18} />
                      Test Cases
                    </button>
                    <button
                      className={`px-6 py-2 text-sm flex items-center justify-center gap-2 font-bold ${activeBottomTab === 'results' ? 'text-primary border-b-2 border-primary bg-surface-container' : 'text-on-surface-variant hover:bg-surface-container-low transition-colors'}`}
                      onClick={() => setActiveBottomTab('results')}
                    >
                      <Terminal size={18} />
                      Execution Results
                    </button>
                  </div>
                  
                  {/* Console Content */}
                  <div className={`flex-1 overflow-y-auto p-4 flex ${activeBottomTab === 'testcases' ? 'flex-row gap-4' : 'flex-col'} bg-surface scrollbar-hide`}>
                    {activeBottomTab === 'testcases' ? (
                      activeCodingQ.testCases?.length > 0 ? (
                        activeCodingQ.testCases.map((tc, idx) => (
                          <div key={idx} className="min-w-[300px] max-w-[350px] bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm h-fit shrink-0">
                            <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold text-sm ${activeTestCase === idx ? 'text-primary' : 'text-on-surface'}`}>Case {idx + 1}</span>
                              </div>
                            </div>
                            <div className="p-4 flex flex-col gap-3 font-mono text-sm">
                              <div>
                                <div className="text-on-surface-variant mb-1">Input:</div>
                                <div className="bg-surface-container p-2 rounded border border-outline-variant/50 text-on-surface break-all italic text-[12px]">
                                  {tc.input || "None"}
                                </div>
                              </div>
                              <div>
                                <div className="text-on-surface-variant mb-1">Expected Output:</div>
                                <div className="bg-surface-container p-2 rounded border border-outline-variant/50 text-on-surface break-all italic text-[12px]">
                                  {tc.expectedOutput || "None"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-on-surface-variant w-full text-center mt-8">No test cases available.</div>
                      )
                    ) : (
                      <div className="font-mono text-sm h-full w-full">
                        {output ? (
                          <pre className="text-on-surface whitespace-pre-wrap">{output}</pre>
                        ) : (
                          <div className="text-on-surface-variant flex items-center justify-center h-full italic">
                            Run your code to see execution results here.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
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
