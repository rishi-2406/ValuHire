import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Play, LogOut, Clock, Terminal, Code, Shield, FileText, TestTube } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { applicationService, submissionService } from "../services/api";

export default function AssessmentRoom() {
  const { sessionId } = useParams();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("problem");
  const [language, setLanguage] = useState("Python");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(43 * 60 + 18);
  const [output, setOutput] = useState("Console ready...");
  const [isRunning, setIsRunning] = useState(false);

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
      .then(data => {
        setSessionData(data.session || data);
        if (data.session?.timeLeft) setTimeLeft(data.session.timeLeft);
        if (data.session?.code) setCode(data.session.code);
      })
      .catch(err => console.error("Failed to start session:", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    applicationService.submitProctorEvent(sessionId, "HEARTBEAT", { timeLeft: timeLeft }).catch(() => {});
    return () => clearInterval(timer);
  }, [sessionId, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRunCode = useCallback(async () => {
    if (!sessionData?.codingQuestionId) return;
    setIsRunning(true);
    setOutput("Running tests...");

    try {
      const result = await submissionService.submitCode(
        sessionId,
        sessionData.codingQuestionId,
        code,
        language
      );
      setOutput(`Submission ID: ${result.submissionId}\nStatus: ${result.status || "Pending"}\n\n${result.output || result.results || "Check results later."}`);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [sessionId, sessionData, code, language]);

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit? This action cannot be undone.")) return;
    try {
      await applicationService.finalSubmit(sessionId);
      alert("Assessment submitted successfully!");
    } catch (err) {
      alert(`Submit failed: ${err.message}`);
    }
  };

  const languages = ["Python", "JavaScript", "Java", "C++"];

  return (
    <div className="h-screen flex flex-col bg-surface">
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant flex justify-between items-center px-lg h-16">
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm text-primary">
            <Clock size={20} />
            <span className={`font-title-md ${timeLeft < 300 ? "text-error" : ""}`}>
              {formatTime(timeLeft)} left
            </span>
          </div>
        </div>

        <div className="relative group">
          <button
            className="flex items-center gap-sm px-md py-sm bg-surface-container-low rounded border border-outline-variant hover:bg-surface-container transition-colors"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
          >
            <span className="font-title-md">{language}</span>
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </button>
          {showLangDropdown && (
            <div className="absolute top-full left-0 mt-xs w-full bg-surface border border-outline-variant rounded shadow-lg z-[60]">
              {languages.map((lang) => (
                <div
                  key={lang}
                  className="px-md py-sm hover:bg-surface-container cursor-pointer font-body-md text-body-md"
                  onClick={() => {
                    setLanguage(lang);
                    setShowLangDropdown(false);
                  }}
                >
                  {lang}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-md">
          <button
            onClick={logout}
            className="px-lg py-sm border border-primary text-primary rounded font-label-md text-label-md hover:bg-surface-container-low transition-all"
          >
            Exit
          </button>
          <button
            onClick={handleSubmit}
            className="px-lg py-sm bg-primary text-on-primary rounded font-label-md text-label-md hover:opacity-90 transition-all"
          >
            Submit
          </button>
        </div>
      </header>

      <main className="flex flex-1 pt-16 overflow-hidden">
        <aside className="w-[400px] flex-shrink-0 bg-surface-container-low border-r border-outline-variant flex flex-col">
          <div className="flex-1 overflow-y-auto p-lg custom-scrollbar">
            <nav className="flex border-b border-outline-variant mb-lg">
              <button
                className={`flex-1 py-sm px-md font-label-md text-label-md transition-colors ${
                  activeTab === "problem"
                    ? "text-primary border-b-2 border-primary bg-primary-container/10"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
                onClick={() => setActiveTab("problem")}
              >
                <div className="flex items-center justify-center gap-xs">
                  <FileText size={18} />
                  Problem
                </div>
              </button>
              <button
                className={`flex-1 py-sm px-md font-label-md text-label-md transition-colors ${
                  activeTab === "testcases"
                    ? "text-primary border-b-2 border-primary bg-primary-container/10"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
                onClick={() => setActiveTab("testcases")}
              >
                <div className="flex items-center justify-center gap-xs">
                  <TestTube size={18} />
                  Test Cases
                </div>
              </button>
            </nav>

            <div className="flex justify-between items-start mb-md">
              <h1 className="text-headline-md text-on-surface font-semibold">Implement a rate limiter</h1>
              <span className="px-sm py-[2px] bg-primary-container text-on-primary-container rounded-full text-label-sm">
                20 points
              </span>
            </div>

            <div className="space-y-lg">
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Design and implement a thread-safe rate limiter that restricts the number of requests a
                user can make within a specific time window. Your solution should handle burst traffic
                efficiently.
              </p>

              <div className="space-y-sm">
                <h3 className="text-title-md text-on-surface font-semibold">Example</h3>
                <div className="p-md bg-surface border border-outline-variant rounded font-mono text-body-sm space-y-xs">
                  <div className="text-secondary"># Sample call</div>
                  <div className="text-on-surface">Input: rate_limit(user_id="user1", limit=5, window=60)</div>
                  <div className="text-primary">Expected Output: True</div>
                </div>
              </div>

              <div className="space-y-sm">
                <h3 className="text-title-md text-on-surface font-semibold">Constraints</h3>
                <ul className="list-disc pl-lg space-y-xs text-body-sm text-on-surface-variant">
                  <li>Time complexity: O(1) for request checks.</li>
                  <li>Memory complexity: O(N) where N is number of unique users.</li>
                  <li>Handle concurrency using thread-safe primitives.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-md bg-surface-container-highest border-t border-outline-variant">
            <div className="flex gap-sm p-sm bg-surface rounded border border-outline-variant items-start">
              <Shield size={20} className="text-primary mt-1" />
              <div>
                <p className="text-label-md text-on-surface font-semibold">Integrity monitor</p>
                <p className="text-body-sm text-on-surface-variant">
                  Your camera and screen activity are being recorded for proctoring purposes.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-[#1e1e1e]">
          <div className="h-12 bg-[#2d2d2d] flex justify-between items-center px-md border-b border-[#3e3e3e]">
            <div className="flex items-center gap-md h-full">
              <div className="flex items-center gap-xs px-md h-full bg-[#1e1e1e] border-t-2 border-primary">
                <Code size={18} className="text-primary" />
                <span className="text-label-md text-on-primary font-semibold">main.py</span>
              </div>
            </div>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-xs px-md py-[6px] bg-primary text-on-primary rounded font-label-md text-label-md hover:opacity-90 active:opacity-80 transition-all disabled:opacity-50"
            >
              <Play size={18} />
              Run Code
            </button>
          </div>

          <div className="flex-1 p-md relative overflow-hidden flex flex-col">
            <textarea
              autocomplete="off"
              className="flex-1 w-full bg-transparent border-none focus:ring-0 font-mono text-body-md text-[#d4d4d4] resize-none custom-scrollbar"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
          </div>

          <div className="h-1/3 bg-[#1e1e1e] border-t border-[#3e3e3e] flex flex-col">
            <div className="flex items-center gap-xs px-md py-sm border-b border-[#3e3e3e] bg-[#252526]">
              <Terminal size={16} className="text-on-surface-variant" />
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Console</span>
            </div>
            <div
              className="flex-1 p-md font-mono text-body-sm text-[#858585] overflow-y-auto custom-scrollbar"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}