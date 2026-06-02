import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import {
  BarChart,
  Share,
  Download,
  Search,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  Megaphone,
  Video,
  BarChart3,
  User,
  Settings,
  UserCircle
} from "lucide-react";
import { resultsService } from "../services/api";

const mockCandidates = [
  {
    rank: 1,
    name: "Anika Rao",
    role: "Frontend Engineer",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBF172UsUibOCH7gJanZkCahzMamyGkI8cjEUFdfsdxlkWTbR6EsA_VXHqJG9ZQoPBoG3eBJIYc-wiALp78Fu-8jeY2lDnWu4l-SKwAIzUikAKEwiMyp5P1biCMrNwvOXZfEs8NOpBynZPdnXyu6uf2dupDgV_brD6WqD2Fp3oafmElyiDtoQJUuLzZKKdn6DMAB6x8iME7UJ8yxhpf8SJHew3BwpusE4W1zBkiya5BX9Oxnay7723795ghv1ewKZPkkleHN_csWR4",
    score: 92,
    integrityFlags: 1,
    status: "Top match",
    accent: true
  },
  {
    rank: 2,
    name: "Miguel Santos",
    role: "Full-stack Engineer",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4GLbNA_oQ6RA0pc0sBm8Vgs-ux9DQvuYxZSuG-5Sdf9eW-fW_TO4K1x6Sa5M5DDtR_ooYeWOpywBL1wCEZvrzlZmRvvu3BwbmfyViFRAl44AZ4WGMNycXkU3qyVTVzomiXBhgXtbPvt8DkPwjW3CUqTsJnekB9t8aPE09T25JTHakGFDtYWdHoPy7MdpoJtRrwNW2j6iqH_IOrFYFk3YcEz_DjLdyR6ZakOqGZRfzidjKzs71H8pmGp3ca-7F3h5s2erzfIB6Lhk",
    score: 87,
    integrityFlags: 3,
    status: "Review"
  },
  {
    rank: 3,
    name: "Priya Menon",
    role: "Backend Engineer",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBRQ9lt0N33dYsyBA3bCWDA-knETCQpnPSZ2uBH7whfwP5NqrN93LG6F07H17R1itrJ4CY2B1JAWTJC9WZcO9-Mfl2mkZ_Uzxd7sgZMyN4G471l1aLkS0PPZCWURHQw99sTo4TuNpyX4HwPX0K7qMs5xNYFDJwyuuJjksDBfViqYxpoj1CdfPH7AKW-A6MnTz2ZVYNkMxJypwplqyR0vS2LqVKEU5RWeMh3-9gTJ9GBo9SlZ2HaWM-L1xowGypArnsCtClgeH9D8E",
    score: 81,
    integrityFlags: 0,
    status: "Interview"
  }
];

export default function ResultsPage() {
  const { user, logout } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    resultsService.getMyResults()
      .then(data => {
        const ranked = data.results || data || [];
        setCandidates(ranked.length > 0 ? ranked : mockCandidates);
      })
      .catch(() => setCandidates(mockCandidates))
      .finally(() => setLoading(false));
  }, []);

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
            <Dashboard size={20} />
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
            className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded"
            href="#"
          >
            <Video size={20} />
            <span className="text-label-md">Interviews</span>
          </a>
          <a
            className="flex items-center gap-sm px-sm py-xs text-primary font-bold bg-primary-fixed/20 cursor-pointer rounded"
            href="#"
          >
            <BarChart3 size={20} style={{ fontVariationSettings: "'FILL' 1" }} />
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
            <h2 className="text-headline-md text-primary">Results and Rankings</h2>
          </div>
          <div className="flex items-center gap-md">
            <button className="flex items-center gap-xs px-md py-xs border border-primary text-primary text-label-md rounded hover:bg-primary/5 transition-all">
              <Share size={18} />
              Share
            </button>
            <button className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary text-label-md rounded hover:opacity-90 transition-all">
              <Download size={18} />
              Export
            </button>
          </div>
        </header>

        <div className="mt-16 p-lg space-y-lg">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant p-md rounded flex items-center justify-between">
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  <BarChart className="text-primary-container" size={20} />
                  <h3 className="text-title-md text-on-surface">Campaign ranking</h3>
                </div>
                <p className="text-body-sm text-on-surface-variant max-w-md">
                  Aggregated evaluation data from the Q3 Technical Talent Pool. Rankings are weighted by core
                  technical proficiency and behavioral signals.
                </p>
              </div>
              <div className="flex items-end gap-sm h-12">
                <div className="w-3 bg-primary/20 h-[40%] rounded-t-sm" />
                <div className="w-3 bg-primary/40 h-[60%] rounded-t-sm" />
                <div className="w-3 bg-primary/60 h-[90%] rounded-t-sm" />
                <div className="w-3 bg-primary h-[100%] rounded-t-sm" />
                <div className="w-3 bg-primary/30 h-[50%] rounded-t-sm" />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 bg-primary-container text-on-primary-container p-md rounded border border-primary flex flex-col justify-between">
              <div>
                <p className="text-label-sm uppercase tracking-wider opacity-80">Campaign Maturity</p>
                <h4 className="text-headline-lg">94% Complete</h4>
              </div>
              <div className="w-full bg-on-primary-container/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-on-primary-container h-full w-[94%]" />
              </div>
            </div>
          </div>

          <section className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
              <div className="flex gap-md">
                <div className="flex items-center gap-xs px-sm py-1 bg-surface-container-high rounded cursor-pointer">
                  <span className="text-label-md text-primary">All Candidates</span>
                  <span className="text-label-sm bg-primary text-on-primary px-1.5 rounded-full">142</span>
                </div>
                <div className="flex items-center gap-xs px-sm py-1 hover:bg-surface-container transition-colors rounded cursor-pointer">
                  <span className="text-label-md text-on-surface-variant">High Integrity</span>
                </div>
              </div>
              <div className="relative group">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-outline" size={18} />
                <input
                  className="pl-8 pr-sm py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-body-sm w-64 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="Filter by name..."
                  type="text"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 text-on-surface-variant border-b border-outline-variant">
                    <th className="px-md py-sm text-label-md uppercase tracking-wider w-12 text-center">#</th>
                    <th className="px-md py-sm text-label-md uppercase tracking-wider">Candidate & Role</th>
                    <th className="px-md py-sm text-label-md uppercase tracking-wider text-center">Score</th>
                    <th className="px-md py-sm text-label-md uppercase tracking-wider text-center">Integrity</th>
                    <th className="px-md py-sm text-label-md uppercase tracking-wider">Status</th>
                    <th className="px-md py-sm text-label-md uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {candidates.map((candidate) => (
                    <tr
                      key={candidate.rank}
                      className={`transition-colors ${candidate.accent ? "border-l-4 border-l-primary" : ""}`}
                    >
                      <td className={`px-md py-md text-center font-bold ${candidate.accent ? "text-primary" : "text-on-surface-variant"}`}>
                        {candidate.rank}
                      </td>
                      <td className="px-md py-md">
                        <div className="flex items-center gap-md">
                          <img
                            alt={candidate.name}
                            className="w-10 h-10 rounded-lg object-cover"
                            src={candidate.avatar}
                          />
                          <div>
                            <div className="text-title-md text-on-surface leading-none mb-0.5">
                              {candidate.name}
                            </div>
                            <div className="text-body-sm text-on-surface-variant">{candidate.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-md text-center">
                        <div
                          className={`inline-flex items-center justify-center w-12 h-12 rounded-full border-2 font-bold text-title-md ${
                            candidate.accent
                              ? "border-primary-container text-primary"
                              : "border-outline-variant text-on-surface-variant"
                          }`}
                        >
                          {candidate.score}%
                        </div>
                      </td>
                      <td className="px-md py-md text-center">
                        <div className="flex flex-col items-center">
                          {candidate.integrityFlags > 0 ? (
                            <>
                              <div className="flex gap-0.5">
                                {[...Array(candidate.integrityFlags)].map((_, i) => (
                                  <AlertTriangle key={i} className="text-secondary" size={20} />
                                ))}
                              </div>
                              <span className="text-label-sm text-on-surface-variant">
                                {candidate.integrityFlags} Flag{candidate.integrityFlags > 1 ? "s" : ""}
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="text-primary-container/40" size={20} />
                              <span className="text-label-sm text-on-surface-variant">0 Flags</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-md py-md">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-label-md ${
                            candidate.status === "Top match"
                              ? "bg-primary-fixed text-on-primary-fixed-variant"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              candidate.status === "Top match" ? "bg-primary" : "bg-outline"
                            }`}
                          />
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-md py-md text-right">
                        <button className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-md bg-surface-container-low/20 border-t border-outline-variant flex justify-between items-center">
              <span className="text-label-sm text-on-surface-variant">
                Showing 3 of 142 ranked candidates
              </span>
              <div className="flex items-center gap-xs">
                <button className="p-1 rounded hover:bg-surface-container-high transition-colors disabled:opacity-30" disabled>
                  <ChevronLeft size={20} />
                </button>
                <span className="text-label-md px-2 py-1 bg-primary text-on-primary rounded">1</span>
                <button className="p-1 rounded hover:bg-surface-container-high transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </section>

          <div className="bg-surface-container-highest/30 border border-primary/20 p-md rounded flex gap-md items-start">
            <div className="p-sm bg-primary/10 rounded-full">
              <Sparkles className="text-primary" size={20} />
            </div>
            <div>
              <h5 className="text-title-md text-on-surface">ValuHire AI Insight</h5>
              <p className="text-body-sm text-on-surface-variant mt-xs">
                Anika Rao shows a 98% correlation with your top performing existing engineers. Despite the
                minor integrity flag (identified as a dual-screen detection during the React component task),
                her technical depth is the highest in this cohort.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}