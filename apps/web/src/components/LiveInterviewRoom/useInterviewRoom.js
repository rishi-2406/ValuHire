import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { interviewService, campaignService } from "../../services/api";
import { joinRoom, leaveRoom, onRoomEvent, emitCodeChange, emitLanguageChange, emitQuestionChange, emitMediaStateChange, emitInterviewEnded } from "../../services/socket";
import { useMediaDevices } from "../../hooks/useMediaDevices";
import { useWebRTC } from "../../hooks/useWebRTC";

export function useInterviewRoom(sessionId, user, isRecruiter) {
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState(null);
  const [campaign, setCampaign] = useState(null);

  // Sync state
  const [code, setCode] = useState("# Write your code here");
  const [language, setLanguage] = useState("python");
  const [questionText, setQuestionText] = useState("## Technical Problem\n\nPlease write a function to solve...");

  // Local state
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const videoOnRef = useRef(videoOn);
  const micOnRef = useRef(micOn);

  useEffect(() => { videoOnRef.current = videoOn; }, [videoOn]);
  useEffect(() => { micOnRef.current = micOn; }, [micOn]);

  const [showNotes, setShowNotes] = useState(false);
  const [interviewerNotes, setInterviewerNotes] = useState("");
  const [activeLeftTab, setActiveLeftTab] = useState("problem");

  // Remote state
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");

  // Resize state
  const [leftWidth, setLeftWidth] = useState(400);
  const isDragging = useRef(false);

  const isLocalCodeChange = useRef(false);
  const isLocalQuestionChange = useRef(false);

  // Media
  const { 
    stream, 
    displayStream, 
    isScreenSharing, 
    toggleScreenShare,
  } = useMediaDevices(videoOn, micOn);

  const activeLocalStream = isScreenSharing && displayStream ? displayStream : stream;
  const { remoteStream } = useWebRTC(`interview:${sessionId}`, activeLocalStream, isRecruiter);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && activeLocalStream) {
      localVideoRef.current.srcObject = activeLocalStream;
      localVideoRef.current.play().catch(console.error);
    }
  }, [activeLocalStream, videoOn]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(console.error);
    }
  }, [remoteStream, remoteVideoOn]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(console.error);
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!sessionId) return;
    emitMediaStateChange(`interview:${sessionId}`, videoOn, micOn);
  }, [videoOn, micOn, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    
    const room = `interview:${sessionId}`;
    joinRoom(room);

    interviewService.getMyInterviews()
      .then(data => {
        const list = data.slots || data.interviews || data || [];
        const found = list.find(i => (i.id || i.interviewId) === sessionId || i.roomCode === sessionId);
        if (found) {
          setInterviewData(found);
          if (isRecruiter && found.campaignId) {
            campaignService.getCampaignDetails(found.campaignId)
              .then(res => setCampaign(res.campaign || res))
              .catch(console.error);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

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
      } else if (type === "mediaStateChange") {
        setRemoteVideoOn(payload.videoOn);
        setRemoteMicOn(payload.micOn);
      } else if (type === "presenceChanged" && payload) {
        if (payload.joined) {
          setRemoteUserJoined(true);
          emitMediaStateChange(room, videoOnRef.current, micOnRef.current);
        } else {
          setRemoteUserJoined(false);
        }
      } else if (type === "interviewEnded") {
        if (!isRecruiter) {
          toast.info("The recruiter has ended the interview.");
          navigate("/candidate");
        }
      }
    });

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = Math.max(300, Math.min(e.clientX, window.innerWidth - 400));
      setLeftWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        window.dispatchEvent(new Event('resize'));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      off();
      leaveRoom(room);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [sessionId, isRecruiter, code, questionText]);

  const handleCodeChange = (newCode) => {
    setCode(newCode || "");
    isLocalCodeChange.current = true;
    emitCodeChange(`interview:${sessionId}`, newCode || "");
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

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Executing code...");

    try {
      const res = await interviewService.runCode(sessionId, code, language);
      const jobId = res.jobId;
      
      const poll = setInterval(async () => {
        try {
          const statusRes = await interviewService.getRunJobStatus(jobId);
          const st = statusRes.status;
          
          if (st === "completed" || st === "failed") {
            clearInterval(poll);
            setIsRunning(false);
            if (st === "completed") {
               const result = statusRes.result;
               let out = `Execution Completed (${result.executionTimeMs}ms)`;
               if (result.stdout) out += `\n\nSTDOUT:\n${result.stdout}`;
               if (result.stderr) out += `\n\nSTDERR:\n${result.stderr}`;
               setOutput(out);
            } else {
               setOutput(`Execution Failed: ${statusRes.stderr || "Unknown Error"}`);
            }
          }
        } catch (err) {
          clearInterval(poll);
          setIsRunning(false);
          setOutput(`Error checking status: ${err.message}`);
        }
      }, 1500);
    } catch (err) {
      setIsRunning(false);
      setOutput(`Error: ${err.message}`);
      toast.error("Failed to execute code");
    }
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
      emitInterviewEnded(`interview:${sessionId}`);
      toast.success("Feedback submitted successfully");
      setShowFeedbackModal(false);
      navigate("/interviews");
    } catch (err) {
      toast.error(err.message || "Failed to submit feedback");
    }
  };

  return {
    loading, interviewData, campaign, code, language, questionText,
    showLangDropdown, setShowLangDropdown, micOn, setMicOn, videoOn, setVideoOn,
    showNotes, setShowNotes, interviewerNotes, setInterviewerNotes, activeLeftTab, setActiveLeftTab,
    remoteVideoOn, remoteMicOn, remoteUserJoined, showFeedbackModal, setShowFeedbackModal,
    isRunning, output, leftWidth, setLeftWidth, isDragging,
    activeLocalStream, remoteStream, localVideoRef, remoteVideoRef, remoteAudioRef,
    isScreenSharing, toggleScreenShare, handleCodeChange, handleQuestionChange,
    handleLanguageChange, handleRunCode, handleEndInterview, handleFeedbackSubmit
  };
}
