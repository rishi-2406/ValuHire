import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  BarChart3,
  Share2,
  Download,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Video,
  X,
  Award,
  Flag
} from "lucide-react";
import { resultsService, campaignService } from "../services/api";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import { SkeletonTable } from "../components/Skeleton";

const FILTERS = [
  { id: "all", label: "All Candidates" },
  { id: "high", label: "Clean" },
  { id: "flagged", label: "Flagged" }
];

function rankCandidates(list) {
  return [...list]
    .filter((c) => typeof c.score === "number" || c.totalScore || c.percentage)
    .map((c) => ({
      ...c,
      score: c.score ?? c.totalScore ?? c.percentage ?? 0,
      name: c.name || c.candidateName || c.userName || `Candidate ${c.id?.slice(0, 6) || ""}`,
      role: c.role || c.campaignTitle || c.position || "",
      integrityFlags: c.integrityFlags ?? c.flagCount ?? 0,
      status: c.status || (c.score >= 80 ? "Top match" : c.score >= 60 ? "Review" : "Pending")
    }))
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ ...c, rank: i + 1, accent: i === 0 }));
}

export default function ResultsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const perPage = 10;

  const role = (user?.role || "recruiter").toLowerCase();
  const isCandidate = role === "candidate";

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetcher = isCandidate
      ? resultsService.getMyResults()
      : Promise.all([
          campaignService.getMyCampaigns().catch(() => ({ campaigns: [] })),
          Promise.all([])
        ]).then(async ([c]) => {
          const list = c.campaigns || c || [];
          const allResults = await Promise.all(
            list.map((camp) =>
              resultsService
                .getCampaignResults(camp.id)
                .then((r) => r.results || r || [])
                .catch(() => [])
            )
          );
          return { results: allResults.flat() };
        });

    fetcher
      .then((data) => {
        const ranked = rankCandidates(data.results || data || []);
        setCandidates(ranked);
      })
      .catch((err) => {
        setError(err.message || "Could not load results");
        setCandidates([]);
      })
      .finally(() => setLoading(false));
  }, [isCandidate, location.pathname]);

  const filtered = candidates.filter((c) => {
    if (filter === "high" && (c.integrityFlags || 0) > 0) return false;
    if (filter === "flagged" && (c.integrityFlags || 0) === 0) return false;
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const topScore = candidates.length ? Math.max(...candidates.map((c) => c.score || 0)) : 0;
  const avgScore = candidates.length ? Math.round(candidates.reduce((s, c) => s + (c.score || 0), 0) / candidates.length) : 0;
  const flagged = candidates.filter((c) => (c.integrityFlags || 0) > 0).length;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "ValuHire Results", text: "Check out these results", url: window.location.href })
        .catch(() => toast.info("Share cancelled"));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success("Link copied to clipboard"))
        .catch(() => toast.warning("Could not copy link"));
    }
  };

  const handleExport = () => {
    try {
      const headers = ["Rank", "Name", "Role", "Score", "Integrity Flags", "Status"];
      const rows = candidates.map((c) => [
        c.rank, `"${c.name}"`, `"${c.role || ""}"`, c.score, c.integrityFlags || 0, c.status || ""
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `valuhire-results-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Results exported", { title: "CSV downloaded" });
    } catch (err) {
      toast.error("Export failed");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar role={role === "candidate" ? "candidate" : "recruiter"} />
      <main className="workspace">
        <TopBar
          eyebrow="Recruiter Portal"
          title="Results & Rankings"
          onSearch={(value) => { setSearch(value); setPage(1); }}
          actions={
            <>
              <button type="button" className="secondary-button" onClick={handleShare}>
                <Share2 size={16} />
                <span>Share</span>
              </button>
              <button type="button" className="primary-button" onClick={handleExport}>
                <Download size={16} />
                <span>Export</span>
              </button>
            </>
          }
        />

        <div className="stack">
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="metric-card">
              <div className="metric-icon-wrapper"><Award size={20} /></div>
              <span>Top Score</span>
              <strong>{topScore || "—"}</strong>
            </div>
            <div className="metric-card">
              <div className="metric-icon-wrapper"><BarChart3 size={20} /></div>
              <span>Average Score</span>
              <strong>{avgScore || "—"}</strong>
            </div>
            <div className="metric-card">
              <div className="metric-icon-wrapper bg-warning-amber/10 text-warning-amber"><Flag size={20} /></div>
              <span>Flagged Cases</span>
              <strong>{flagged}</strong>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="panel lg:col-span-2">
              <div className="panel-header">
                <div>
                  <BarChart3 size={20} className="text-primary" />
                  <h2>Score distribution</h2>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">
                Top {Math.min(filtered.length, 7)} candidates by score.
              </p>
              {filtered.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-10">No data to plot.</p>
              ) : (
                <div className="flex items-end gap-2 h-32 px-4">
                  {filtered.slice(0, 7).map((c, i) => {
                    const h = c.score || 0;
                    return (
                      <div key={c.id || i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={"w-full rounded-t-md transition-all " + (i === 0 ? "bg-primary" : "bg-primary/40")}
                          style={{ height: `${Math.max(4, h)}%` }}
                          title={`${c.name}: ${c.score}`}
                        />
                        <span className="text-[10px] text-on-surface-variant truncate w-full text-center">{c.score}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-primary text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-label-md uppercase tracking-wider opacity-80">Completion</span>
                <h3 className="text-headline-lg mt-1">
                  {candidates.length > 0
                    ? `${Math.round((candidates.filter((c) => c.status === "Top match" || c.status === "COMPLETED").length / candidates.length) * 100)}%`
                    : "—"}
                </h3>
                <p className="text-sm opacity-90 mt-1">
                  {candidates.filter((c) => c.status === "Top match" || c.status === "COMPLETED").length} of {candidates.length} completed
                </p>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-white h-full transition-all"
                    style={{
                      width: `${
                        candidates.length > 0
                          ? Math.round(
                              (candidates.filter((c) => c.status === "Top match" || c.status === "COMPLETED").length / candidates.length) * 100
                            )
                          : 0
                      }%`
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => navigate(isCandidate ? "/candidate" : "/recruiter")}
                  className="mt-4 w-full bg-white text-primary py-2.5 rounded-lg text-label-md font-semibold hover:bg-surface-light transition-colors"
                >
                  {isCandidate ? "Browse campaigns" : "Back to dashboard"}
                </button>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => { setFilter(f.id); setPage(1); }}
                    className={
                      "px-3 h-9 rounded-lg text-sm font-semibold border transition-colors inline-flex items-center gap-2 " +
                      (filter === f.id
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-on-surface-variant border-outline hover:border-primary")
                    }
                  >
                    <span>{f.label}</span>
                    {f.id === "all" ? (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/20">{candidates.length}</span>
                    ) : null}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 h-10 bg-white border border-outline rounded-lg w-full md:w-72">
                <Search size={16} className="text-on-surface-variant" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Filter by name…"
                  className="flex-1 bg-transparent outline-none text-sm"
                  aria-label="Filter candidates"
                />
              </div>
            </div>

            {loading ? (
              <SkeletonTable rows={5} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No candidates match your filter"
                description="Try clearing the search or changing the filter."
                primaryAction={{ label: "Clear filters", onClick: () => { setSearch(""); setFilter("all"); } }}
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline">
                        <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider text-center w-12">#</th>
                        <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider">Candidate & Role</th>
                        <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider text-center">Score</th>
                        <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider text-center">Integrity</th>
                        <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                        <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((candidate) => (
                        <tr
                          key={candidate.id || candidate.rank}
                          onClick={() => setSelectedCandidate(candidate)}
                          className={"border-b border-outline hover:bg-surface-light transition-colors cursor-pointer " + (candidate.accent ? "border-l-4 border-l-primary" : "")}
                        >
                          <td className={"px-md py-4 text-center font-bold " + (candidate.accent ? "text-primary" : "text-on-surface-variant")}>
                            {candidate.rank}
                          </td>
                          <td className="px-md py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                                {candidate.name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <div className="text-title-md text-on-surface leading-tight">{candidate.name}</div>
                                <div className="text-body-sm text-on-surface-variant">{candidate.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-md py-4 text-center">
                            <div className={"inline-flex items-center justify-center w-12 h-12 rounded-full border-2 font-bold " + (candidate.accent ? "border-primary text-primary bg-primary/5" : "border-outline text-on-surface-variant")}>
                              {candidate.score}
                            </div>
                          </td>
                          <td className="px-md py-4 text-center">
                            {candidate.integrityFlags > 0 ? (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex gap-0.5">
                                  {[...Array(candidate.integrityFlags)].map((_, i) => (
                                    <Flag key={i} className="text-warning-amber" size={16} />
                                  ))}
                                </div>
                                <span className="text-xs text-on-surface-variant">{candidate.integrityFlags} flag{candidate.integrityFlags > 1 ? "s" : ""}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <CheckCircle2 className="text-success-green" size={20} />
                                <span className="text-xs text-on-surface-variant">Clean</span>
                              </div>
                            )}
                          </td>
                          <td className="px-md py-4">
                            <span className={"status-chip " + (candidate.status === "Top match" ? "success" : candidate.status === "Interview" ? "info" : candidate.status === "Review" ? "warning" : "muted")}>
                              {candidate.status}
                            </span>
                          </td>
                          <td className="px-md py-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedCandidate(candidate); }}
                              className="tertiary-button text-sm"
                            >
                              Details
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-md py-3 border-t border-outline flex flex-wrap justify-between items-center gap-3 bg-surface-light">
                  <span className="text-sm text-on-surface-variant">
                    Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} candidates
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="icon-button"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-semibold px-3 h-9 inline-flex items-center rounded bg-primary text-white">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="icon-button"
                      aria-label="Next page"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          {error ? (
            <div className="bg-error-coral/5 border border-error-coral/20 rounded-2xl p-4 flex gap-3 items-start">
              <div className="p-2 bg-error-coral text-white rounded-full flex-shrink-0">
                <Flag size={16} />
              </div>
              <div>
                <h5 className="text-title-md text-on-surface">Could not load results</h5>
                <p className="text-body-sm text-on-surface-variant mt-1">{error}</p>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {selectedCandidate ? (
        <div className="modal-backdrop" onClick={() => setSelectedCandidate(null)} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div>
                <h2>Candidate details</h2>
                <p>Review assessment results and next steps.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setSelectedCandidate(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-xl bg-primary text-white flex items-center justify-center text-2xl font-bold">
                  {selectedCandidate.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-title-md text-on-surface">{selectedCandidate.name}</p>
                  <p className="text-sm text-on-surface-variant">{selectedCandidate.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-outline">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase">Score</p>
                  <p className="text-title-md text-on-surface font-bold">{selectedCandidate.score}%</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase">Integrity Flags</p>
                  <p className="text-title-md text-on-surface font-bold">{selectedCandidate.integrityFlags || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase">Status</p>
                  <p className="text-title-md text-on-surface font-bold">{selectedCandidate.status}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase">Rank</p>
                  <p className="text-title-md text-on-surface font-bold">#{selectedCandidate.rank}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary-button" onClick={() => setSelectedCandidate(null)}>
                Close
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => { setSelectedCandidate(null); navigate("/interviews"); }}
              >
                <Video size={16} />
                <span>Schedule interview</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
