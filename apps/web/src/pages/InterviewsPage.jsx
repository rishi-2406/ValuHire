import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  CalendarDays,
  Video,
  Plus,
  Play,
  Edit,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare,
  PhoneOff,
  ChevronRight
} from "lucide-react";
import { interviewService, resultsService } from "../services/api";
import { joinRoom, leaveRoom, onRoomEvent } from "../services/socket";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import ScheduleInterviewModal from "../components/ScheduleInterviewModal";

const FEEDBACK_OPTIONS = ["Strong Hire", "Hire", "No Hire", "Strong No Hire"];

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

  const role = (user?.role || "recruiter").toLowerCase();
  const days = getWeekDays(selectedDay);

  useEffect(() => {
    setLoading(true);
    interviewService.getMyInterviews()
      .then((data) => {
        const list = data.interviews || data || [];
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
      await interviewService.submitFeedback(activeRoom, { recommendation: feedback });
      toast.success("Feedback submitted", { title: "Recorded" });
    } catch (err) {
      toast.error(`Failed to submit: ${err.message}`);
    }
  };

  const handleSchedule = async (payload) => {
    try {
      const data = await interviewService.scheduleInterview({
        candidateId: payload.candidateId,
        scheduledAt: new Date(`${payload.date}T${payload.time}`).toISOString(),
        duration: payload.duration,
        role: payload.agenda || "Technical Interview"
      });
      const newInterview = data.interview || data;
      setInterviews((prev) => [newInterview, ...prev]);
      toast.success("Interview scheduled", { title: payload.date });
    } catch (err) {
      toast.error(err.message || "Failed to schedule interview");
      throw err;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar role={role === "candidate" ? "candidate" : "recruiter"} />
      <main className="workspace">
        <TopBar
          eyebrow="Recruiter Portal"
          title="Interviews & Live Room"
          actions={
            <button type="button" className="primary-button" onClick={() => setShowScheduleModal(true)}>
              <Plus size={18} />
              <span>Schedule Interview</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="panel lg:col-span-2">
            <div className="panel-header">
              <div>
                <CalendarDays size={20} className="text-primary" />
                <h2>Schedule</h2>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => {
                    const d = new Date(selectedDay);
                    d.setDate(d.getDate() - 7);
                    setSelectedDay(d);
                  }}
                  aria-label="Previous week"
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>
                <span className="text-sm font-semibold text-on-surface">
                  {days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => {
                    const d = new Date(selectedDay);
                    d.setDate(d.getDate() + 7);
                    setSelectedDay(d);
                  }}
                  aria-label="Next week"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <button
                type="button"
                className="tertiary-button text-sm"
                onClick={() => setSelectedDay(new Date())}
              >
                Today
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {days.map((day) => {
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = day.toDateString() === selectedDay.toDateString();
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={
                      "flex flex-col items-center py-2 rounded-lg text-xs font-semibold transition-colors " +
                      (isSelected
                        ? "bg-primary text-white"
                        : isToday
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-light text-on-surface-variant hover:bg-surface")
                    }
                  >
                    <span className="text-[10px] uppercase">{day.toLocaleDateString(undefined, { weekday: "short" })}</span>
                    <span className="text-base font-bold mt-0.5">{day.getDate()}</span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <p className="text-sm text-on-surface-variant">Loading interviews…</p>
            ) : error ? (
              <p className="text-sm text-error">Failed to load: {error}</p>
            ) : interviews.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No interviews scheduled"
                description="Schedule your first interview to start collaborating with candidates."
                primaryAction={{ label: "Schedule interview", icon: <Plus size={18} />, onClick: () => setShowScheduleModal(true) }}
              />
            ) : (
              <div className="stack">
                {interviews.map((interview) => {
                  const id = interview.id || interview.interviewId;
                  const isActive = activeRoom === id;
                  return (
                    <div
                      key={id}
                      className={"moderation-row " + (isActive ? "border-2 border-primary" : "")}
                    >
                      <div className="moderation-info">
                        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {(interview.candidateName || interview.name || "C").charAt(0)}
                        </div>
                        <div>
                          <strong>{interview.candidateName || interview.name || "Candidate"}</strong>
                          <span>
                            {interview.role || interview.position} • {interview.scheduledAt
                              ? new Date(interview.scheduledAt).toLocaleString()
                              : interview.time || "TBD"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={isActive ? "secondary-button" : "primary-button"}
                        onClick={() => (isActive ? handleLeaveRoom() : handleJoinRoom(id))}
                      >
                        {isActive ? (
                          <>
                            <PhoneOff size={16} />
                            <span>Leave</span>
                          </>
                        ) : (
                          <>
                            <Video size={16} />
                            <span>{interview.action || "Join Call"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <Video size={20} className="text-primary" />
                <h2>Live Room</h2>
              </div>
              {activeRoom ? (
                <span
                  className={
                    "status-chip " +
                    (connectionStatus === "connected" ? "success" : connectionStatus === "connecting" ? "warning" : "error")
                  }
                >
                  {connectionStatus} • {participants} {participants === 1 ? "person" : "people"}
                </span>
              ) : null}
            </div>

            {activeRoom ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-video bg-inverse rounded-xl flex items-center justify-center text-inverse-on relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-container/20" />
                    <div className="relative text-center">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold mx-auto">
                        {user?.name?.charAt(0) || "Y"}
                      </div>
                      <span className="text-xs text-white mt-1 block">You</span>
                    </div>
                    {!videoOn ? (
                      <VideoOff size={20} className="absolute top-2 right-2 text-white opacity-80" />
                    ) : null}
                  </div>
                  <div className="aspect-video bg-inverse rounded-xl flex items-center justify-center text-inverse-on relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-secondary-container/20" />
                    <div className="relative text-center">
                      {participants > 1 ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center text-lg font-bold mx-auto">
                            C
                          </div>
                          <span className="text-xs text-white mt-1 block">Candidate</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                            <Clock size={20} className="text-white" />
                          </div>
                          <span className="text-xs text-white mt-1 block opacity-80">Waiting…</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMicOn(!micOn)}
                    className={"icon-button w-11 h-11 " + (micOn ? "" : "bg-error-coral text-white hover:bg-error-coral hover:text-white")}
                    aria-label={micOn ? "Mute mic" : "Unmute mic"}
                  >
                    {micOn ? <Mic size={18} /> : <MicOff size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoOn(!videoOn)}
                    className={"icon-button w-11 h-11 " + (videoOn ? "" : "bg-error-coral text-white hover:bg-error-coral hover:text-white")}
                    aria-label={videoOn ? "Stop video" : "Start video"}
                  >
                    {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
                  </button>
                  <button type="button" className="icon-button w-11 h-11" aria-label="Share screen">
                    <ScreenShare size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleLeaveRoom}
                    className="bg-error-coral text-white w-11 h-11 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    aria-label="End call"
                  >
                    <PhoneOff size={18} />
                  </button>
                </div>

                <div className="bg-code-bg-dark rounded-lg p-3">
                  <pre className="text-slate-200 text-xs font-mono overflow-x-auto">
{`socket.on("codeChange", syncEditor)
socket.on("cursorMove", updateCursor)
socket.on("webrtcOffer", connectVideo)
socket.on("languageChange", updateLanguage)`}
                  </pre>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-on-surface">Recommendation</span>
                    <select
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="px-3 h-10 border border-outline rounded-lg text-sm bg-white"
                    >
                      {FEEDBACK_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="w-full primary-button"
                    onClick={handleSubmitFeedback}
                  >
                    <CheckCircle2 size={16} />
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Video size={28} />
                </div>
                <p className="text-sm text-on-surface-variant mb-2">No active session</p>
                <p className="text-xs text-on-surface-variant">Join an interview to start the live room</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <ScheduleInterviewModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleSchedule}
        candidates={candidates}
      />
    </div>
  );
}
