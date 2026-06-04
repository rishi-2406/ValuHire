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
  Filter,
  FileText,
  Save,
  Code
} from "lucide-react";
import { interviewService, resultsService } from "../services/api";
import { joinRoom, leaveRoom, onRoomEvent } from "../services/socket";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import ScheduleInterviewModal from "../components/ScheduleInterviewModal";

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

        <div className="flex gap-6 h-[calc(100vh-6rem)] mt-6 px-6 pb-6 overflow-hidden max-w-[1600px] mx-auto">
          {/* Left Column: Schedule & List */}
          <aside className="w-1/3 min-w-[320px] bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col shadow-sm overflow-hidden flex-shrink-0 flex-1">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
              <h2 className="text-title-lg font-semibold text-on-surface">Interview Management</h2>
              <button className="text-primary hover:bg-surface-container-high p-2 rounded-lg transition-colors flex items-center gap-2">
                <Filter size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-outline-variant bg-surface">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <button type="button" className="icon-button" onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() - 7); setSelectedDay(d); }}>
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                  <span className="text-sm font-semibold text-on-surface">
                    {days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                  <button type="button" className="icon-button" onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() + 7); setSelectedDay(d); }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
                <button type="button" className="text-xs font-semibold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors" onClick={() => setSelectedDay(new Date())}>
                  Today
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
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
                          ? "bg-primary-container/20 text-primary"
                          : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container")
                      }
                    >
                      <span className="text-[10px] uppercase">{day.toLocaleDateString(undefined, { weekday: "short" })}</span>
                      <span className="text-sm mt-0.5">{day.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 bg-surface">
              {loading ? (
                <p className="text-sm text-on-surface-variant">Loading interviews…</p>
              ) : error ? (
                <p className="text-sm text-error">Failed to load: {error}</p>
              ) : interviews.length === 0 ? (
                <EmptyState
                  illustration="no-interviews"
                  title="No interviews scheduled"
                  description="Schedule your first interview to start collaborating with candidates."
                  primaryAction={{ label: "Schedule interview", icon: <Plus size={18} />, onClick: () => setShowScheduleModal(true) }}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider pl-1">Scheduled</h3>
                  {interviews.map((interview) => {
                    const id = interview.id || interview.interviewId;
                    const isActive = activeRoom === id;
                    const isPast = new Date(interview.scheduledAt) < new Date();
                    
                    return (
                      <div
                        key={id}
                        className={"bg-surface-container-lowest rounded-lg p-4 border shadow-sm transition-shadow " + (isActive ? "border-primary ring-1 ring-primary" : "border-outline-variant hover:shadow-md")}
                      >
                        {isActive && (
                          <div className="absolute -top-2.5 right-4 bg-error text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> LIVE
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {(interview.candidateName || interview.name || "C").charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-on-surface">{interview.candidateName || interview.name || "Candidate"}</h4>
                              <p className="text-xs text-on-surface-variant">{interview.role || interview.position}</p>
                            </div>
                          </div>
                          {!isActive && (
                            <span className="bg-surface-container-low text-primary px-2 py-1 rounded text-[10px] font-semibold uppercase">
                              {isPast ? "Completed" : "Scheduled"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-4 mt-3 bg-surface p-2 rounded">
                          <Clock size={16} />
                          {interview.scheduledAt
                            ? new Date(interview.scheduledAt).toLocaleString()
                            : interview.time || "TBD"}
                        </div>
                        
                        <button
                          type="button"
                          className={"w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors " + (isActive ? "bg-surface-container-highest text-primary hover:bg-surface-container-high border border-outline-variant" : "bg-primary text-white hover:bg-primary/90")}
                          onClick={() => (isActive ? handleLeaveRoom() : handleJoinRoom(id))}
                        >
                          {isActive ? (
                            <>
                              <PhoneOff size={18} />
                              Leave Call
                            </>
                          ) : (
                            <>
                              <Video size={18} />
                              {interview.action || "Join Call"}
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Right Column: Active Live Room / Assessment Panel */}
          {activeRoom ? (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">
              {/* Top: Video Call Area */}
              <div className="bg-inverse-surface rounded-xl relative overflow-hidden h-[45%] shadow-md border border-outline-variant flex flex-col">
                <div className="flex-1 bg-gray-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {participants > 1 ? (
                      <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                        C
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                          <Clock size={24} className="text-white" />
                        </div>
                        <span className="text-sm text-white/80">Waiting for candidate...</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white font-semibold text-xs px-2 py-1 rounded backdrop-blur-sm">
                    Candidate
                  </div>
                </div>
                
                {/* PIP (Self) */}
                <div className="absolute top-4 right-4 w-48 aspect-video bg-gray-800 rounded-lg border-2 border-surface-variant overflow-hidden shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">
                      {user?.name?.charAt(0) || "Y"}
                    </div>
                  </div>
                  {!videoOn && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><VideoOff size={24} className="text-white/50" /></div>}
                  <div className="absolute bottom-1 left-1 bg-black/50 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">You</div>
                </div>

                {/* Video Controls */}
                <div className="bg-surface/90 backdrop-blur border-t border-outline-variant p-3 flex justify-center space-x-4">
                  <button className={"p-3 rounded-full transition-colors " + (micOn ? "bg-surface-container hover:bg-surface-container-high text-on-surface" : "bg-error text-white")} onClick={() => setMicOn(!micOn)}>
                    {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                  <button className={"p-3 rounded-full transition-colors " + (videoOn ? "bg-surface-container hover:bg-surface-container-high text-on-surface" : "bg-error text-white")} onClick={() => setVideoOn(!videoOn)}>
                    {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                  <button className="p-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors">
                    <ScreenShare size={20} />
                  </button>
                  <button className="p-3 rounded-full bg-error text-white hover:bg-error/90 transition-opacity shadow-sm" onClick={handleLeaveRoom}>
                    <PhoneOff size={20} />
                  </button>
                </div>
              </div>

              {/* Bottom: Assessment Panel (Recommendation & Editor Sync) */}
              <div className="flex-1 flex gap-6 min-h-0">
                {/* Candidate Code View */}
                <div className="flex-[2] bg-code-bg-dark rounded-xl border border-outline-variant flex flex-col overflow-hidden shadow-sm">
                  <div className="bg-[#1E293B] border-b border-[#334155] p-2 flex items-center px-4">
                    <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
                      <Code size={16} className="text-primary" />
                      Live Editor View
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-slate-300">
                    <pre className="whitespace-pre-wrap">{`// Listening for candidate code updates...
socket.on("codeChange", syncEditor)
`}</pre>
                  </div>
                </div>

                {/* Scoring & Notes */}
                <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-outline-variant bg-surface-container-lowest">
                    <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Evaluation</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Internal Recommendation</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {FEEDBACK_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setFeedback(opt)}
                            className={"py-2 border rounded-md text-sm font-semibold transition-all " + (feedback === opt ? (opt.includes("No") ? "bg-error-container text-on-error-container border-error" : "bg-primary-container text-on-primary-container border-primary") : "border-outline-variant text-on-surface hover:bg-surface-container")}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Private Notes</h3>
                      <textarea
                        className="flex-1 w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none shadow-inner"
                        placeholder="Jot down notes here. Candidate cannot see this."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
                    <button className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2" onClick={handleSubmitFeedback}>
                      <Save size={18} />
                      Submit Evaluation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Video size={36} />
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">No active session</h2>
              <p className="text-sm text-on-surface-variant max-w-md">
                Select an upcoming interview from the schedule to join the live room, review notes, and evaluate candidates.
              </p>
            </div>
          )}
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
