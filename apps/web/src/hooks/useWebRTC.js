import { useState, useEffect, useRef } from "react";
import { onRoomEvent, emitWebRTCOffer, emitWebRTCAnswer, emitICECandidate } from "../services/socket";

export function useWebRTC(roomId, localStream, localDisplayStream, isPolite = true) {
  const [remoteStreamsVersion, setRemoteStreamsVersion] = useState(0);
  const streamsRef = useRef({});
  const [localMids, setLocalMids] = useState({ cam: null, screen: null });
  const pcRef = useRef(null);
  const sendersRef = useRef({ cam: null, screen: null, audio: null });

  useEffect(() => {
    if (!roomId) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emitICECandidate(roomId, event.candidate);
      }
    };

    let makingOffer = false;
    let ignoreOffer = false;
    let iceQueue = [];

    // We will map remote tracks using their mid in the useInterviewRoom layer, 
    // but we can also just expose all incoming tracks and let useInterviewRoom map them.
    // Let's just expose a map of mid -> track
    const updateRemoteTracks = () => {
      const transceivers = pc.getTransceivers();
      let updated = false;
      transceivers.forEach(t => {
        if (t.mid && t.receiver && t.receiver.track) {
          if (!streamsRef.current[t.mid]) {
            streamsRef.current[t.mid] = new MediaStream();
            updated = true;
          }
          const stream = streamsRef.current[t.mid];
          const newTrack = t.receiver.track;
          if (!stream.getTracks().includes(newTrack)) {
            // Remove any old tracks of the same kind to prevent duplicates
            stream.getTracks().forEach(oldTrack => {
              if (oldTrack.kind === newTrack.kind) stream.removeTrack(oldTrack);
            });
            stream.addTrack(newTrack);
            updated = true;
          }
        }
      });
      if (updated) {
        setRemoteStreamsVersion(v => v + 1);
      }
    };

    pc.ontrack = updateRemoteTracks;

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
        updateRemoteTracks();
        
        // Update local mids when signaling state stabilizes (MIDs are negotiated)
        const newLocalMids = { cam: null, screen: null };
        const camTransceiver = pc.getTransceivers().find(t => t.sender === sendersRef.current.cam);
        if (camTransceiver) newLocalMids.cam = camTransceiver.mid;
        
        const screenTransceiver = pc.getTransceivers().find(t => t.sender === sendersRef.current.screen);
        if (screenTransceiver) newLocalMids.screen = screenTransceiver.mid;

        setLocalMids(prev => {
          if (prev.cam !== newLocalMids.cam || prev.screen !== newLocalMids.screen) {
            return newLocalMids;
          }
          return prev;
        });

        // Trigger a new negotiation if there are pending transceivers
        const transceivers = pc.getTransceivers();
        const needsNegotiation = transceivers.some(t => t.currentDirection !== t.direction);
        if (needsNegotiation) {
           pc.onnegotiationneeded();
        }
      }
    };

    // If local streams exist initially, add their tracks
    if (localStream) {
      const camTrack = localStream.getTracks().find(t => t.kind === "video");
      const audioTrack = localStream.getTracks().find(t => t.kind === "audio");
      if (camTrack) sendersRef.current.cam = pc.addTrack(camTrack, localStream);
      if (audioTrack) sendersRef.current.audio = pc.addTrack(audioTrack, localStream);
    }
    if (localDisplayStream) {
      const screenTrack = localDisplayStream.getTracks().find(t => t.kind === "video");
      if (screenTrack) sendersRef.current.screen = pc.addTrack(screenTrack, localDisplayStream);
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

    const newVideoTrack = localStream ? localStream.getTracks().find(t => t.kind === "video") : null;
    const newAudioTrack = localStream ? localStream.getTracks().find(t => t.kind === "audio") : null;
    const newScreenTrack = localDisplayStream ? localDisplayStream.getTracks().find(t => t.kind === "video") : null;

    const replaceOrAdd = (type, track, stream) => {
      let sender = sendersRef.current[type];
      
      if (sender) {
        sender.replaceTrack(track || null).catch(console.error);
        const transceiver = pc.getTransceivers().find(t => t.sender === sender);
        if (transceiver && track && (transceiver.direction === "recvonly" || transceiver.direction === "inactive")) {
          transceiver.direction = "sendrecv";
        }
      } else if (track) {
        sendersRef.current[type] = pc.addTrack(track, stream);
      }
    };

    replaceOrAdd("cam", newVideoTrack, localStream);
    replaceOrAdd("screen", newScreenTrack, localDisplayStream);
    replaceOrAdd("audio", newAudioTrack, localStream);

  }, [localStream, localDisplayStream]);

  return { remoteStreams: streamsRef.current, remoteStreamsVersion, localMids, pcRef };
}
