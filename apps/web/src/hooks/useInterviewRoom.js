import { useState, useEffect } from "react";
import { joinRoom, leaveRoom, onRoomEvent } from "../services/socket";
import { interviewService } from "../services/api";
import { useToast } from "./useToast";

export function useInterviewRoom() {
  const [activeRoom, setActiveRoom] = useState(null);
  const [participants, setParticipants] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [feedback, setFeedback] = useState("Strong Hire");
  const [notes, setNotes] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (!activeRoom) return;
    const room = `interview:${activeRoom}`;
    joinRoom(room);
    setConnectionStatus("connecting");
    const off = onRoomEvent(room, ({ type, payload }) => {
      if (type === "connected") {
        setConnectionStatus("connected");
        toast.success("Connected to interview room");
      }
      if (type === "disconnected") {
        setConnectionStatus("disconnected");
        toast.warning("Disconnected from room");
      }
      if (type === "presenceChanged" && payload) {
        setParticipants((p) => (payload.joined ? p + 1 : Math.max(0, p - 1)));
      }
    });
    return () => {
      off();
      leaveRoom(room);
    };
  }, [activeRoom, toast]);

  const handleJoinRoom = (interviewId) => {
    setActiveRoom(interviewId);
    setParticipants(1);
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    setParticipants(0);
    setConnectionStatus("disconnected");
    toast.info("Left interview room");
  };

  const handleSubmitFeedback = async () => {
    if (!activeRoom) {
      toast.warning("Join an interview first");
      return;
    }
    try {
      await interviewService.submitFeedback(activeRoom, { recommendation: feedback, notes });
      toast.success("Feedback submitted", { title: "Recorded" });
      handleLeaveRoom();
    } catch (err) {
      toast.error(`Failed to submit: ${err.message}`);
    }
  };

  return {
    activeRoom,
    participants,
    connectionStatus,
    feedback,
    setFeedback,
    notes,
    setNotes,
    handleJoinRoom,
    handleLeaveRoom,
    handleSubmitFeedback
  };
}
