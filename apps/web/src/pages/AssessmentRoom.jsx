import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, LogOut, Clock, Terminal, Code, Shield, FileText, TestTube, ChevronDown, AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { applicationService, submissionService } from "../services/api";
import { joinRoom, onRoomEvent, emitCodeChange, emitLanguageChange } from "../services/socket";

const LANGUAGE_OPTIONS = [
  { id: "python", label: "Python", file: "main.py" },
  { id: "javascript", label: "JavaScript", file: "main.js" },
  { id: "typescript", label: "TypeScript", file: "main.ts" },
  { id: "java", label: "Java", file: "Main.java" },
  { id: "cpp", label: "C++", file: "main.cpp" },
  { id: "go", label: "Go", file: "main.go" }
];

const TABS = [
  { id: "problem", label: "Problem", icon: FileText },
  { id: "testcases", label: "Test Cases", icon: TestTube }
];

export default function AssessmentRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("problem");
  const [language, setLanguage] = useState("python");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(43 * 60 + 18);
  const [output, setOutput] = useState("// Console ready\n// Click 'Run Code' to submit your solution");
  const [isRunning, setIsRunning] = useState(false);
  const [integrityFlags, setIntegrityFlags] = useState(0);
  const [integrityEvents, setIntegrityEvents] = useState([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const lastCodeEmitRef = useRef("");
  const lastLangEmitRef = useRef("python");

  const [code, setCode] = useState(`import time
from threading import Lock

class RateLimiter:
    def __init__(self):
        self.user_requests = {}
        self.lock = Lock()

    def is_allowed(self, user_id: str, limit: int, window: int) -> bool:
        with self.lock:
            current_time = time.time()
            # Implement the token bucket or sliding window logic here
            pass

# Initialize the limiter
limiter = RateLimiter()`);

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
        toast.error("Failed to start assessment session");
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
    const logEvent = (type, label) => {
      setIntegrityEvents((prev) => [
        ...prev,
        { type, label, at: new Date().toLocaleTimeString() }
      ]);
    };

    const onVisibility = () => {
      if (document.hidden) {
        sendEvent("TAB_HIDDEN", { timestamp: Date.now() });
        setIntegrityFlags((f) => f + 1);
        logEvent("TAB_HIDDEN", "Tab switch detected");
        toast.warning("Tab switch logged", { title: "Integrity event" });
      } else {
        sendEvent("TAB_VISIBLE", { timestamp: Date.now() });
      }
    };
    const onBlur = () => {
      sendEvent("WINDOW_BLUR", { timestamp: Date.now() });
      setIntegrityFlags((f) => f + 1);
      logEvent("WINDOW_BLUR", "Window lost focus");
    };
    const onFocus = () => sendEvent("WINDOW_FOCUS", { timestamp: Date.now() });
    const onCopy = () => {
      sendEvent("COPY", { length: window.getSelection()?.toString().length || 0 });
      logEvent("COPY", "Copy detected");
    };
    const onPaste = (e) => {
      sendEvent("PASTE", { length: (e.clipboardData?.getData("text") || "").length });
      logEvent("PASTE", "Paste detected");
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    sendEvent("SESSION_START");

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      sendEvent("SESSION_END");
    };
  }, [sessionId, toast]);

  useEffect(() => {
    if (!sessionId) return;
    joinRoom(`session:${sessionId}`);
    const off = onRoomEvent(`session:${sessionId}`, ({ type }) => {
      if (type === "codeChange") return;
    });
    return () => off();
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (lastCodeEmitRef.current === code) return;
    lastCodeEmitRef.current = code;
    emitCodeChange(`session:${sessionId}`, code);
  }, [code, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (lastLangEmitRef.current === language) return;
    lastLangEmitRef.current = language;
    emitLanguageChange(`session:${sessionId}`, language);
  }, [language, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const off = onRoomEvent(`session:${sessionId}`, ({ type, payload }) => {
      if (type === "codeChange" && payload?.code !== undefined && payload.code !== lastCodeEmitRef.current) {
        lastCodeEmitRef.current = payload.code;
        setCode(payload.code);
      }
    });
    return () => off();
  }, [sessionId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentLanguage = LANGUAGE_OPTIONS.find((l) => l.id === language) || LANGUAGE_OPTIONS[0];

  const handleRunCode = useCallback(async () => {
    if (!sessionData?.codingQuestionId) {
      toast.warning("No active coding question");
      return;
    }
    setIsRunning(true);
    setOutput("// Running tests...");

    try {
      const result = await submissionService.submitCode(
        sessionId,
        sessionData.codingQuestionId,
        code,
        language
      );
      setOutput(
        `// Submission ID: ${result.submissionId}\n// Status: ${result.status || "Pending"}\n\n${result.output || result.results || "// Check results later."}`
      );
      toast.success("Code submitted", { title: "Running tests" });
    } catch (err) {
      setOutput(`// Error: ${err.message}`);
      toast.error("Code submission failed");
    } finally {
      setIsRunning(false);
    }
  }, [sessionId, sessionData, code, language, toast]);

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit? This action cannot be undone.")) return;
    try {
      await applicationService.finalSubmit(sessionId);
      toast.success("Assessment submitted!", { title: "All done" });
      setTimeout(() => navigate("/candidate"), 1500);
    } catch (err) {
      toast.error(`Submit failed: ${err.message}`);
    }
  };

  const handleExit = async () => {
    try {
      await logout();
    } catch {}
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4" />
          <p className="text-body-md text-on-surface-variant">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">
      <header className="flex-shrink-0 bg-surface-container-lowest border-b border-outline flex justify-between items-center px-6 h-16 z-50">
        <div className="flex items-center gap-4">
          <div className={"flex items-center gap-2 font-title-md " + (timeLeft < 300 ? "text-error-coral" : "text-on-surface")}>
            <Clock size={20} />
            <span className="font-mono text-lg tracking-wider">{formatTime(timeLeft)}</span>
            <span className="text-xs text-on-surface-variant">left</span>
          </div>
          {integrityFlags > 0 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-error-container text-on-error-container rounded text-label-sm font-semibold" title="Integrity events">
              <AlertTriangle size={14} />
              <span>{integrityFlags} flag{integrityFlags === 1 ? "" : "s"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-success-green/10 text-success-green rounded text-label-sm font-semibold">
              <CheckCircle2 size={14} />
              <span>Trust OK</span>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-3 h-10 bg-surface border border-outline rounded-lg hover:bg-surface-light transition-colors"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
          >
            <Code size={16} className="text-primary" />
            <span className="text-sm font-semibold">{currentLanguage.label}</span>
            <ChevronDown size={16} />
          </button>
          {showLangDropdown ? (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-44 bg-surface border border-outline rounded-lg shadow-modal z-[60] overflow-hidden">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  className={
                    "w-full text-left px-3 py-2 text-sm hover:bg-surface-light transition-colors flex items-center gap-2 " +
                    (language === lang.id ? "text-primary font-semibold" : "text-on-surface")
                  }
                  onClick={() => {
                    setLanguage(lang.id);
                    setShowLangDropdown(false);
                  }}
                >
                  <Code size={14} />
                  <span className="flex-1">{lang.label}</span>
                  {language === lang.id ? <CheckCircle2 size={14} /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="secondary-button"
          >
            <LogOut size={16} />
            <span>Exit</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="primary-button"
          >
            <Send size={16} />
            <span>Submit</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="w-[480px] flex-shrink-0 bg-surface-container-lowest border-r border-outline flex flex-col">
          <div className="flex border-b border-outline bg-surface-container-low">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={
                    "flex-1 py-3 px-4 font-semibold text-sm transition-colors " +
                    (activeTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-surface-container-lowest"
                      : "text-on-surface-variant hover:bg-surface-container")
                  }
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icon size={16} />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4 gap-3">
              <h1 className="text-headline-md text-on-surface font-semibold">Implement a rate limiter</h1>
              <span className="px-2.5 py-1 bg-primary-container text-on-primary-container rounded-full text-label-sm font-semibold flex-shrink-0">
                20 pts
              </span>
            </div>

            {activeTab === "problem" ? (
              <div className="space-y-6">
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Design and implement a thread-safe rate limiter that restricts the number of requests a
                  user can make within a specific time window. Your solution should handle burst traffic
                  efficiently.
                </p>

                <div>
                  <h3 className="text-title-md text-on-surface font-semibold mb-2">Example</h3>
                  <div className="p-3 bg-surface-light border border-outline rounded-lg font-mono text-sm space-y-1">
                    <div className="text-secondary"># Sample call</div>
                    <div className="text-on-surface">Input: rate_limit(user_id="user1", limit=5, window=60)</div>
                    <div className="text-primary">Expected Output: True</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-title-md text-on-surface font-semibold mb-2">Constraints</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
                    <li>Time complexity: O(1) for request checks.</li>
                    <li>Memory complexity: O(N) where N is number of unique users.</li>
                    <li>Handle concurrency using thread-safe primitives.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-title-md text-on-surface font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Concurrency", "Sliding window", "Data structures"].map((tag) => (
                      <span key={tag} className="status-chip info">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-title-md text-on-surface font-semibold">Sample Test Cases</h3>
                {[
                  { input: 'rate_limit("u1", 5, 60)', expected: "True" },
                  { input: 'rate_limit("u2", 1, 1)', expected: "True" },
                  { input: 'rate_limit("u2", 1, 1)', expected: "False" }
                ].map((tc, i) => (
                  <div key={i} className="border border-outline rounded-lg p-3 bg-white">
                    <div className="mb-2">
                      <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Input</span>
                      <pre className="text-sm font-mono text-on-surface mt-1 whitespace-pre-wrap">{tc.input}</pre>
                    </div>
                    <div>
                      <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Expected</span>
                      <pre className="text-sm font-mono text-primary mt-1 whitespace-pre-wrap">{tc.expected}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-surface-container-low border-t border-outline">
            <div className="flex gap-3 p-3 bg-surface rounded-lg border border-outline items-start">
              <Shield size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-label-md text-on-surface font-semibold">Integrity monitor</p>
                <p className="text-body-sm text-on-surface-variant">
                  Your camera and screen activity are being recorded for proctoring purposes.
                </p>
                {integrityEvents.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-on-surface-variant">
                    {integrityEvents.slice(-3).map((e, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-error-coral rounded-full" />
                        <span>{e.label} • {e.at}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-code-bg-dark">
          <div className="h-12 bg-[#1E293B] flex justify-between items-center px-4 border-b border-[#334155] flex-shrink-0">
            <div className="flex items-center gap-1 h-full">
              <div className="flex items-center gap-2 px-3 h-full bg-code-bg-dark border-t-2 border-primary text-on-primary">
                <Code size={16} className="text-primary" />
                <span className="text-label-md font-semibold">{currentLanguage.file}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              <Play size={14} />
              {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden flex flex-col">
            <textarea
              autoComplete="off"
              className="flex-1 w-full bg-transparent border-none focus:ring-0 font-mono text-sm text-slate-200 resize-none p-4 leading-relaxed"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 blur-3xl pointer-events-none" />
          </div>

          <div className="h-1/3 max-h-64 bg-[#1E293B] border-t border-[#334155] flex flex-col flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#334155] bg-[#0F172A]">
              <Terminal size={14} className="text-on-surface-variant" />
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Console Output</span>
            </div>
            <pre className="flex-1 p-4 font-mono text-sm text-slate-300 overflow-y-auto whitespace-pre-wrap">
{output}
            </pre>
          </div>
        </section>
      </main>

      {showExitConfirm ? (
        <div className="modal-backdrop" onClick={() => setShowExitConfirm(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Exit assessment?</h2>
                <p>Your progress will be saved, but the session timer keeps running.</p>
              </div>
            </div>
            <div className="modal-body">
              <p className="text-sm text-on-surface-variant">
                Are you sure you want to exit? You can resume your assessment from the candidate dashboard.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary-button" onClick={() => setShowExitConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={handleExit}>
                <LogOut size={16} />
                <span>Exit & sign out</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
