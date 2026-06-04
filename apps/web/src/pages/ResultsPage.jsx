import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Users,
  Target,
  ShieldCheck,
  BarChart3,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
  Calendar,
  Github,
  Code,
  Linkedin,
  Globe,
  FileText,
  X,
  Video,
  CheckSquare,
  Square,
  ChevronDown,
  Clock,
  Plus
} from "lucide-react";
import { resultsService, campaignService, applicationService } from "../services/api";
import Sidebar from "../components/Sidebar";
import ScheduleInterviewModal from "../components/ScheduleInterviewModal";
import { interviewService } from "../services/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function rankCandidates(list) {
  return [...list]
    .filter((c) => typeof c.score === "number" || c.totalScore || c.percentage)
    .map((c) => ({
      ...c,
      score: c.score ?? c.totalScore ?? c.percentage ?? 0,
      mcqScore: c.mcqScore ?? 0,
      codingScore: c.codingScore ?? 0,
      mcqDurationSeconds: c.mcqDurationSeconds ?? 0,
      codingDurationSeconds: c.codingDurationSeconds ?? 0,
      name: c.name || c.session?.candidate?.name || `Candidate ${c.id?.slice(0, 6) || ""}`,
      candidateId: c.candidateId || c.session?.candidateId || c.id,
      candidateProfile: c.session?.candidate || null,
      role: c.role || c.session?.assessment?.campaign?.title || "",
      integrityFlags: c.integrityFlags ?? c.flagCount ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

function ProfileModal({ candidate, campaignId, onClose, onShortlist }) {
  const p = candidate?.candidateProfile || {};
  const name = candidate?.name || "Candidate";
  const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 800, maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-white border-b border-outline-variant/50 px-8 py-6 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center text-xl font-bold border border-[#C7D2FE] overflow-hidden">
              {p.profilePicUrl
                ? <img src={p.profilePicUrl} alt={name} className="w-full h-full object-cover" />
                : initials}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-on-surface">{name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-on-surface-variant text-sm font-medium">{candidate.role}</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${candidate.rank === 1 ? "bg-[#FEF08A] text-[#854D0E]" : "bg-surface-container-high text-on-surface"}`}>
                  #{candidate.rank} Ranked
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-8 bg-[#F8FAFC]">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Column */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              
              {/* Overall Score Card */}
              <div className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm text-center">
                <div className="text-sm font-bold text-on-surface-variant mb-2">Total Score</div>
                <div className="text-5xl font-black text-[#2563EB] mb-1">{candidate.score} <span className="text-xl font-bold opacity-70">pts</span></div>
              </div>

              {/* Contact / Links */}
              {p.resumeUrl && (
                <div className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-4 flex items-center gap-2"><Globe size={14}/> Connect</h4>
                  <div className="flex flex-col gap-3">
                    <a
                      href={p.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm font-semibold text-[#2563EB] hover:opacity-80 transition-opacity"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-outline-variant/30"><FileText size={16} /></div>
                      View Resume
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">
              
              {/* Detailed Scores */}
              <div className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-4">Assessment Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "MCQ Score", value: candidate.mcqScore, color: "bg-[#ECFDF5] text-[#059669]", duration: candidate.mcqDurationSeconds },
                    { label: "Coding Score", value: candidate.codingScore, color: "bg-[#FEF3C7] text-[#D97706]", duration: candidate.codingDurationSeconds },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 flex items-center justify-between ${s.color}`}>
                      <div>
                        <div className="text-2xl font-extrabold">{s.value} <span className="text-sm font-semibold opacity-70">pts</span></div>
                        <div className="text-xs font-semibold mt-1 opacity-80">{s.label}</div>
                      </div>
                      <div className="text-right">
                        <Clock size={16} className="inline mr-1 opacity-70"/>
                        <span className="text-xs font-bold">{Math.floor((s.duration||0)/60)}m {(s.duration||0)%60}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio & Skills */}
              {(p.bio || p.skills?.length > 0) && (
                <div className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm space-y-6">
                  {p.bio && (
                    <div>
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">About</h4>
                      <p className="text-sm text-on-surface leading-relaxed">{p.bio}</p>
                    </div>
                  )}
                  {p.skills?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">Skills & Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {p.skills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] rounded-lg text-xs font-bold shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Integrity */}
              <div className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Integrity Status</h4>
                  <p className="text-xs text-on-surface-variant">Proctoring alerts and session tracking</p>
                </div>
                {candidate.integrityFlags > 0 ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#FEF2F2] text-[#DC2626] rounded-xl text-sm font-bold border border-[#FCA5A5]">
                    <AlertTriangle size={16} /> {candidate.integrityFlags} Flags Detected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#ECFDF5] text-[#059669] rounded-xl text-sm font-bold border border-[#6EE7B7]">
                    <ShieldCheck size={16} /> Passed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/50 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-5 py-2 border border-outline-variant/80 rounded-lg text-sm font-semibold hover:bg-surface-light transition-colors">
            Close
          </button>
          {onShortlist && (
            <button
              onClick={() => { onShortlist(candidate); onClose(); }}
              className="flex items-center gap-2 px-5 py-2 bg-[#111827] text-white rounded-lg text-sm font-bold hover:bg-[#1F2937] transition-all shadow-md active:scale-95"
            >
              <Star size={14} className="text-[#FBBF24]" fill="currentColor" /> Shortlist Candidate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { campaignId } = useParams();

  const [activeTab, setActiveTab] = useState("rankings"); // "rankings" | "shortlisted"
  const [candidates, setCandidates] = useState([]);
  const [shortlistedApps, setShortlistedApps] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [minMcqScore, setMinMcqScore] = useState("");
  const [minCodingScore, setMinCodingScore] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [scheduleTarget, setScheduleTarget] = useState(null); // { candidateId, candidateName, campaignId }
  const [shortlisting, setShortlisting] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const perPage = 10;

  const role = (user?.role || "recruiter").toLowerCase();
  const isCandidate = role === "candidate";

  // Load campaigns (recruiters only)
  useEffect(() => {
    if (!isCandidate) {
      campaignService.getMyCampaigns()
        .then(data => setCampaigns(data.campaigns || data || []))
        .catch(() => setCampaigns([]));
    }
  }, [isCandidate]);

  const currentCampaign = campaigns.find(c => c.id === campaignId);
  const isCurrentlyOpen = (currentCampaign?.status || "").toUpperCase() === "OPEN";

  useEffect(() => {
    if (currentCampaign) {
      setInterviewQuestions(currentCampaign.assessment?.interviewQuestions || currentCampaign.interviewQuestions || []);
    }
  }, [currentCampaign]);

  // Load assessment results
  useEffect(() => {
    setLoading(true);
    setError(null);
    let fetcher;
    if (isCandidate) {
      fetcher = resultsService.getMyResults();
    } else if (campaignId) {
      fetcher = resultsService.getCampaignResults(campaignId).then(r => ({ results: r.results || r || [] }));
    } else {
      setLoading(false);
      return;
    }
    fetcher
      .then(data => setCandidates(rankCandidates(data.results || data || [])))
      .catch(err => { setError(err.message || "Could not load results"); setCandidates([]); })
      .finally(() => setLoading(false));
  }, [isCandidate, campaignId, location.pathname]);

  // Load shortlisted candidates
  const loadShortlisted = useCallback(async () => {
    if (!campaignId || isCandidate) return;
    setShortlistLoading(true);
    try {
      const data = await applicationService.getShortlistedCandidates(campaignId);
      setShortlistedApps(data.applications || []);
    } catch {
      setShortlistedApps([]);
    } finally {
      setShortlistLoading(false);
    }
  }, [campaignId, isCandidate]);

  useEffect(() => { loadShortlisted(); }, [loadShortlisted]);

  // Filtering
  const filtered = candidates.filter(c => {
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (minMcqScore && c.mcqScore < Number(minMcqScore)) return false;
    if (minCodingScore && c.codingScore < Number(minCodingScore)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Stats
  const totalCandidates = candidates.length;
  const avgScore = totalCandidates > 0
    ? Math.round(candidates.reduce((s, c) => s + c.score, 0) / totalCandidates) : 0;
  const topCandidate = candidates[0] || null;
  const qualifiedMatches = candidates.filter(c => c.score >= 80).length;
  const conversionRate = totalCandidates ? Math.round((qualifiedMatches / totalCandidates) * 100) : 0;
  const passedIntegrity = candidates.filter(c => c.integrityFlags === 0).length;
  const integrityPassRate = totalCandidates ? ((passedIntegrity / totalCandidates) * 100).toFixed(1) : 0;

  // Selection
  const allFilteredIds = filtered.map(c => c.candidateId).filter(Boolean);
  const allPageSelected = paged.length > 0 && paged.every(c => c.candidateId && selectedIds.has(c.candidateId));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      const next = new Set(selectedIds);
      paged.forEach(c => c.candidateId && next.delete(c.candidateId));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      paged.forEach(c => c.candidateId && next.add(c.candidateId));
      setSelectedIds(next);
    }
  };

  const toggleOne = (candidateId) => {
    const next = new Set(selectedIds);
    next.has(candidateId) ? next.delete(candidateId) : next.add(candidateId);
    setSelectedIds(next);
  };

  // Shortlist
  const handleShortlist = async (ids) => {
    if (!campaignId || ids.length === 0) return;
    setShortlisting(true);
    try {
      const data = await applicationService.shortlistCandidates(campaignId, Array.from(ids));
      const newCount = (data.results || []).filter(r => r.shortlisted).length;
      const alreadyCount = (data.results || []).filter(r => r.alreadyShortlisted).length;
      toast.success(`${newCount} candidate${newCount !== 1 ? "s" : ""} shortlisted`, {
        title: alreadyCount > 0 ? `${alreadyCount} already shortlisted` : undefined
      });
      setSelectedIds(new Set());
      await loadShortlisted();
    } catch (err) {
      toast.error(err.message || "Failed to shortlist");
    } finally {
      setShortlisting(false);
    }
  };

  // Schedule interview
  const handleScheduleInterview = async ({ startsAt, endsAt, notes }) => {
    if (!scheduleTarget) return;
    try {
      await interviewService.scheduleInterview({
        campaignId: scheduleTarget.campaignId,
        candidateId: scheduleTarget.candidateId,
        startsAt,
        endsAt,
        notes: notes || undefined,
      });
      toast.success("Interview scheduled!", { title: `Invite sent to ${scheduleTarget.candidateName}` });
      await loadShortlisted();
    } catch (err) {
      toast.error(err.message || "Failed to schedule interview");
      throw err;
    } finally {
      setScheduleTarget(null);
    }
  };


  const handleToggleCampaign = async () => {
    if (!currentCampaign) return;
    const newStatus = isCurrentlyOpen ? "CLOSED" : "OPEN";
    if (window.confirm(`Are you sure you want to ${isCurrentlyOpen ? "close" : "open"} this campaign?`)) {
      try {
        await campaignService.updateCampaign(currentCampaign.id, { status: newStatus });
        setCampaigns(prev => prev.map(c => c.id === currentCampaign.id ? { ...c, status: newStatus } : c));
        toast.success(`Campaign ${isCurrentlyOpen ? "closed" : "opened"} successfully`);
      } catch (err) {
        toast.error(err.message || "Failed to update campaign");
      }
    }
  };

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role={role} />
      <main className="workspace">

        {/* Header */}
        <header className="h-20 bg-white border-b border-outline-variant/50 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!isCandidate && (
              <button onClick={() => navigate("/campaigns")} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant border border-outline-variant/60">
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-on-surface">
                {isCandidate ? "My Assessment Results" : (currentCampaign?.title || "Campaign Details")}
              </h1>
              {!isCandidate && currentCampaign && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${isCurrentlyOpen ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#F3F4F6] text-[#4B5563]"}`}>
                    {isCurrentlyOpen ? "OPEN" : "CLOSED"}
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold">Results and Rankings</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isCandidate && (
              <>
                {currentCampaign && (
                  isCurrentlyOpen ? (
                    <button onClick={handleToggleCampaign} className="text-sm font-bold bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-red-200">
                      Close Campaign
                    </button>
                  ) : (
                    <button onClick={handleToggleCampaign} className="text-sm font-bold bg-[#D1FAE5] text-[#059669] hover:bg-[#A7F3D0] px-4 py-2 rounded-lg transition-colors border border-[#059669]/20">
                      Open Campaign
                    </button>
                  )
                )}
                <div className="h-8 w-px bg-outline-variant/50 mx-2" />
                <button className="flex items-center gap-2 bg-white border border-outline-variant/80 hover:bg-surface-light text-on-surface px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                  <Download size={16} /> Export
                </button>
              </>
            )}
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-6">

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Candidates", value: totalCandidates, icon: Users, color: "bg-[#EFF6FF] text-[#2563EB]", textColor: "text-on-surface" },
              { label: "Qualified Matches", value: qualifiedMatches, icon: Target, color: "bg-[#EFF6FF] text-[#2563EB]", textColor: "text-[#2563EB]", sub: `${conversionRate}% Conversion` },
              { label: "Integrity Pass Rate", value: `${integrityPassRate}%`, icon: ShieldCheck, color: "bg-[#ECFDF5] text-[#059669]", textColor: "text-on-surface" },
              { label: "Avg. Assessment Score", value: `${avgScore}%`, icon: BarChart3, color: "bg-surface-container-high text-on-surface-variant", textColor: "text-on-surface" },
            ].map(m => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-on-surface-variant font-semibold">{m.label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}><Icon size={16} /></div>
                  </div>
                  <div className={`text-4xl font-bold mb-1 ${m.textColor}`}>{m.value}</div>
                  {m.sub && <div className="text-xs font-bold text-on-surface-variant">{m.sub}</div>}
                </div>
              );
            })}
          </div>

          {/* Tabs (recruiter only) */}
          {!isCandidate && (
            <div className="flex gap-1 bg-[#F1F5F9] rounded-xl p-1 w-fit">
              {[
                { key: "rankings", label: "Candidate Rankings", icon: BarChart3 },
                { key: "shortlisted", label: `Shortlisted (${shortlistedApps.length})`, icon: Star },
                { key: "questions", label: "Interview Questions", icon: Code },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    id={`tab-${tab.key}`}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? "bg-white text-[#2563EB] shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    <Icon size={15} /> {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Rankings Tab ── */}
          {(isCandidate || activeTab === "rankings") && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">

                {/* Top Candidate Banner removed */}

                {/* Rankings Table */}
                <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden">
                  {/* Table toolbar */}
                  <div className="p-6 border-b border-outline-variant/50 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-on-surface">Candidate Rankings</h3>
                      {!isCandidate && selectedIds.size > 0 && (
                        <button
                          id="shortlist-selected-btn"
                          onClick={() => handleShortlist(selectedIds)}
                          disabled={shortlisting}
                          className="flex items-center gap-2 px-5 py-2 bg-[#111827] text-white rounded-lg text-sm font-bold hover:bg-[#1F2937] transition-all shadow-md active:scale-95 disabled:opacity-60"
                        >
                          <Star size={14} className="text-[#FBBF24]" fill="currentColor" /> {shortlisting ? "Shortlisting…" : `Shortlist ${selectedIds.size} Selected`}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                        <input
                          type="text"
                          placeholder="Search candidates..."
                          className="pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/60 rounded-lg text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-52"
                          value={search}
                          onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-on-surface-variant">Min MCQ:</span>
                        <input type="number" min="0" max="100" placeholder="0" className="w-16 px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-md text-sm font-medium focus:outline-none focus:border-primary" value={minMcqScore} onChange={e => { setMinMcqScore(e.target.value); setPage(1); }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-on-surface-variant">Min Coding:</span>
                        <input type="number" min="0" max="100" placeholder="0" className="w-16 px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-md text-sm font-medium focus:outline-none focus:border-primary" value={minCodingScore} onChange={e => { setMinCodingScore(e.target.value); setPage(1); }} />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/50">
                          {!isCandidate && (
                            <th className="px-4 py-4 w-10">
                              <button id="select-all-checkbox" onClick={toggleSelectAll} className="text-on-surface-variant hover:text-on-surface">
                                {allPageSelected ? <CheckSquare size={18} className="text-[#2563EB]" /> : <Square size={18} />}
                              </button>
                            </th>
                          )}
                          <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant text-center w-16">Rank</th>
                          <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant">Candidate</th>
                          <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant w-24">MCQ</th>
                          <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant w-24">Coding</th>
                          <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant w-32">Overall</th>
                          <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant text-right">Integrity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paged.length === 0 ? (
                          <tr>
                            <td colSpan={isCandidate ? 6 : 7} className="px-6 py-12 text-center text-on-surface-variant">
                              <div className="flex flex-col items-center justify-center">
                                <h3 className="text-lg font-bold text-on-surface mb-2">No results found</h3>
                                <p className="text-sm">No candidates match your current filters.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paged.map(c => {
                            const hasFlags = c.integrityFlags > 0;
                            const isSelected = c.candidateId && selectedIds.has(c.candidateId);
                            return (
                              <tr
                                key={c.id || c.candidateId}
                                className={`border-b border-outline-variant/30 hover:bg-surface-light transition-colors last:border-0 ${isSelected ? "bg-[#EFF6FF]/40" : ""}`}
                              >
                                {!isCandidate && (
                                  <td className="px-4 py-4">
                                    <button
                                      onClick={e => { e.stopPropagation(); c.candidateId && toggleOne(c.candidateId); }}
                                      className="text-on-surface-variant hover:text-[#2563EB]"
                                    >
                                      {isSelected ? <CheckSquare size={18} className="text-[#2563EB]" /> : <Square size={18} />}
                                    </button>
                                  </td>
                                )}
                                <td className="px-6 py-4 text-center cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${c.rank === 1 ? "bg-[#FEF08A] text-[#854D0E]" : c.rank === 2 ? "bg-[#E2E8F0] text-[#475569]" : c.rank === 3 ? "bg-[#DBEAFE] text-[#1E40AF]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                                    {c.rank}
                                  </span>
                                </td>
                                <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-[#C7D2FE]">
                                      {c.candidateProfile?.profilePicUrl
                                        ? <img src={c.candidateProfile.profilePicUrl} alt={c.name} className="w-full h-full object-cover" />
                                        : c.name?.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                    </div>
                                    <div>
                                      <div className="font-bold text-on-surface text-sm">{c.name}</div>
                                      <div className="text-xs text-on-surface-variant mt-0.5">{c.role}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                                  <div className="flex flex-col">
                                    <div className="text-sm font-semibold text-on-surface-variant">{c.mcqScore} pts</div>
                                    <div className="text-[10px] text-on-surface-variant/70">{Math.floor((c.mcqDurationSeconds || 0)/60)}m {(c.mcqDurationSeconds || 0)%60}s</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                                  <div className="flex flex-col">
                                    <div className="text-sm font-semibold text-on-surface-variant">{c.codingScore} pts</div>
                                    <div className="text-[10px] text-on-surface-variant/70">{Math.floor((c.codingDurationSeconds || 0)/60)}m {(c.codingDurationSeconds || 0)%60}s</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                                  <div className="font-bold text-on-surface text-sm">{c.score} pts</div>
                                </td>
                                <td className="px-6 py-4 text-right cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                                  {hasFlags ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FEE2E2] text-[#DC2626] rounded-full text-xs font-bold border border-[#DC2626]/20">
                                      <AlertTriangle size={12} /> {c.integrityFlags} Flags
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#D1FAE5] text-[#059669] rounded-full text-xs font-bold border border-[#059669]/20">
                                      <ShieldCheck size={12} /> Pass
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="p-4 border-t border-outline-variant/50 bg-white flex justify-between items-center text-sm font-semibold text-on-surface-variant">
                    <span>Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
                    <div className="flex items-center gap-4">
                      <button className="p-1 hover:text-on-surface disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-xs">{page}/{totalPages}</span>
                      <button className="p-1 hover:text-on-surface disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Score Distribution (visual) */}
                <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-8">
                    <BarChart3 size={20} className="text-[#2563EB]" />
                    <h3 className="text-lg font-bold text-on-surface">Score Distribution</h3>
                  </div>
                  <div className="h-48 border-b border-outline-variant/50 border-dashed flex items-end justify-between px-2 pb-1 relative mb-6">
                    <div className="absolute inset-0 flex flex-col justify-between pt-2">
                      {[0, 1, 2].map(i => <div key={i} className="border-t border-outline-variant/20 border-dashed w-full h-0" />)}
                    </div>
                    {[10, 25, 60, 85, 40].map((h, i) => (
                      <div key={i} className={`flex-1 rounded-t-sm relative z-10 mx-0.5 ${i === 3 ? "bg-[#1D4ED8]" : i === 2 ? "bg-[#3B82F6]" : i === 1 ? "bg-[#93C5FD]" : "bg-surface-container-highest"}`} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-on-surface-variant px-2 mb-4">
                    {["0-50", "50-70", "70-85", "85-95", "95-100"].map(l => <span key={l}>{l}</span>)}
                  </div>
                  <div className="flex justify-center items-center gap-4 text-sm">
                    <span className="text-on-surface-variant font-semibold">Avg: <strong className="text-on-surface">{avgScore}%</strong></span>
                  </div>
                </div>

                {/* Integrity Watchlist */}
                <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} className="text-[#DC2626]" />
                      <h3 className="text-lg font-bold text-on-surface leading-tight">Integrity<br />Watchlist</h3>
                    </div>
                    <span className="px-3 py-1 bg-[#FEE2E2] text-[#DC2626] rounded-full text-xs font-bold text-center leading-tight">
                      {candidates.filter(c => c.integrityFlags > 0).length}<br />Alerts
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium mb-4">Candidates requiring manual review for assessment flags.</p>
                  <div className="space-y-3">
                    {candidates.filter(c => c.integrityFlags > 0).length === 0 ? (
                      <p className="text-sm text-on-surface-variant italic">No pending alerts.</p>
                    ) : (
                      candidates.filter(c => c.integrityFlags > 0).slice(0, 3).map(c => (
                        <div key={c.id || c.candidateId} onClick={() => setSelectedCandidate(c)} className="border border-[#FCA5A5] bg-[#FEF2F2] rounded-xl p-3 flex gap-3 cursor-pointer hover:bg-[#FEE2E2] transition-colors">
                          <div className="w-8 h-8 rounded-full bg-[#FCA5A5]/30 text-[#DC2626] flex items-center justify-center shrink-0">
                            <AlertTriangle size={14} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="font-bold text-sm text-on-surface">{c.name}</div>
                              <div className="text-xs font-bold text-[#DC2626]">{c.score}%</div>
                            </div>
                            <div className="text-xs font-semibold text-[#DC2626] mt-0.5">{c.integrityFlags} Flags</div>
                          </div>
                          <ChevronRight size={16} className="text-[#DC2626] self-center" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Shortlisted Tab ── */}
          {!isCandidate && activeTab === "shortlisted" && (
            <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star size={20} className="text-[#D97706]" />
                  <h3 className="text-xl font-bold text-on-surface">Shortlisted Candidates</h3>
                  <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] rounded-full text-xs font-bold">{shortlistedApps.length}</span>
                </div>
              </div>

              {shortlistLoading ? (
                <div className="py-16 text-center text-on-surface-variant">Loading shortlisted candidates…</div>
              ) : shortlistedApps.length === 0 ? (
                <div className="py-16 text-center">
                  <Star size={40} className="mx-auto mb-3 text-outline-variant" />
                  <h3 className="text-lg font-bold text-on-surface mb-2">No shortlisted candidates yet</h3>
                  <p className="text-sm text-on-surface-variant">Go to Candidate Rankings and select candidates to shortlist.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-surface-container-low">
                  {shortlistedApps.map(app => {
                    const c = app.candidate || {};
                    const name = c.name || "Candidate";
                    const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2);
                    const isScheduled = app.status === "INTERVIEW_SCHEDULED";
                    const statusColor = isScheduled ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FEF3C7] text-[#D97706]";
                    const statusLabel = isScheduled ? "Interview Scheduled" : "Awaiting Interview";
                    
                    return (
                      <div key={app.id} className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center font-bold text-xl border border-[#C7D2FE] overflow-hidden">
                              {c.profilePicUrl ? <img src={c.profilePicUrl} alt={name} className="w-full h-full object-cover" /> : initials}
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-on-surface mb-1">{name}</h4>
                          <p className="text-sm text-on-surface-variant truncate mb-4">{c.email}</p>
                          
                          {c.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-6">
                              {c.skills.slice(0, 4).map(s => (
                                <span key={s} className="px-2 py-1 bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] rounded-md text-xs font-semibold">{s}</span>
                              ))}
                              {c.skills.length > 4 && <span className="text-xs text-on-surface-variant font-semibold self-center">+{c.skills.length - 4}</span>}
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-4 border-t border-outline-variant/50">
                          {app.status === "SHORTLISTED" && (
                            <button
                              id={`schedule-interview-btn-${c.id}`}
                              onClick={() => setScheduleTarget({ candidateId: c.id, candidateName: name, campaignId, candidateProfilePicUrl: c.profilePicUrl })}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white rounded-xl text-sm font-bold hover:bg-[#1F2937] transition-all shadow-sm active:scale-95"
                            >
                              <Calendar size={16} /> Schedule Interview
                            </button>
                          )}
                          {isScheduled && (
                            <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F8FAFC] border border-outline-variant/60 text-[#059669] rounded-xl text-sm font-bold">
                              <CheckCircle2 size={16} /> Scheduled
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Interview Questions Tab ── */}
          {!isCandidate && activeTab === "questions" && (
            <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Code size={20} className="text-[#2563EB]" />
                  <h3 className="text-xl font-bold text-on-surface">Live Interview Questions</h3>
                </div>
                <button 
                  onClick={() => {
                    const newQ = { id: Date.now().toString(), title: "New Question", statement: "Write a function to...", language: "python" };
                    setInterviewQuestions([...interviewQuestions, newQ]);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-bold hover:bg-[#1D4ED8] transition-colors"
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>
              
              <div className="p-6 bg-surface-container-low min-h-[400px]">
                {interviewQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant">
                    <Code size={48} className="mb-4 text-outline-variant" />
                    <h3 className="text-lg font-bold text-on-surface mb-2">No Interview Questions</h3>
                    <p className="text-sm">Pre-populate coding questions here to select them quickly during a live interview.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {interviewQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between mb-4">
                           <input 
                             type="text" 
                             value={q.title} 
                             onChange={(e) => {
                               const arr = [...interviewQuestions];
                               arr[idx].title = e.target.value;
                               setInterviewQuestions(arr);
                             }}
                             className="text-lg font-bold text-on-surface border-b border-transparent hover:border-outline-variant focus:border-primary outline-none bg-transparent w-1/2 px-1"
                             placeholder="Question Title"
                           />
                           <button 
                             onClick={() => {
                               const arr = [...interviewQuestions];
                               arr.splice(idx, 1);
                               setInterviewQuestions(arr);
                             }}
                             className="text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors"
                           >
                             <X size={16} />
                           </button>
                        </div>
                        <textarea
                           value={q.statement}
                           onChange={(e) => {
                             const arr = [...interviewQuestions];
                             arr[idx].statement = e.target.value;
                             setInterviewQuestions(arr);
                           }}
                           rows={4}
                           className="w-full text-sm font-mono text-on-surface-variant bg-[#F8FAFC] border border-outline-variant/50 rounded-lg p-3 outline-none focus:border-primary resize-none"
                           placeholder="Problem statement..."
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-outline-variant/50 flex justify-end bg-white">
                 <button 
                   onClick={async () => {
                     try {
                       await campaignService.updateCampaign(campaignId, { interviewQuestions });
                       toast.success("Questions saved for the campaign");
                     } catch (err) {
                       toast.error(err.message || "Failed to save questions");
                     }
                   }}
                   className="flex items-center gap-2 bg-[#111827] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#1F2937] transition-all shadow-sm active:scale-95"
                 >
                   Save Questions
                 </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Profile Modal */}
      {selectedCandidate && (
        <ProfileModal
          candidate={selectedCandidate}
          campaignId={campaignId}
          onClose={() => setSelectedCandidate(null)}
          onShortlist={!isCandidate && selectedCandidate.candidateId ? (c) => handleShortlist(new Set([c.candidateId])) : null}
        />
      )}

      {/* Schedule Interview Modal */}
      {scheduleTarget && (
        <ScheduleInterviewModal
          open={!!scheduleTarget}
          onClose={() => setScheduleTarget(null)}
          onSchedule={handleScheduleInterview}
          candidateName={scheduleTarget?.candidateName}
          candidateProfilePicUrl={scheduleTarget?.candidateProfilePicUrl}
        />
      )}
    </div>
  );
}
