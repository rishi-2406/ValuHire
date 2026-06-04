import { useState, useEffect, useRef } from "react";
import { onRoomEvent, emitWebRTCOffer, emitWebRTCAnswer, emitICECandidate } from "../services/socket";

export function useWebRTC(roomId, localStream) {
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

    let negotiationPending = false;

    pc.onnegotiationneeded = async () => {
      if (pc.signalingState !== "stable") {
        negotiationPending = true;
        return;
      }
      try {
        const offer = await pc.createOffer();
        // If state changed while creating offer
        if (pc.signalingState !== "stable") {
           negotiationPending = true;
           return;
        }
        await pc.setLocalDescription(offer);
        emitWebRTCOffer(roomId, offer);
      } catch (err) {
        console.error("Negotiation error:", err);
      }
    };

    pc.onsignalingstatechange = () => {
      if (pc.signalingState === "stable" && negotiationPending) {
        negotiationPending = false;
        pc.onnegotiationneeded();
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
          // When someone joins, create an offer
          if (pc.signalingState !== "stable") return;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          emitWebRTCOffer(roomId, offer);
        } else if (type === "webrtcOffer") {
          // Received an offer, answer it
          if (pc.signalingState !== "stable") {
             // Collision handling: rollback our local offer so we can accept theirs
             await pc.setLocalDescription({ type: "rollback" }).catch(() => {});
          }
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          emitWebRTCAnswer(roomId, answer);
        } else if (type === "webrtcAnswer") {
          // Received an answer
          if (pc.signalingState === "have-local-offer") {
             await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          }
        } else if (type === "iceCandidate") {
          // Received an ICE candidate
          if (pc.remoteDescription) {
             await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
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
    if (!pc || !localStream) return;

    const transceivers = pc.getTransceivers();
    
    const videoTransceiver = transceivers.find(t => t.receiver && t.receiver.track && t.receiver.track.kind === "video");
    const audioTransceiver = transceivers.find(t => t.receiver && t.receiver.track && t.receiver.track.kind === "audio");

    const newVideoTrack = localStream.getTracks().find(t => t.kind === "video");
    const newAudioTrack = localStream.getTracks().find(t => t.kind === "audio");

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
