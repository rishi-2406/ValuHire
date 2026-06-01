import React from "react";
import { createRoot } from "react-dom/client";
import { Activity, Building2, Code2, FileCheck2, ShieldCheck, Video } from "lucide-react";
import "./styles.css";

const modules = [
  {
    title: "Recruiter Console",
    description: "Create campaigns, build assessments, invite candidates, and review rankings.",
    icon: Building2
  },
  {
    title: "Candidate Assessments",
    description: "Timed MCQ and coding tests with language selection and submission history.",
    icon: FileCheck2
  },
  {
    title: "Docker Execution",
    description: "Queued Python, JavaScript, C++, and Java execution through runner workers.",
    icon: Code2
  },
  {
    title: "Live Interviews",
    description: "Video calls paired with collaborative coding and interviewer feedback.",
    icon: Video
  },
  {
    title: "Light Integrity",
    description: "Focus, fullscreen, tab-switch, and copy/paste events for assessment sessions.",
    icon: ShieldCheck
  },
  {
    title: "Past Performance",
    description: "Scores, rankings, and attempt history for recruiter and candidate views.",
    icon: Activity
  }
];

function App() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-ink">
      <section className="border-b border-[#d8ddd4] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-mint">ValuHire</p>
            <h1 className="text-2xl font-semibold tracking-normal">Technical hiring workspace</h1>
          </div>
          <div className="rounded border border-[#d8ddd4] px-3 py-2 text-sm text-steel">Phase 1 scaffold</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="max-w-3xl text-4xl font-semibold tracking-normal">
            Assess candidates, run code, and interview live from one recruiter-first platform.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-steel">
            This foundation is ready for auth, campaigns, MCQ plus coding assessments, Docker scoring,
            and video interview rooms with shared editors.
          </p>
        </div>
        <div className="grid gap-3 rounded border border-[#d8ddd4] bg-white p-4">
          <div className="flex items-center justify-between border-b border-[#e8ebe5] pb-3">
            <span className="font-medium">Local services</span>
            <span className="text-sm text-mint">planned</span>
          </div>
          <ServiceRow name="React web" value=":5173" />
          <ServiceRow name="Express API" value=":4000" />
          <ServiceRow name="PostgreSQL" value=":5432" />
          <ServiceRow name="Redis" value=":6379" />
          <ServiceRow name="Runner worker" value="BullMQ" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-12 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard key={module.title} module={module} />
        ))}
      </section>
    </main>
  );
}

function ServiceRow({ name, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-steel">{name}</span>
      <span className="font-mono text-ink">{value}</span>
    </div>
  );
}

function ModuleCard({ module }) {
  const Icon = module.icon;

  return (
    <article className="rounded border border-[#d8ddd4] bg-white p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded bg-[#eaf6f0] text-mint">
        <Icon size={21} />
      </div>
      <h3 className="text-lg font-semibold">{module.title}</h3>
      <p className="mt-2 text-sm leading-6 text-steel">{module.description}</p>
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);
