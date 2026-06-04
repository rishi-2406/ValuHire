import { useState, useEffect, useCallback, useRef } from "react";

export function useMediaDevices(requestedVideo, requestedMic) {
  const [stream, setStream] = useState(null);
  
  const [micWorking, setMicWorking] = useState(false);
  const [cameraWorking, setCameraWorking] = useState(false);
  const [networkWorking, setNetworkWorking] = useState(false);
  
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);

  const streamRef = useRef(null);
  const displayStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Real Network Check via fetch
  useEffect(() => {
    let active = true;

    const testNetwork = async () => {
      if (!navigator.onLine) {
        if (active) setNetworkWorking(false);
        return;
      }
      try {
        // Fetch to root to check real connectivity
        const res = await fetch("/", { method: "HEAD", cache: "no-store" });
        if (active) {
          setNetworkWorking(res.ok);
        }
      } catch (err) {
        if (active) setNetworkWorking(false);
      }
    };

    testNetwork();
    const interval = setInterval(testNetwork, 5000);

    const handleOnline = () => testNetwork();
    const handleOffline = () => setNetworkWorking(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Media acquisition and real testing
  useEffect(() => {
    let active = true;

    async function initMedia() {
      try {
        if (!requestedVideo && !requestedMic) {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
            setStream(null);
          }
          setMicWorking(false);
          setCameraWorking(false);
          return;
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: requestedVideo,
          audio: requestedMic,
        });

        if (!active) {
          newStream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }

        streamRef.current = newStream;
        setStream(newStream);

        // 1. Camera Real Check
        const videoTrack = newStream.getVideoTracks()[0];
        if (videoTrack) {
          // If it's live, we consider it working
          if (videoTrack.readyState === "live") {
            setCameraWorking(true);
          } else {
            videoTrack.onunmute = () => {
              if (active) setCameraWorking(true);
            };
          }
        } else {
          setCameraWorking(false);
        }

        // 2. Mic Real Check (Volume detection)
        const audioTrack = newStream.getAudioTracks()[0];
        if (audioTrack) {
          // Initialize AudioContext to test volume
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!audioContextRef.current) {
             audioContextRef.current = new AudioContext();
          }
          const ctx = audioContextRef.current;
          
          if (ctx.state === "suspended") {
            await ctx.resume();
          }

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          const source = ctx.createMediaStreamSource(newStream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const checkVolume = () => {
            if (!active) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            
            // If sound is detected (average volume > tiny threshold)
            if (average > 2) {
              setMicWorking(true);
              // Stop polling once we confirmed mic works
              return;
            }
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };
          
          checkVolume();
        } else {
          setMicWorking(false);
        }

        setError(null);
      } catch (err) {
        console.error("Media device error:", err);
        if (active) {
          setError(err.message);
          setCameraWorking(false);
          setMicWorking(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
            setStream(null);
          }
        }
      }
    }

    initMedia();

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [requestedVideo, requestedMic]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (displayStreamRef.current) {
        displayStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        setIsScreenSharing(false);
        if (displayStreamRef.current) {
          displayStreamRef.current.getTracks().forEach(t => t.stop());
          displayStreamRef.current = null;
        }
        return;
      }
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      displayStreamRef.current = displayStream;
      setIsScreenSharing(true);

      // Listen for user stopping via browser native button
      displayStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        displayStreamRef.current = null;
      };
    } catch (err) {
      console.error("Screen share error", err);
      setIsScreenSharing(false);
    }
  }, [isScreenSharing]);

  return {
    stream,
    micWorking,
    cameraWorking,
    networkWorking,
    isScreenSharing,
    toggleScreenShare,
    error,
  };
}
