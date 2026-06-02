import { useAuth } from "../hooks/useAuth";
import {
  CalendarClock,
  Video,
  LogOut,
  LayoutDashboard,
  Megaphone,
  BarChart3,
  User,
  Settings,
  UserCircle,
  Play,
  Edit,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

const interviews = [
  { id: 1, name: "Anika Rao", role: "React Platform Engineer", time: "Today 14:30", status: "scheduled", action: "Join Call", primary: true },
  { id: 2, name: "Miguel Santos", role: "Full-stack Engineer", time: "Tomorrow 10:00", status: "scheduled", action: "Prep Notes", primary: false },
  { id: 3, name: "Priya Menon", role: "Backend Engineer", time: "Friday 16:00", status: "scheduled", action: "Prep Notes", primary: false }
];

export default function InterviewsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed left-0 top-0 h-full w-[220px] bg-surface-container-lowest border-r border-outline-variant flex flex-col py-md px-sm z-50">
        <div className="mb-xl px-sm">
          <img
            alt="ValuHire Logo"
            className="h-10 w-auto mb-xs"
            src="https://lh3.googleusercontent.com/aida/ADBb0uiyvMoXItf1fpE9azuWp8utjz8-9RmH3U62X5R8-Pe6TJS9ujFKQhshSel309LNBb89qmKkwZgKYbiDS8WrPFuXuOcAqT-KmQ-LKiRGzjptchEV7uBbRdrx2nGTNawu6mbzjb9Jo6AlDcPHG1eVHshYObua9wi9Cn749MqZT9okkwTvqCOM8dmXhX7SvmegpukvFi4Uc05TS74-HZJBmhP_bhptzFm272ryY4zGRrfFXot4xxXYIoPmDho"
          />
          <h1 className="text-headline-md text-primary font-bold">ValuHire</h1>
          <p className="text-label-sm text-on-surface-variant">Recruiter Portal</p>
        </div>

        <nav className="flex-1 space-y-1">
          <a
            className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded"
            href="#"
          >
            <LayoutDashboard size={20} />
            <span className="text-label-md">Dashboard</span>
          </a>
          <a
            className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded"
            href="#"
          >
            <Megaphone size={20} />
            <span className="text-label-md">Campaigns</span>
          </a>
          <a
            className="flex items-center gap-sm px-sm py-xs text-primary font-bold bg-primary-fixed/20 cursor-pointer rounded"
            href="#"
          >
            <CalendarClock size={20} />
            <span className="text-label-md">Interviews</span>
          </a>
          <a
            className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded"
            href="#"
          >
            <BarChart3 size={20} />
            <span className="text-label-md">Results</span>
          </a>
        </nav>

        <div className="mt-auto pt-md border-t border-outline-variant/30 space-y-1">
          <a
            className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded"
            href="#"
          >
            <UserCircle size={20} />
            <span className="text-label-md">Profile</span>
          </a>
          <a
            className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded"
            href="#"
          >
            <Settings size={20} />
            <span className="text-label-md">Settings</span>
          </a>
          <div className="mt-md flex items-center gap-sm px-sm pt-sm border-t border-outline-variant/20">
            <div className="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || "JD"}
            </div>
            <div className="flex flex-col">
              <span className="text-label-md text-on-surface">{user?.name || "Jane Doe"}</span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                {user?.role || "Lead Recruiter"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-[220px] min-h-screen">
        <header className="fixed top-0 right-0 w-[calc(100%-220px)] bg-surface h-16 px-lg flex justify-between items-center z-40 border-b border-outline-variant">
          <div className="flex flex-col">
            <span className="text-label-sm text-on-surface-variant/80">V1 MVP</span>
            <h2 className="text-headline-md text-primary">Interview Schedule and Live Room</h2>
          </div>
          <button className="flex items-center gap-xs px-lg py-md bg-primary text-on-primary text-label-md rounded hover:opacity-90 transition-all">
            <CalendarClock size={18} />
            Schedule Interview
          </button>
        </header>

        <div className="mt-16 p-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
              <div className="flex items-center gap-sm mb-lg">
                <CalendarClock className="text-primary" size={20} />
                <h3 className="text-title-lg text-on-surface">Interview Schedule</h3>
              </div>
              <div className="space-y-md">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-md bg-surface border border-outline-variant rounded-lg"
                  >
                    <div className="flex items-center gap-md">
                      <div className="h-12 w-12 bg-surface-variant rounded-lg flex items-center justify-center">
                        <User className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface">{interview.name}</p>
                        <p className="text-body-sm text-on-surface-variant">
                          {interview.role} • {interview.time}
                        </p>
                      </div>
                    </div>
                    <button
                      className={`px-md py-sm rounded text-label-sm ${
                        interview.primary
                          ? "bg-primary text-on-primary"
                          : "border border-primary text-primary"
                      }`}
                    >
                      {interview.action}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
              <div className="flex items-center gap-sm mb-lg">
                <Video className="text-primary" size={20} />
                <h3 className="text-title-lg text-on-surface">Live Technical Room</h3>
              </div>
              <div className="video-grid mb-lg">
                <div className="bg-inverse-surface rounded-lg h-32 flex items-center justify-center">
                  <span className="text-inverse-on-surface text-body-sm">Interviewer</span>
                </div>
                <div className="bg-inverse-surface rounded-lg h-32 flex items-center justify-center">
                  <span className="text-inverse-on-surface text-body-sm">Candidate</span>
                </div>
              </div>
              <div className="bg-[#1e1e1e] rounded-lg p-md mb-lg">
                <pre className="text-[#d4d4d4] text-body-sm font-mono overflow-x-auto">
{`socket.on("codeChange", syncEditor)
socket.on("cursorMove", updateCursor)
socket.on("webrtcOffer", connectVideo)
socket.on("languageChange", updateLanguage)`}
                </pre>
              </div>
              <div className="space-y-md">
                <div className="flex justify-between items-center">
                  <span className="text-label-md text-on-surface-variant">Recommendation</span>
                  <span className="text-label-md text-primary font-semibold">Strong Hire</span>
                </div>
                <button className="w-full bg-primary text-on-primary py-md rounded text-label-md hover:opacity-90 transition-all">
                  Submit Feedback
                </button>
              </div>
            </section>
          </div>

          <section className="mt-6 bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
            <h3 className="text-title-lg text-on-surface mb-lg">Upcoming This Week</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary-container text-on-primary-container rounded-lg p-md">
                <div className="text-label-sm opacity-80">Today</div>
                <div className="text-headline-md font-bold">1</div>
                <div className="text-body-sm opacity-90">Interview</div>
              </div>
              <div className="bg-surface-container-high rounded-lg p-md">
                <div className="text-label-sm text-on-surface-variant">Tomorrow</div>
                <div className="text-headline-md font-bold text-on-surface">1</div>
                <div className="text-body-sm text-on-surface-variant">Interview</div>
              </div>
              <div className="bg-surface-container-high rounded-lg p-md">
                <div className="text-label-sm text-on-surface-variant">This Week</div>
                <div className="text-headline-md font-bold text-on-surface">3</div>
                <div className="text-body-sm text-on-surface-variant">Total</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}