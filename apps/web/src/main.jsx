import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Code2,
  FileCheck2,
  KeyRound,
  LayoutDashboard,
  Link2,
  ListChecks,
  MonitorUp,
  Play,
  ShieldCheck,
  UserCheck,
  Users,
  Video
} from "lucide-react";
import "./styles.css";

const navItems = [
  { id: "login", label: "Login", icon: KeyRound },
  { id: "recruiter", label: "Recruiter", icon: LayoutDashboard },
  { id: "builder", label: "Builder", icon: ClipboardList },
  { id: "candidate", label: "Candidate", icon: UserCheck },
  { id: "assessment", label: "Assessment", icon: Code2 },
  { id: "results", label: "Results", icon: BarChart3 },
  { id: "interviews", label: "Interviews", icon: Video },
  { id: "admin", label: "Admin", icon: ShieldCheck }
];

const candidates = [
  { name: "Anika Rao", role: "Frontend Engineer", score: 92, status: "Top match", integrity: 1 },
  { name: "Miguel Santos", role: "Full-stack Engineer", score: 87, status: "Review", integrity: 3 },
  { name: "Priya Menon", role: "Backend Engineer", score: 81, status: "Interview", integrity: 0 }
];

const campaigns = [
  { title: "React Platform Engineer", applicants: 126, open: true, assessment: "MCQ + Coding, 75m" },
  { title: "Backend Node.js Engineer", applicants: 84, open: true, assessment: "Coding-heavy, 90m" },
  { title: "Graduate Developer", applicants: 212, open: false, assessment: "Aptitude + JS, 60m" }
];

function App() {
  const [page, setPage] = useState("recruiter");
  const activePage = useMemo(() => pages[page], [page]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">VH</div>
          <div>
            <strong>ValuHire</strong>
            <span>Technical hiring</span>
          </div>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={page === item.id ? "nav-item active" : "nav-item"}
                onClick={() => setPage(item.id)}
                title={item.label}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-card">
          <span className="eyebrow">Stitch source</span>
          <p>Built from the ValuHire Core design board.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">V1 MVP</span>
            <h1>{activePage.title}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" title="Run health check">
              <Activity size={18} />
            </button>
            <button className="primary-button">
              <MonitorUp size={16} />
              Preview
            </button>
          </div>
        </header>
        {activePage.component}
      </section>
    </main>
  );
}

function LoginPage() {
  return (
    <div className="two-column">
      <section className="panel auth-panel">
        <span className="eyebrow">Secure access</span>
        <h2>Sign in to manage technical assessments</h2>
        <FormRow label="Email" value="recruiter@acme.dev" />
        <FormRow label="Password" value="••••••••••••" />
        <div className="segmented">
          <button className="active">Recruiter</button>
          <button>Candidate</button>
          <button>Admin</button>
        </div>
        <button className="primary-button wide">
          <KeyRound size={16} />
          Sign in
        </button>
      </section>
      <section className="panel">
        <span className="eyebrow">Company onboarding</span>
        <DataRow label="Company" value="Pending approval" />
        <DataRow label="Access policy" value="Approved recruiters only" />
        <DataRow label="Security" value="JWT + refresh tokens" />
        <DataRow label="Admin seed" value="admin@valuhire.local" />
      </section>
    </div>
  );
}

function RecruiterDashboard() {
  return (
    <div className="stack">
      <div className="metric-grid">
        <Metric icon={Users} label="Active candidates" value="422" />
        <Metric icon={FileCheck2} label="Assessments completed" value="138" />
        <Metric icon={CalendarClock} label="Interviews this week" value="18" />
        <Metric icon={ShieldCheck} label="Integrity flags" value="12" />
      </div>
      <section className="panel">
        <PanelHeader title="Campaign pipeline" action="New campaign" icon={Building2} />
        <div className="table">
          {campaigns.map((campaign) => (
            <div className="table-row" key={campaign.title}>
              <div>
                <strong>{campaign.title}</strong>
                <span>{campaign.assessment}</span>
              </div>
              <span>{campaign.applicants} applicants</span>
              <StatusChip tone={campaign.open ? "success" : "muted"}>{campaign.open ? "Open" : "Closed"}</StatusChip>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BuilderPage() {
  return (
    <div className="builder-grid">
      <section className="panel">
        <PanelHeader title="Assessment builder" action="Save" icon={ClipboardList} />
        <FormRow label="Title" value="React platform assessment" />
        <FormRow label="Duration" value="75 minutes" />
        <FormRow label="Instructions" value="Complete MCQs first, then solve both coding tasks." />
        <div className="split-controls">
          <button className="secondary-button">
            <ListChecks size={16} />
            Add MCQ
          </button>
          <button className="secondary-button">
            <Code2 size={16} />
            Add coding task
          </button>
        </div>
      </section>
      <section className="panel">
        <PanelHeader title="Question mix" action="Invite" icon={Link2} />
        <QuestionCard title="JavaScript closures" meta="MCQ • 2 points" />
        <QuestionCard title="Implement rate limiter" meta="Coding • 20 points • 3 hidden tests" />
        <QuestionCard title="React render behavior" meta="MCQ • 3 points" />
      </section>
    </div>
  );
}

function CandidateDashboard() {
  return (
    <div className="stack">
      <section className="panel">
        <PanelHeader title="Available campaigns" action="Apply" icon={FileCheck2} />
        <div className="card-grid">
          {campaigns.filter((campaign) => campaign.open).map((campaign) => (
            <article className="mini-card" key={campaign.title}>
              <strong>{campaign.title}</strong>
              <p>{campaign.assessment}</p>
              <button className="secondary-button">Apply</button>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <PanelHeader title="Past performance" action="History" icon={BarChart3} />
        <div className="timeline">
          <DataRow label="React Platform Engineer" value="92 / 100" />
          <DataRow label="Node.js API Engineer" value="84 / 100" />
          <DataRow label="Graduate Developer" value="76 / 100" />
        </div>
      </section>
    </div>
  );
}

function AssessmentRoom() {
  return (
    <div className="assessment-grid">
      <section className="panel question-panel">
        <div className="timer-row">
          <StatusChip tone="warning">43:18 left</StatusChip>
          <StatusChip tone="muted">Python</StatusChip>
        </div>
        <h2>Implement a rate limiter</h2>
        <p>Read requests from stdin and return whether each request is accepted under the configured window.</p>
        <QuestionCard title="Visible test" meta="Input: 1 2 3 • Expected: allow allow block" />
        <QuestionCard title="Integrity monitor" meta="Focus loss, tab switch, fullscreen exit, copy/paste captured" />
      </section>
      <section className="code-panel">
        <div className="code-toolbar">
          <span>main.py</span>
          <button className="primary-button">
            <Play size={16} />
            Run
          </button>
        </div>
        <pre>{`def solve():
    events = input().split()
    print("allow allow block")

solve()`}</pre>
      </section>
    </div>
  );
}

function ResultsPage() {
  return (
    <section className="panel">
      <PanelHeader title="Campaign ranking" action="Export" icon={BarChart3} />
      <div className="table">
        {candidates.map((candidate, index) => (
          <div className="table-row accent" key={candidate.name}>
            <div>
              <strong>#{index + 1} {candidate.name}</strong>
              <span>{candidate.role}</span>
            </div>
            <span>{candidate.score}% total</span>
            <span>{candidate.integrity} flags</span>
            <StatusChip tone={index === 0 ? "success" : "muted"}>{candidate.status}</StatusChip>
          </div>
        ))}
      </div>
    </section>
  );
}

function InterviewsPage() {
  return (
    <div className="builder-grid">
      <section className="panel">
        <PanelHeader title="Interview schedule" action="Schedule" icon={CalendarClock} />
        <DataRow label="Today 14:30" value="Anika Rao • React Platform Engineer" />
        <DataRow label="Tomorrow 10:00" value="Miguel Santos • Full-stack Engineer" />
        <DataRow label="Friday 16:00" value="Priya Menon • Backend Engineer" />
      </section>
      <section className="panel live-room">
        <PanelHeader title="Live technical room" action="Join" icon={Video} />
        <div className="video-grid">
          <div>Interviewer</div>
          <div>Candidate</div>
        </div>
        <pre>{`socket.on("codeChange", syncEditor)
socket.on("webrtcOffer", connectVideo)`}</pre>
        <FormRow label="Recommendation" value="Strong hire" />
      </section>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="stack">
      <section className="panel">
        <PanelHeader title="Company approvals" action="Review" icon={Building2} />
        <DataRow label="Acme Engineering" value="Approved" />
        <DataRow label="Northstar Labs" value="Pending" />
        <DataRow label="Legacy Staffing" value="Banned" />
      </section>
      <section className="panel">
        <PanelHeader title="User moderation" action="Audit" icon={ShieldCheck} />
        <DataRow label="admin@valuhire.local" value="Admin • Active" />
        <DataRow label="recruiter@northstar.dev" value="Recruiter • Pending company" />
        <DataRow label="candidate@example.com" value="Candidate • Active" />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <article className="metric-card">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PanelHeader({ title, action, icon: Icon }) {
  return (
    <div className="panel-header">
      <div>
        <Icon size={18} />
        <h2>{title}</h2>
      </div>
      <button className="secondary-button">{action}</button>
    </div>
  );
}

function FormRow({ label, value }) {
  return (
    <label className="form-row">
      <span>{label}</span>
      <input value={value} readOnly />
    </label>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="data-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuestionCard({ title, meta }) {
  return (
    <article className="question-card">
      <CheckCircle2 size={16} />
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
    </article>
  );
}

function StatusChip({ tone = "muted", children }) {
  return <span className={`status-chip ${tone}`}>{children}</span>;
}

const pages = {
  login: { title: "Login and registration", component: <LoginPage /> },
  recruiter: { title: "Recruiter dashboard", component: <RecruiterDashboard /> },
  builder: { title: "Campaign and assessment builder", component: <BuilderPage /> },
  candidate: { title: "Candidate workspace", component: <CandidateDashboard /> },
  assessment: { title: "Timed assessment room", component: <AssessmentRoom /> },
  results: { title: "Results and rankings", component: <ResultsPage /> },
  interviews: { title: "Interview schedule and live room", component: <InterviewsPage /> },
  admin: { title: "Admin moderation", component: <AdminPage /> }
};

createRoot(document.getElementById("root")).render(<App />);
