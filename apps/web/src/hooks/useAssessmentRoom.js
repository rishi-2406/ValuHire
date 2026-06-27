import { useState, useEffect, useCallback } from "react";
import { useToast } from "./useToast";
import { applicationService } from "../services/api";

const LANGUAGE_OPTIONS = [
  { id: "python", label: "Python 3", file: "main.py" },
  { id: "javascript", label: "JavaScript", file: "main.js" },
  { id: "java", label: "Java", file: "Main.java" },
  { id: "cpp", label: "C++", file: "main.cpp" },
];
export const LANGUAGE_TEMPLATES = {
  python: `import sys\n\ndef main():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    main()`,
  javascript: `const fs = require('fs');\n\nfunction main() {\n    // Write your code here\n}\n\nmain();`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write your code here\n        \n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`
};

export function useAssessmentRoom(sessionId, navigate) {
  const toast = useToast();
  
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activePhase, setActivePhase] = useState("loading"); // mcq | coding
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [activeMcqIndex, setActiveMcqIndex] = useState(0);
  const [activeCodingIndex, setActiveCodingIndex] = useState(0);

  const activeCodingQ = sessionData?.assessment?.codingQuestions?.[activeCodingIndex];

  const [activeBottomTab, setActiveBottomTab] = useState("testcases");
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [language, setLanguage] = useState("python");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showMcqSubmitConfirm, setShowMcqSubmitConfirm] = useState(false);
  const [showFinalSubmitConfirm, setShowFinalSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
  
  const [mcqTime, setMcqTime] = useState(0);
  const [codingTime, setCodingTime] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const isUnmodified = !code || code === "# Write your code here" || Object.values(LANGUAGE_TEMPLATES).includes(code);
    if (isUnmodified) {
      setCode(LANGUAGE_TEMPLATES[language]);
    }
  }, [language]);

  useEffect(() => {
    if (activeCodingQ?.language) {
      setLanguage(activeCodingQ.language);
    }
  }, [activeCodingQ]);

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
          const initialLang = session.assessment.codingQuestions[0].language || "python";
          setLanguage(initialLang);
          setCode(LANGUAGE_TEMPLATES[initialLang] || "");
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load session");
        navigate("/candidate");
      })
      .finally(() => setLoading(false));
  }, [sessionId, toast, navigate]);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await applicationService.finalSubmit(sessionId, { mcqElapsed: mcqTime, codingElapsed: codingTime });
      toast.success("Assessment submitted!");
      setTimeout(() => navigate("/candidate"), 1500);
    } catch (err) {
      setIsSubmitting(false);
      toast.error(`Submit failed: ${err.message}`);
    }
  }, [sessionId, mcqTime, codingTime, navigate, toast]);

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
  }, [sessionId, loading, timeLeft, activePhase, handleSubmit]);

  const handleMcqSelect = async (questionId, optionIndex) => {
    setMcqAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    try {
      await applicationService.submitMcqAnswer(sessionId, questionId, optionIndex.toString());
    } catch (err) {
      toast.error("Failed to save answer");
    }
  };

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

  const handleExit = () => navigate("/candidate");

  return {
    sessionData, loading, activePhase, setActivePhase, mcqAnswers, setMcqAnswers,
    activeMcqIndex, setActiveMcqIndex, activeCodingIndex, setActiveCodingIndex,
    activeBottomTab, setActiveBottomTab, activeTestCase, setActiveTestCase,
    language, setLanguage, showLangDropdown, setShowLangDropdown,
    timeLeft, setTimeLeft, output, setOutput, isRunning, setIsRunning,
    showExitConfirm, setShowExitConfirm, code, setCode, mcqTime, codingTime,
    isSidebarOpen, setIsSidebarOpen,
    handleMcqSelect, handleRunCode, handleSubmit, handleExit,
    LANGUAGE_OPTIONS, activeCodingQ,
    showMcqSubmitConfirm, setShowMcqSubmitConfirm,
    showFinalSubmitConfirm, setShowFinalSubmitConfirm,
    isSubmitting
  };
}
