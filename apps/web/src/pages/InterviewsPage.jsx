import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  CalendarDays,
  Video,
  Plus,
  CheckCircle2,
  Clock,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare,
  PhoneOff,
  ChevronRight,
  ChevronLeft,
  Filter,
  FileText,
  Save,
  Code,
  User,
  Eye,
  Calendar,
  Settings,
  Wifi,
  ArrowRight
} from "lucide-react";
import { interviewService, resultsService } from "../services/api";
import { joinRoom, leaveRoom, onRoomEvent } from "../services/socket";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import ScheduleInterviewModal from "../components/ScheduleInterviewModal";
import InterviewLobby from "../components/InterviewLobby";
import InterviewSchedule from "../components/InterviewSchedule";

const FEEDBACK_OPTIONS = ["Strong Hire", "Hire", "No Hire", "Strong No"];

function getWeekDays(reference = new Date()) {
  const start = new Date(reference);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

export default function InterviewsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [participants, setParticipants] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [feedback, setFeedback] = useState("Strong Hire");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [notes, setNotes] = useState("");

  const role = (user?.role || "recruiter").toLowerCase();
  const days = getWeekDays(selectedDay);

  useEffect(() => {
    setLoading(true);
    interviewService.getMyInterviews()
      .then((data) => {
        // Backend returns { slots: [...] }
        const list = data.slots || data.interviews || data || [];
        setInterviews(list);
      })
      .catch((err) => {
        setError(err.message || "Could not load interviews");
        setInterviews([]);
      })
      .finally(() => setLoading(false));

    resultsService.getMyResults().catch(() => ({})).then((data) => {
      const ranked = data.results || data || [];
      if (ranked.length > 0) {
        setCandidates(
          ranked.map((r, i) => ({
            id: r.id || r.userId || i,
            name: r.name || r.candidateName || `Candidate ${i + 1}`,
            role: r.role || r.position
          }))
        );
      }
    });
  }, []);

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

  const handleSchedule = async (payload) => {
    // Backend POST /interviews needs: { campaignId, candidateId, startsAt, endsAt }
    // The modal returns: { date, time, duration, type, attendees, notes }
    // We derive startsAt/endsAt from date+time+duration
    try {
      const startsAt = new Date(`${payload.date}T${payload.time}`).toISOString();
      const durationMin = parseInt(payload.duration) || 60;
      const endsAt = new Date(new Date(startsAt).getTime() + durationMin * 60000).toISOString();
      // candidateId comes from the first attendee that isn't the current user, or falls back to payload.candidateId
      const candidateId = payload.candidateId || (payload.attendees?.[0]?.id);
      const campaignId = payload.campaignId;

      if (!campaignId || !candidateId) {
        toast.warning("Please select a candidate and campaign to schedule.");
        return;
      }

      const data = await interviewService.scheduleInterview({ campaignId, candidateId, startsAt, endsAt });
      const newSlot = data.slot || data.interview || data;
      setInterviews((prev) => [newSlot, ...prev]);
      toast.success("Interview scheduled", { title: payload.date });
    } catch (err) {
      toast.error(err.message || "Failed to schedule interview");
      throw err;
    }
  };

  return (
    <div className="app-shell bg-background text-on-background">
      <Sidebar role={role} />
      <main className="workspace">
        <TopBar
          eyebrow={role === "candidate" ? "Candidate Portal" : "Recruiter Portal"}
          title="Live Session Manager"
          actions={
            // Only recruiters can schedule new interviews
            role !== "candidate" ? (
              <button type="button" className="primary-button" onClick={() => setShowScheduleModal(true)}>
                <Plus size={18} />
                <span>Schedule</span>
              </button>
            ) : null
          }
        />

        {activeRoom ? (() => {
          const activeInterview = interviews.find(i => (i.id || i.interviewId) === activeRoom) || {};
          const initials = (activeInterview.candidate?.name || activeInterview.candidateName || activeInterview.name || "C").substring(0, 2).toUpperCase();
          
          return (
              <InterviewLobby
                activeInterview={activeInterview}
                initials={initials}
                user={user}
                videoOn={videoOn}
                setVideoOn={setVideoOn}
                micOn={micOn}
                setMicOn={setMicOn}
                onLeave={handleLeaveRoom}
                onJoin={() => navigate(`/interviews/${activeRoom}/live`)}
              />
          );
        })() : (
          <InterviewSchedule
            days={days}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            loading={loading}
            error={error}
            interviews={interviews}
            setShowScheduleModal={setShowScheduleModal}
            handleJoinRoom={handleJoinRoom}
          />
        )}
      </main>

      <ScheduleInterviewModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleSchedule}
        candidates={candidates}
        interviews={interviews}
      />
    </div>
  );
}
