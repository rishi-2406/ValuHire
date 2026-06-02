import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, LogOut, Clock, Terminal, Code, Shield, FileText, TestTube, ChevronDown, AlertTriangle, CheckCircle2, Send, Cloud, RotateCcw, CheckCircle, Circle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { applicationService, submissionService } from "../services/api";
import { joinRoom, onRoomEvent, emitCodeChange, emitLanguageChange } from "../services/socket";

const LANGUAGE_OPTIONS = [
  { id: "python", label: "Python 3", file: "main.py" },
  { id: "javascript", label: "JavaScript", file: "main.js" },
  { id: "java", label: "Java", file: "Main.java" },
  { id: "cpp", label: "C++", file: "main.cpp" },
];

export default function AssessmentRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();
  
  const [activeBottomTab, setActiveBottomTab] = useState("testcases");
  const [activeTestCase, setActiveTestCase] = useState(1);
  const [language, setLanguage] = useState("python");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(1 * 3600 + 45 * 60 + 30); // 01:45:30
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [integrityFlags, setIntegrityFlags] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const lastCodeEmitRef = useRef("");
  const lastLangEmitRef = useRef("python");

  const [code, setCode] = useState(`class RateLimiter:
    def __init__(self):
        self.user_requests = {}
        self.lock = Lock()

    def is_allowed(self, user_id: str, limit: int, window: int) -> bool:
        with self.lock:
            current_time = time.time()
            # Implement the token bucket or sliding window logic here
            pass
`);

  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    applicationService.startSession(sessionId)
      .then((data) => {
        setSessionData(data.session || data);
        if (data.session?.timeLeft) setTimeLeft(data.session.timeLeft);
        if (data.session?.code) setCode(data.session.code);
      })
      .catch((err) => {
        console.error("Failed to start session:", err);
        // Silently continue for mockup
      })
      .finally(() => setLoading(false));
  }, [sessionId, toast]);

  useEffect(() => {
    if (!sessionId) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const sendEvent = (type, metadata = {}) => {
      applicationService.submitProctorEvent(sessionId, type, metadata).catch(() => {});
    };

    const onVisibility = () => {
      if (document.hidden) {
        sendEvent("TAB_HIDDEN", { timestamp: Date.now() });
        setIntegrityFlags((f) => f + 1);
        toast.warning("Tab switch logged", { title: "Integrity event" });
      } else {
        sendEvent("TAB_VISIBLE", { timestamp: Date.now() });
      }
    };
    const onBlur = () => {
      sendEvent("WINDOW_BLUR", { timestamp: Date.now() });
      setIntegrityFlags((f) => f + 1);
    };
    const onFocus = () => sendEvent("WINDOW_FOCUS", { timestamp: Date.now() });
    
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    sendEvent("SESSION_START");

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      sendEvent("SESSION_END");
    };
  }, [sessionId, toast]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentLanguage = LANGUAGE_OPTIONS.find((l) => l.id === language) || LANGUAGE_OPTIONS[0];

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setActiveBottomTab("results");
    setOutput("Running tests...");

    setTimeout(() => {
      setOutput("Success\\nAll test cases passed (15ms)\\nMemory: 14.2 MB");
      setIsRunning(false);
      toast.success("All test cases passed!");
    }, 1500);
  }, []);

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit? This action cannot be undone.")) return;
    try {
      await applicationService.finalSubmit(sessionId);
      toast.success("Assessment submitted!");
      setTimeout(() => navigate("/candidate"), 1500);
    } catch (err) {
      toast.error(`Submit failed: ${err.message}`);
    }
  };

  const handleExit = async () => {
    navigate("/candidate", { replace: true });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-md text-on-surface-variant">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden font-sans antialiased">
      {/* Top Header */}
      <header className="flex-shrink-0 bg-white border-b border-outline-variant flex justify-between items-center px-6 h-16 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-title-lg font-bold text-primary">Technical Assessment</h1>
          <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-label-sm rounded-full border border-outline-variant/50">
            Senior Backend Engineer
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
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Submit Assessment
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Problem Statement */}
        <aside className="w-1/3 min-w-[400px] max-w-[600px] bg-white border-r border-outline-variant flex flex-col overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-headline-md font-bold text-on-surface">Rate Limiter</h2>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-label-sm font-bold">
                40 pts
              </span>
            </div>
            
            <div className="flex gap-2 mb-6 border-b border-outline-variant pb-6">
              <span className="px-2 py-1 bg-error-coral/10 text-error-coral border border-error-coral/20 rounded text-xs font-semibold">
                Hard
              </span>
              <span className="px-2 py-1 bg-surface-container border border-outline-variant rounded text-xs font-semibold text-on-surface-variant">
                Data Structures
              </span>
            </div>

            <div className="prose prose-sm max-w-none text-on-surface-variant space-y-4">
              <p className="text-base text-on-surface">
                Design and implement a thread-safe rate limiter that restricts the number of requests a
                user can make within a specific time window. Your solution should handle burst traffic
                efficiently.
              </p>

              <h3 className="text-title-md font-bold text-on-surface mt-6 mb-3">Example 1:</h3>
              <div className="bg-[#f8f9fa] border border-outline-variant/50 rounded-xl p-4 font-mono text-sm text-on-surface">
                <div className="mb-2"><span className="font-bold">Input:</span> limit = 5, window = 60</div>
                <div className="mb-2"><span className="font-bold">Requests:</span> "u1" at t=0, "u1" at t=1, ...</div>
                <div className="mb-2"><span className="font-bold">Output:</span> [True, True, ...]</div>
                <div><span className="font-bold">Explanation:</span> First 5 requests are allowed, 6th is rejected.</div>
              </div>

              <h3 className="text-title-md font-bold text-on-surface mt-6 mb-3">Constraints:</h3>
              <div className="bg-[#f8f9fa] border border-outline-variant/50 rounded-xl p-4 font-mono text-sm text-on-surface">
                <ul className="list-inside space-y-2">
                  <li>• Time complexity: O(1) for request checks.</li>
                  <li>• Memory complexity: O(N) where N is users.</li>
                  <li>• Handle concurrency safely.</li>
                </ul>
              </div>
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
            {/* Line numbers mock */}
            <div className="w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-end py-4 pr-3 text-gray-600 font-mono text-sm select-none">
              {Array.from({ length: 15 }).map((_, i) => <div key={i}>{i + 1}</div>)}
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
                  <div className="flex gap-4">
                    {[1, 2, 3].map(num => (
                      <button
                        key={num}
                        onClick={() => setActiveTestCase(num)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${activeTestCase === num ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                      >
                        {activeTestCase === num ? <CheckCircle size={16} className="text-primary" /> : <Circle size={16} />}
                        Case {num}
                      </button>
                    ))}
                  </div>
                  <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 font-mono text-sm">
                    <div className="text-on-surface-variant mb-2">Input:</div>
                    <div className="bg-white p-3 rounded border border-outline-variant/50 text-on-surface">
                      {activeTestCase === 1 ? 'limit = 5, window = 60' : activeTestCase === 2 ? 'limit = 1, window = 1' : 'limit = 100, window = 3600'}
                    </div>
                  </div>
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
      </main>

      {/* Proctoring Footer */}
      <footer className="h-10 bg-[#252836] flex items-center justify-between px-4 text-xs font-semibold text-gray-400 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Shield size={14} className="text-primary-fixed" />
            <span>Proctoring Active</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#059669]"></div> Camera</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#059669]"></div> Screen Share</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#059669]"></div> Microphone</div>
          </div>
        </div>
        <div>
          Session ID: {sessionId || 'VAL-8472-X9'}
        </div>
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
