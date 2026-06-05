import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Plus } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import ScheduleInterviewModal from "../components/ScheduleInterviewModal";
import InterviewLobby from "../components/InterviewLobby";
import InterviewSchedule from "../components/InterviewSchedule";
import { useInterviewsData } from "../hooks/useInterviewsData";
import { useInterviewRoom } from "../hooks/useInterviewRoom";

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
  
  const { interviews, loading, error, candidates, handleSchedule } = useInterviewsData();
  const { activeRoom, handleJoinRoom, handleLeaveRoom } = useInterviewRoom();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const role = (user?.role || "recruiter").toLowerCase();
  const days = getWeekDays(selectedDay);

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
