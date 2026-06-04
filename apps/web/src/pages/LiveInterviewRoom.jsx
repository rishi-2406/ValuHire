import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Code as CodeIcon, Play, LogOut, ChevronDown, CheckCircle2, FileText, X } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { applicationService, interviewService } from "../services/api";
import { joinRoom, leaveRoom, onRoomEvent, emitCodeChange, emitLanguageChange, emitQuestionChange } from "../services/socket";
import InterviewFeedbackModal from "../components/InterviewFeedbackModal";

const LANGUAGE_OPTIONS = [
  { id: "python", label: "Python 3" },
  { id: "javascript", label: "JavaScript" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

export default function LiveInterviewRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  
  const isRecruiter = user?.role === "RECRUITER" || user?.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState(null);
  
  // State for syncing
  const [code, setCode] = useState("# Write your code here");
  const [language, setLanguage] = useState("python");
  const [questionText, setQuestionText] = useState("## Technical Problem\n\nPlease write a function to solve...");
  
  // Local state
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [interviewerNotes, setInterviewerNotes] = useState("");
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Track if the code change came from us to avoid echo loops
  const isLocalCodeChange = useRef(false);
  const isLocalQuestionChange = useRef(false);

  useEffect(() => {
    if (!sessionId) return;
    
    // For simplicity, just use the socket room `interview:${sessionId}`
    const room = `interview:${sessionId}`;
    joinRoom(room);

    // If recruiter, we might want to fetch campaign questions. 
    // We can assume we get interview details from interviewService
    if (isRecruiter) {
       interviewService.getMyInterviews()
         .then(data => {
            const list = data.slots || data.interviews || data || [];
            const found = list.find(i => (i.id || i.interviewId) === sessionId);
            if (found) setInterviewData(found);
         })
         .catch(err => console.error(err))
         .finally(() => setLoading(false));
    } else {
       // candidate
       setLoading(false);
    }

    const off = onRoomEvent(room, ({ type, payload }) => {
      if (type === "codeChange") {
        if (payload.code !== code && !isLocalCodeChange.current) {
          setCode(payload.code);
        }
      } else if (type === "languageChange") {
        setLanguage(payload.language);
      } else if (type === "questionChange") {
        if (payload.questionText !== questionText && !isLocalQuestionChange.current) {
          setQuestionText(payload.questionText);
        }
      }
    });

    return () => {
      off();
      leaveRoom(room);
    };
  }, [sessionId, isRecruiter]);

  const handleCodeChange = (newCode) => {
    setCode(newCode || "");
    isLocalCodeChange.current = true;
    emitCodeChange(`interview:${sessionId}`, newCode || "");
    // reset local change flag shortly after
    setTimeout(() => { isLocalCodeChange.current = false; }, 50);
  };

  const handleQuestionChange = (e) => {
    const val = e.target.value;
    setQuestionText(val);
    isLocalQuestionChange.current = true;
    emitQuestionChange(`interview:${sessionId}`, val);
    setTimeout(() => { isLocalQuestionChange.current = false; }, 50);
  };

  const handleLanguageChange = (langId) => {
    setLanguage(langId);
    setShowLangDropdown(false);
    emitLanguageChange(`interview:${sessionId}`, langId);
  };

  const handleEndInterview = () => {
    if (isRecruiter) {
      setShowFeedbackModal(true);
    } else {
      if (window.confirm("Are you sure you want to leave the interview?")) {
        navigate("/candidate");
      }
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      await interviewService.submitFeedback(sessionId, feedbackData);
      toast.success("Feedback submitted successfully");
      setShowFeedbackModal(false);
      navigate("/interviews");
    } catch (err) {
      toast.error(err.message || "Failed to submit feedback");
    }
  };

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
      
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-outline-variant flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#E0E7FF] text-[#3730A3] font-bold rounded-lg flex items-center justify-center">
            {isRecruiter ? "R" : "C"}
          </div>
          <div>
            <h1 className="font-bold text-on-surface text-lg">Live Interview Session</h1>
            <p className="text-xs font-semibold text-on-surface-variant">Secure Connection Established</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Meeting Controls */}
           <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/60 shadow-sm">
             <button 
               onClick={() => setMicOn(!micOn)}
               className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${micOn ? 'bg-white text-on-surface hover:bg-surface-variant' : 'bg-[#FFDAD6] text-[#93000A] hover:bg-[#BA1A1A] hover:text-white'}`}
             >
               {micOn ? <Mic size={20} /> : <MicOff size={20} />}
             </button>
             <button 
               onClick={() => setVideoOn(!videoOn)}
               className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${videoOn ? 'bg-white text-on-surface hover:bg-surface-variant' : 'bg-[#FFDAD6] text-[#93000A] hover:bg-[#BA1A1A] hover:text-white'}`}
             >
               {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
             </button>
           </div>
           
           {isRecruiter && (
             <>
               <button 
                 onClick={() => setShowNotes(!showNotes)}
                 className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${showNotes ? 'bg-[#DBEAFE] text-[#1E40AF]' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`}
               >
                 <FileText size={18} /> Notes
               </button>
               <div className="w-px h-8 bg-outline-variant/50 mx-1" />
             </>
           )}
           
           <button 
             onClick={handleEndInterview}
             className="flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95"
           >
             <PhoneOff size={18} />
             {isRecruiter ? "End & Evaluate" : "Leave Interview"}
           </button>
        </div>
      </header>

      {/* Main Content Split: Left (Problem + Cameras) | Right (Code) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Cameras and Problem Statement */}
        <div className="w-1/3 min-w-[350px] max-w-[500px] flex flex-col border-r border-outline-variant bg-[#F8FAFC]">
          
          {/* Cameras Area */}
          <div className="p-4 flex gap-3 border-b border-outline-variant/50 shrink-0">
             {/* Local Camera */}
             <div className="flex-1 aspect-video bg-inverse-surface rounded-xl relative overflow-hidden border border-outline-variant/60 shadow-sm">
               {videoOn ? (
                 <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLkeqaKMn8_bBjaeM10dbp8MzXNTEYccPtO7zhUx8hCREjp0SfmgwrQVIGaKBrjqp4r-oTPNlEd6w4lkDH9t9qrD8_cayulC4bt553V0C5pl5Sgy9N_MFBAPFgTwI-NMLbZvOeJXeNCl1ANrCZvcBx4Yz5Mm4GncBH95w__Sn37zKL-PWhF5f7gbud5CQB0mieXZj7BTiSF8zHXglIWS5aBuUqqIg9UDoiyWcuJu_xxMxoED5Tace8HvHRIZB5aRtQs9xhn8XZL2zV')" }} />
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
                   <VideoOff size={32} />
                 </div>
               )}
               <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">You</div>
               {!micOn && <div className="absolute top-2 right-2 bg-[#DC2626] text-white p-1 rounded-md"><MicOff size={12}/></div>}
             </div>
             
             {/* Remote Camera */}
             <div className="flex-1 aspect-video bg-inverse-surface rounded-xl relative overflow-hidden border border-outline-variant/60 shadow-sm">
               <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                 <div className="w-12 h-12 rounded-full bg-[#374151] text-white flex items-center justify-center font-bold text-lg">
                   {isRecruiter ? "C" : "R"}
                 </div>
               </div>
               <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
                 {isRecruiter ? "Candidate" : "Interviewer"}
               </div>
             </div>
          </div>

          {/* Problem Statement Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="px-5 py-3 border-b border-outline-variant/50 bg-[#F8FAFC] flex justify-between items-center">
              <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">Problem Statement</h2>
              {isRecruiter && (
                <span className="text-[10px] font-semibold bg-[#DBEAFE] text-[#1E40AF] px-2 py-0.5 rounded">Editable by you</span>
              )}
            </div>
            <div className="flex-1 p-5 overflow-y-auto">
              {isRecruiter ? (
                <textarea
                  value={questionText}
                  onChange={handleQuestionChange}
                  className="w-full h-full resize-none border-none outline-none font-mono text-sm text-on-surface-variant bg-transparent whitespace-pre-wrap"
                  placeholder="Paste or type problem statement here..."
                />
              ) : (
                <div className="w-full h-full font-mono text-sm text-on-surface-variant whitespace-pre-wrap overflow-y-auto">
                  {questionText || "Waiting for interviewer to provide the problem..."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1E1E1E]">
          {/* IDE Toolbar */}
          <div className="h-12 bg-[#252526] border-b border-[#3C3C3C] flex items-center justify-between px-4 shrink-0">
             <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 bg-[#1E1E1E] border border-[#3C3C3C] px-3 py-1.5 rounded text-[#D4D4D4] text-xs font-semibold cursor-pointer hover:bg-[#3C3C3C] transition-colors"
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                >
                  <CodeIcon size={14} />
                  <span>{currentLanguage.label}</span>
                  <ChevronDown size={14} />
                </button>
                {showLangDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-[#252526] border border-[#3C3C3C] rounded shadow-2xl z-50">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang.id}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#3C3C3C] ${language === lang.id ? 'text-white' : 'text-[#D4D4D4]'}`}
                        onClick={() => handleLanguageChange(lang.id)}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
             </div>
             
             <div className="flex items-center gap-3">
               <span className="text-[#858585] text-xs font-semibold flex items-center gap-1.5">
                 <CheckCircle2 size={12} className="text-[#10B981]" />
                 Synced Live
               </span>
               <button className="flex items-center gap-1.5 bg-[#2563EB] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#1D4ED8] transition-colors shadow-sm">
                 <Play size={12} fill="currentColor" /> Run Code
               </button>
             </div>
          </div>
          
          {/* Editor Container */}
          <div className="flex-1 relative w-full h-full">
            <Editor
              height="100%"
              language={language === "javascript" ? "javascript" : language === "python" ? "python" : language === "cpp" ? "cpp" : "java"}
              value={code}
              theme="vs-dark"
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                tabSize: 4,
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
                quickSuggestions: true,
                cursorBlinking: "smooth",
                smoothScrolling: true
              }}
            />
          </div>
        </div>

        {/* Floating Notes Panel for Recruiter */}
        {isRecruiter && showNotes && (
          <div className="w-[320px] bg-white border-l border-outline-variant flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.05)] z-20 transition-all duration-300">
            <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2 text-on-surface">
                <FileText size={16} className="text-[#2563EB]" />
                <h3 className="font-bold text-sm">Private Notes</h3>
              </div>
              <button onClick={() => setShowNotes(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container-low transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 p-4 flex flex-col">
              <textarea
                value={interviewerNotes}
                onChange={(e) => setInterviewerNotes(e.target.value)}
                placeholder="Jot down observations about the candidate's problem solving, communication, etc. This will be carried over to the final evaluation..."
                className="flex-1 w-full resize-none border-none outline-none text-sm text-on-surface-variant bg-transparent leading-relaxed"
              />
            </div>
            <div className="p-3 border-t border-outline-variant bg-[#F8FAFC] text-[10px] text-on-surface-variant text-center font-semibold uppercase tracking-wider">
              Notes auto-save locally
            </div>
          </div>
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
