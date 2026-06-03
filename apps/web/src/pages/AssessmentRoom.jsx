import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, LogOut, Clock, Terminal, Code, Shield, FileText, TestTube, ChevronDown, AlertTriangle, CheckCircle2, Send, Cloud, RotateCcw, CheckCircle, Circle, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { applicationService } from "../services/api";

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
        toast.error("Failed to load session");
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
          
          if (st === "COMPLETED" || st === "FAILED") {
            clearInterval(poll);
            setIsRunning(false);
            
            const results = statusRes.submission.testResults || [];
            const passed = results.filter(r => r.passed).length;
            const total = results.length;
            
            if (st === "COMPLETED") {
              setOutput(`Execution Completed (${statusRes.submission.executionTimeMs}ms)\nPassed: ${passed}/${total} test cases`);
              if (passed === total) toast.success("All test cases passed!");
              else toast.warning(`${passed}/${total} test cases passed.`);
            } else {
              setOutput(`Execution Failed\n${results[0]?.error || "Some test cases failed."}`);
              toast.error("Code execution failed.");
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
      await applicationService.finalSubmit(sessionId, { mcqDurationSeconds: mcqTime, codingDurationSeconds: codingTime });
      toast.success("Assessment submitted!");
      setTimeout(() => navigate("/candidate"), 1500);
    } catch (err) {
      toast.error(`Submit failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      </div>
    );
  }

  const activeCodingQ = sessionData?.assessment?.codingQuestions?.[activeCodingIndex];

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden font-sans antialiased">
      {/* Top Header */}
      <header className="flex-shrink-0 bg-white border-b border-outline-variant flex justify-between items-center px-6 h-16 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-title-lg font-bold text-primary">Technical Assessment</h1>
          <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-label-sm rounded-full border border-outline-variant/50">
            {activePhase === 'mcq' ? 'Phase 1: Multiple Choice' : 'Phase 2: Coding Challenge'}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <Cloud size={16} />
            <span>Saved just now</span>
          </div>
          
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-mono font-bold tracking-wider">
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Exit
            </button>
            {activePhase === 'mcq' && sessionData?.assessment?.codingQuestions?.length > 0 ? (
               <button onClick={() => setActivePhase('coding')} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                 Proceed to Coding <ArrowRight size={16}/>
               </button>
            ) : (
               <button onClick={() => {
                 if (window.confirm("Are you sure you want to final submit?")) handleSubmit();
               }} className="px-4 py-2 bg-[#059669] text-white rounded-lg text-sm font-semibold hover:bg-[#047857] transition-colors">
                 Submit Assessment
               </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden bg-surface-container-lowest">
        
        {activePhase === 'mcq' && (
           <div className="w-full max-w-4xl mx-auto p-8 overflow-y-auto">
              <h2 className="text-2xl font-bold text-on-surface mb-6">Multiple Choice Questions</h2>
              <div className="space-y-6 pb-20">
                 {sessionData.assessment.mcqQuestions.map((q, idx) => (
                    <div key={q.id} className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-sm">
                       <div className="flex justify-between items-start mb-4">
                         <h3 className="text-lg font-bold text-on-surface flex gap-3">
                           <span className="text-primary">{idx + 1}.</span> 
                           {q.prompt}
                         </h3>
                         <span className="px-2 py-1 bg-surface-container text-xs font-semibold rounded text-on-surface-variant shrink-0">{q.points} pts</span>
                       </div>
                       <div className="space-y-3 pl-7">
                         {q.options.map((opt, oIdx) => (
                            <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${mcqAnswers[q.id] === oIdx ? 'border-primary bg-primary/5' : 'border-outline-variant/60 hover:bg-surface-container-low'}`}>
                               <input type="radio" name={q.id} checked={mcqAnswers[q.id] === oIdx} onChange={() => handleMcqSelect(q.id, oIdx)} className="w-4 h-4 text-primary" />
                               <span className="text-sm font-medium text-on-surface">{opt}</span>
                            </label>
                         ))}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activePhase === 'coding' && activeCodingQ && (
          <>
            {/* Left Panel: Problem Statement */}
            <aside className="w-1/3 min-w-[400px] max-w-[600px] bg-white border-r border-outline-variant flex flex-col overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-headline-md font-bold text-on-surface">{activeCodingQ.title}</h2>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-label-sm font-bold">
                    {activeCodingQ.points} pts
                  </span>
                </div>
                
                <div className="flex gap-2 mb-6 border-b border-outline-variant pb-6">
                  <span className="px-2 py-1 bg-surface-container border border-outline-variant rounded text-xs font-semibold text-on-surface-variant capitalize">
                    {activeCodingQ.language}
                  </span>
                </div>

                <div className="prose prose-sm max-w-none text-on-surface-variant space-y-4 whitespace-pre-wrap">
                  {activeCodingQ.statement}
                </div>
              </div>
            </aside>

            {/* Right Panel: Code Editor and Tests */}
            <section className="flex-1 flex flex-col bg-[#1e1e1e]">
              {/* Editor Toolbar */}
              <div className="h-12 flex justify-between items-center px-4 border-b border-[#333]">
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#2d2d2d] border border-[#444] rounded text-sm text-white hover:bg-[#333] transition-colors"
                    onClick={() => setShowLangDropdown(!showLangDropdown)}
                  >
                    <Code size={14} className="text-gray-400" />
                    <span>{currentLanguage.label}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {showLangDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-[#2d2d2d] border border-[#444] rounded shadow-lg z-50">
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <button
                          key={lang.id}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3d3d3d] ${language === lang.id ? 'text-white font-bold' : 'text-gray-300'}`}
                          onClick={() => { setLanguage(lang.id); setShowLangDropdown(false); }}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <RotateCcw size={14} />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Play size={14} className="fill-current" />
                    {isRunning ? "Running..." : "Run Code"}
                  </button>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 relative flex">
                <div className="w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-end py-4 pr-3 text-gray-600 font-mono text-sm select-none">
                  {Array.from({ length: 25 }).map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <textarea
                  className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm text-[#d4d4d4] resize-none p-4 leading-relaxed outline-none"
                  spellCheck={false}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ tabSize: 4 }}
                />
              </div>

              {/* Bottom Panel: Tests & Results */}
              <div className="h-64 bg-white border-t border-outline-variant flex flex-col">
                <div className="flex border-b border-outline-variant">
                  <button
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeBottomTab === 'testcases' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                    onClick={() => setActiveBottomTab('testcases')}
                  >
                    <TestTube size={16} />
                    Test Cases
                  </button>
                  <button
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeBottomTab === 'results' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                    onClick={() => setActiveBottomTab('results')}
                  >
                    <Terminal size={16} />
                    Execution Results
                  </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto bg-surface-container-lowest">
                  {activeBottomTab === 'testcases' ? (
                    <div className="space-y-4">
                      {activeCodingQ.testCases?.length > 0 ? (
                        <>
                          <div className="flex gap-4">
                            {activeCodingQ.testCases.map((tc, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveTestCase(idx)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${activeTestCase === idx ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                              >
                                {activeTestCase === idx ? <CheckCircle size={16} className="text-primary" /> : <Circle size={16} />}
                                Case {idx + 1}
                              </button>
                            ))}
                          </div>
                          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 font-mono text-sm">
                            <div className="text-on-surface-variant mb-2">Input:</div>
                            <div className="bg-white p-3 rounded border border-outline-variant/50 text-on-surface mb-4">
                              {activeCodingQ.testCases[activeTestCase]?.input || "None"}
                            </div>
                            <div className="text-on-surface-variant mb-2">Expected Output:</div>
                            <div className="bg-white p-3 rounded border border-outline-variant/50 text-on-surface">
                              {activeCodingQ.testCases[activeTestCase]?.expectedOutput || "None"}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-on-surface-variant">No test cases available.</div>
                      )}
                    </div>
                  ) : (
                    <div className="font-mono text-sm h-full">
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
            </section>
          </>
        )}
      </main>

      {/* Proctoring Footer */}
      <footer className="h-10 bg-[#252836] flex items-center justify-between px-4 text-xs font-semibold text-gray-400 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Shield size={14} className="text-primary-fixed" />
            <span>Proctoring Active</span>
          </div>
        </div>
        <div>Session ID: {sessionId}</div>
      </footer>

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
