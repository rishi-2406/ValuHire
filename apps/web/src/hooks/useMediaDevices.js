import { useState, useEffect, useCallback, useRef } from "react";

export function useMediaDevices(requestedVideo, requestedMic) {
  const [stream, setStream] = useState(null);
  const [displayStream, setDisplayStream] = useState(null);
  
  const [micWorking, setMicWorking] = useState(false);
  const [cameraWorking, setCameraWorking] = useState(false);
  const [networkWorking, setNetworkWorking] = useState(false);
  
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);

  // Device selection state
  const [devices, setDevices] = useState({ audioInputs: [], videoInputs: [] });
  const [selectedAudioId, setSelectedAudioId] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState("");

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

  // Enumerate devices initially and when permissions might change
  useEffect(() => {
    const updateDevices = async () => {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devs.filter((d) => d.kind === "audioinput");
        const videoInputs = devs.filter((d) => d.kind === "videoinput");
        setDevices({ audioInputs, videoInputs });
        
        // Auto-select first available if none selected
        if (!selectedAudioId && audioInputs.length > 0) {
          setSelectedAudioId(audioInputs[0].deviceId);
        }
        if (!selectedVideoId && videoInputs.length > 0) {
          setSelectedVideoId(videoInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Failed to enumerate devices:", err);
      }
    };

    updateDevices();
    navigator.mediaDevices.addEventListener("devicechange", updateDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
    };
  }, [selectedAudioId, selectedVideoId]);

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

        const constraints = {
          video: requestedVideo 
            ? (selectedVideoId ? { deviceId: { exact: selectedVideoId } } : true)
            : false,
          audio: requestedMic 
            ? (selectedAudioId ? { deviceId: { exact: selectedAudioId } } : true)
            : false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);

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
            
            if (average > 2) {
              setMicWorking(true);
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
  }, [requestedVideo, requestedMic, selectedVideoId, selectedAudioId]);

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
          setDisplayStream(null);
        }
        return;
      }
      const newDisplayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      displayStreamRef.current = newDisplayStream;
      setDisplayStream(newDisplayStream);
      setIsScreenSharing(true);

      newDisplayStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        displayStreamRef.current = null;
        setDisplayStream(null);
      };
    } catch (err) {
      console.error("Screen share error", err);
      setIsScreenSharing(false);
    }
  }, [isScreenSharing]);

  return {
    stream,
    displayStream,
    micWorking,
    cameraWorking,
    networkWorking,
    isScreenSharing,
    toggleScreenShare,
    error,
    devices,
    selectedAudioId,
    setSelectedAudioId,
    selectedVideoId,
    setSelectedVideoId
  };
}
