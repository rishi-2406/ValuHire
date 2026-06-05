import { useState, useEffect, useRef } from "react";
import { onRoomEvent, emitWebRTCOffer, emitWebRTCAnswer, emitICECandidate } from "../services/socket";

export function useWebRTC(roomId, localStream, isPolite = true) {
  const [remoteStream, setRemoteStream] = useState(null);
  const pcRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emitICECandidate(roomId, event.candidate);
      }
    };

    let makingOffer = false;
    let ignoreOffer = false;
    let iceQueue = [];

    pc.onnegotiationneeded = async () => {
      try {
        makingOffer = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        emitWebRTCOffer(roomId, offer);
      } catch (err) {
        console.error("Negotiation error:", err);
      } finally {
        makingOffer = false;
      }
    };

    pc.onsignalingstatechange = () => {
      if (pc.signalingState === "stable") {
        // Trigger a new negotiation if there are pending transceivers
        // This handles cases where an answer couldn't include our new tracks.
        const transceivers = pc.getTransceivers();
        const needsNegotiation = transceivers.some(t => t.currentDirection !== t.direction);
        if (needsNegotiation) {
           pc.onnegotiationneeded();
        }
      }
    };

    // If local stream exists, add its tracks initially
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    const off = onRoomEvent(roomId, async ({ type, payload }) => {
      try {
        if (type === "presenceChanged" && payload.joined) {
          // Force an offer when someone joins to ensure connection isn't lost
          try {
            makingOffer = true;
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            emitWebRTCOffer(roomId, offer);
          } catch (err) {
            console.error("Presence negotiation error:", err);
          } finally {
            makingOffer = false;
          }
        } else if (type === "webrtcOffer") {
          const offerCollision = (pc.signalingState !== "stable") || makingOffer;

          ignoreOffer = !isPolite && offerCollision;
          if (ignoreOffer) return;

          if (pc.signalingState !== "stable") {
             // Rollback if needed
             await pc.setLocalDescription({ type: "rollback" }).catch(() => {});
          }

          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          
          // Process queued ICE candidates
          for (const c of iceQueue) {
             await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
          }
          iceQueue = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          emitWebRTCAnswer(roomId, answer);
        } else if (type === "webrtcAnswer") {
          if (pc.signalingState === "have-local-offer") {
             await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
             // Process queued ICE candidates
             for (const c of iceQueue) {
                await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
             }
             iceQueue = [];
          }
        } else if (type === "iceCandidate") {
          try {
             if (pc.remoteDescription) {
               await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
             } else {
               iceQueue.push(payload.candidate);
             }
          } catch (err) {
             if (!ignoreOffer) console.error("ICE error:", err);
          }
        }
      } catch (err) {
        console.error("WebRTC Error:", err);
      }
    });

    return () => {
      off();
      pc.close();
      pcRef.current = null;
    };
  }, [roomId]); // Deliberately omit localStream here so we don't recreate PC when stream changes

  // Dynamic Track Replacement logic
  useEffect(() => {
    const pc = pcRef.current;
    if (!pc) return;

    const transceivers = pc.getTransceivers();
    
    // In WebRTC, receiver track is always present and determines the kind of transceiver
    const videoTransceiver = transceivers.find(t => t.receiver && t.receiver.track && t.receiver.track.kind === "video");
    const audioTransceiver = transceivers.find(t => t.receiver && t.receiver.track && t.receiver.track.kind === "audio");

    const newVideoTrack = localStream ? localStream.getTracks().find(t => t.kind === "video") : null;
    const newAudioTrack = localStream ? localStream.getTracks().find(t => t.kind === "audio") : null;

    if (videoTransceiver && videoTransceiver.sender) {
      videoTransceiver.sender.replaceTrack(newVideoTrack || null).catch(console.error);
    } else if (newVideoTrack) {
      pc.addTrack(newVideoTrack, localStream);
    }

    if (audioTransceiver && audioTransceiver.sender) {
      audioTransceiver.sender.replaceTrack(newAudioTrack || null).catch(console.error);
    } else if (newAudioTrack) {
      pc.addTrack(newAudioTrack, localStream);
    }
  }, [localStream]);

  return { remoteStream };
}
