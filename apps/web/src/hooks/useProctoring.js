import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "./useToast";
import { applicationService } from "../services/api";

export const MAX_VIOLATIONS = 5;

export function useProctoring(sessionId, isActive, onForceSubmit) {
  const toast = useToast();
  const [violationsCount, setViolationsCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastEventTime = useRef(0);

  const logEvent = useCallback(async (type, metadata = {}) => {
    if (!isActive || !sessionId) return;
    
    // Throttle events of the same type generally to prevent spam
    const now = Date.now();
    if (now - lastEventTime.current < 2000) return; // 2 seconds throttle
    lastEventTime.current = now;

    setViolationsCount(prev => {
      const newCount = prev + 1;
      
      let warningMessage = `Proctoring warning: ${type.replace('_', ' ')}.`;
      if (newCount >= MAX_VIOLATIONS) {
        warningMessage = `Maximum violations reached. Submitting assessment...`;
        toast.error(warningMessage);
        // Delay slightly to let toast show
        setTimeout(() => {
          onForceSubmit();
        }, 1500);
      } else {
        toast.warning(`${warningMessage} (${newCount}/${MAX_VIOLATIONS})`);
      }
      return newCount;
    });

    try {
      await applicationService.submitProctorEvent(sessionId, type, metadata);
    } catch (err) {
      console.error("Failed to log proctor event", err);
    }
  }, [isActive, sessionId, onForceSubmit, toast]);

  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logEvent("tab_switch", { timestamp: new Date().toISOString() });
      }
    };

    const handleBlur = () => {
      logEvent("focus_loss", { timestamp: new Date().toISOString() });
    };

    const handleFullscreenChange = () => {
      const fullscreenActive = !!document.fullscreenElement;
      setIsFullscreen(fullscreenActive);
      if (!fullscreenActive) {
        logEvent("fullscreen_exit", { timestamp: new Date().toISOString() });
      }
    };

    const handleCopy = () => {
      logEvent("copy", { timestamp: new Date().toISOString() });
    };

    const handlePaste = () => {
      logEvent("paste", { timestamp: new Date().toISOString() });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    // Initial check for fullscreen
    setIsFullscreen(!!document.fullscreenElement);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [isActive, logEvent]);

  const requestFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error("Failed to enter fullscreen", err);
      toast.error("Could not enter fullscreen. Please check your browser permissions.");
    }
  }, [toast]);

  return { violationsCount, isFullscreen, requestFullscreen, MAX_VIOLATIONS };
}
