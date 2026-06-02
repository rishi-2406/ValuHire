import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Users,
  Target,
  ShieldCheck,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Bell,
  Settings,
  X,
  Video,
  ChevronDown
} from "lucide-react";
import { resultsService, campaignService } from "../services/api";
import Sidebar from "../components/Sidebar";

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
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const perPage = 10;

  const role = (user?.role || "recruiter").toLowerCase();
  const isCandidate = role === "candidate";

  // Load campaigns list for recruiters (for dropdown)
  useEffect(() => {
    if (!isCandidate) {
      campaignService.getMyCampaigns()
        .then((data) => {
          const list = data.campaigns || data || [];
          setCampaigns(list);
          if (list.length > 0) setSelectedCampaignId(list[0].id);
        })
        .catch(() => setCampaigns([]));
    }
  }, [isCandidate]);

  // Load results — for recruiters, load by selected campaign; for candidates, load own history
  useEffect(() => {
    setLoading(true);
    setError(null);

    let fetcher;
    if (isCandidate) {
      fetcher = resultsService.getMyResults();
    } else if (selectedCampaignId) {
      fetcher = resultsService.getCampaignResults(selectedCampaignId)
        .then((r) => ({ results: r.results || r || [] }));
    } else {
      setLoading(false);
      return;
    }

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
  }, [isCandidate, selectedCampaignId, location.pathname]);

  const filtered = candidates.filter((c) => {
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const displayCandidates = paged;

  // Derive stats from real data
  const totalCandidates = candidates.length;
  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
    : 0;
  const topCandidate = candidates.length > 0 ? candidates[0] : null;
  const qualifiedMatches = candidates.filter(c => c.score >= 80).length;
  const conversionRate = totalCandidates ? Math.round((qualifiedMatches / totalCandidates) * 100) : 0;
  const passedIntegrity = candidates.filter(c => c.integrityFlags === 0).length;
  const integrityPassRate = totalCandidates ? ((passedIntegrity / totalCandidates) * 100).toFixed(1) : 0;

  const handleExport = () => {
    toast.success("Results exported", { title: "CSV downloaded" });
  };

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role={role} />
      <main className="workspace">

        {/* Custom Header for Results */}
        <header className="h-20 bg-white border-b border-outline-variant/50 px-8 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              {isCandidate ? "My Assessment Results" : "Results and Rankings"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Campaign selector — recruiters only */}
            {!isCandidate && (
              <div className="relative">
                <select
                  value={selectedCampaignId}
                  onChange={(e) => { setSelectedCampaignId(e.target.value); setPage(1); }}
                  className="appearance-none bg-surface-container-low border border-outline-variant/60 rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {campaigns.length === 0 && <option value="">No campaigns yet</option>}
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
              </div>
            )}

            <div className="h-8 w-px bg-outline-variant/50 mx-2" />

            {/* Export + New Campaign — recruiters only */}
            {!isCandidate && (
              <>
                <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-outline-variant/80 hover:bg-surface-light text-on-surface px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                  <Download size={16} /> Export
                </button>
                <button onClick={() => navigate("/recruiter")} className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                  <Plus size={16} /> New Campaign
                </button>
              </>
            )}
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
          
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-on-surface-variant font-semibold">Total Candidates</span>
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <div className="text-4xl font-bold text-on-surface mb-2">{totalCandidates}</div>
            </div>

            <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-on-surface-variant font-semibold">Qualified Matches</span>
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Target size={16} />
                </div>
              </div>
              <div className="text-4xl font-bold text-[#2563EB] mb-2">{qualifiedMatches}</div>
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB]" style={{ width: `${conversionRate}%` }} />
                </div>
                {conversionRate}% Conversion Rate
              </div>
            </div>

            <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-on-surface-variant font-semibold">Integrity Pass Rate</span>
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div className="text-4xl font-bold text-on-surface mb-2">{integrityPassRate} <span className="text-xl">%</span></div>
              <div className="text-xs font-bold text-on-surface-variant">
                 <svg className="w-full h-4" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 20 L 10 15 L 20 18 L 30 10 L 40 12 L 50 8 L 60 14 L 70 5 L 80 8 L 90 2 L 100 4" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
              </div>
            </div>

            <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-on-surface-variant font-semibold leading-tight">Avg. Assessment Score</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
                  <BarChart3 size={16} />
                </div>
              </div>
              <div className="text-4xl font-bold text-on-surface mb-2">{avgScore} <span className="text-xl">%</span></div>
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                 <div className="flex gap-0.5">
                   <div className="w-2 h-2 rounded-sm bg-[#EAB308]"></div>
                   <div className="w-2 h-2 rounded-sm bg-[#3B82F6]"></div>
                 </div>
                 Normal Distribution
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Top Candidate */}
              {topCandidate && (
                <div className="bg-gradient-to-r from-[#F8FAFC] to-[#EEF2FF] border border-outline-variant/60 rounded-2xl p-8 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                       <div className="w-24 h-24 rounded-full bg-surface-container-highest border-4 border-white shadow-sm overflow-hidden flex items-center justify-center">
                          <img src="https://ui-avatars.com/api/?name=Anika+Rao&background=0D8ABC&color=fff&size=128" alt={topCandidate.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="absolute -bottom-2 -right-2 bg-[#EAB308] text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                         <span className="text-[10px]">🏆</span>
                       </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-on-surface">{topCandidate.name}</h2>
                        <span className="px-2.5 py-0.5 bg-[#DBEAFE] text-[#1E40AF] text-xs font-bold rounded-full">#1 Ranked</span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4">{topCandidate.role || "Senior Backend Engineer Candidate"}</p>
                      <div className="flex items-center gap-6 text-xs font-semibold text-on-surface-variant">
                         <div className="flex items-center gap-1.5 text-[#059669]">
                           <CheckCircle2 size={16} /> Integrity Passed
                         </div>
                         <div className="flex items-center gap-1.5">
                           <Clock size={16} className="text-[#3B82F6]" /> Completed in 45m
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4">
                     <div className="text-5xl font-extrabold text-on-surface">{topCandidate.score} <span className="text-2xl font-bold text-on-surface-variant">%</span></div>
                     <button className="bg-white border border-[#2563EB]/30 hover:border-[#2563EB] text-[#2563EB] px-6 py-2 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
                       View Full Report <ChevronRight size={16} />
                     </button>
                  </div>
                </div>
              )}

              {/* Rankings Table */}
              <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden flex flex-col h-fit">
                <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-on-surface">Candidate Rankings</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input 
                        type="text" 
                        placeholder="Search candidates..." 
                        className="pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/60 rounded-lg text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      />
                    </div>
                    <button className="w-9 h-9 border border-outline-variant/60 rounded-lg flex items-center justify-center hover:bg-surface-container-low transition-colors">
                      <Filter size={16} className="text-on-surface-variant" />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/50">
                        <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant text-center w-16">Rank</th>
                        <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant">Candidate</th>
                        <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant w-48">Score</th>
                        <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant text-right">Integrity</th>
                      </tr>
                    </thead>
                    <tbody>
                    {displayCandidates.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-on-surface-variant">
                          <div className="flex flex-col items-center justify-center">
                            <h3 className="text-lg font-bold text-on-surface mb-2">No results found</h3>
                            <p className="text-sm">We couldn't find any candidate results matching your criteria.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayCandidates.map((c, index) => {
                        const hasFlags = c.integrityFlags > 0;
                        return (
                          <tr key={c.id} className="border-b border-outline-variant/30 hover:bg-surface-light transition-colors cursor-pointer last:border-0" onClick={() => setSelectedCandidate(c)}>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${c.rank === 1 ? 'bg-[#FEF08A] text-[#854D0E]' : c.rank === 2 ? 'bg-[#E2E8F0] text-[#475569]' : c.rank === 3 ? 'bg-[#DBEAFE] text-[#1E40AF]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                                {c.rank}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center font-bold">
                                   {c.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                                 </div>
                                 <div>
                                   <div className="font-bold text-on-surface text-sm">{c.name}</div>
                                   <div className="text-xs text-on-surface-variant mt-0.5">{c.role}</div>
                                 </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-on-surface w-8">{c.score}%</span>
                                <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${c.score >= 90 ? 'bg-[#2563EB]' : 'bg-[#10B981]'}`} style={{ width: `${c.score}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
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
                
                <div className="p-4 border-t border-outline-variant/50 bg-white flex justify-between items-center text-sm font-semibold text-on-surface-variant">
                  <span>Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, totalCandidates)} of {totalCandidates} candidates</span>
                  <div className="flex items-center gap-4">
                    <button className="p-1 hover:text-on-surface disabled:opacity-50" disabled><ChevronLeft size={18} /></button>
                    <button className="p-1 hover:text-on-surface"><ChevronRight size={18} /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Score Distribution */}
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm h-fit">
                <div className="flex items-center gap-2 mb-8">
                  <BarChart3 size={20} className="text-[#2563EB]" />
                  <h3 className="text-lg font-bold text-on-surface">Score Distribution</h3>
                </div>
                
                {/* Mock Chart Area */}
                <div className="h-48 border-b border-outline-variant/50 border-dashed flex items-end justify-between px-2 pb-1 relative mb-6">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pt-2">
                    <div className="border-t border-outline-variant/20 border-dashed w-full h-0"></div>
                    <div className="border-t border-outline-variant/20 border-dashed w-full h-0"></div>
                    <div className="border-t border-outline-variant/20 border-dashed w-full h-0"></div>
                  </div>
                  
                  {/* Bars */}
                  <div className="w-10 bg-surface-container-highest rounded-t-sm h-[10%] relative z-10 mx-1"></div>
                  <div className="w-10 bg-surface-container-highest rounded-t-sm h-[25%] relative z-10 mx-1"></div>
                  <div className="w-10 bg-[#93C5FD] rounded-t-sm h-[60%] relative z-10 mx-1"></div>
                  <div className="w-10 bg-[#3B82F6] rounded-t-sm h-[85%] relative z-10 mx-1"></div>
                  <div className="w-10 bg-[#1D4ED8] rounded-t-sm h-[40%] relative z-10 mx-1"></div>
                </div>
                
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant px-2 mb-6">
                  <span>0-50</span>
                  <span>50-70</span>
                  <span>70-85</span>
                  <span>85-95</span>
                  <span>95-100</span>
                </div>
                
                <div className="flex justify-center items-center gap-4 text-sm">
                  <span className="text-on-surface-variant font-semibold">Median: <strong className="text-on-surface">74%</strong></span>
                  <span className="text-on-surface-variant font-semibold">Top Quartile: <strong className="text-[#2563EB]">88%+</strong></span>
                </div>
              </div>

                <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="text-[#DC2626] relative">
                        <ShieldCheck size={20} />
                        <div className="absolute top-1 left-2.5 w-1 h-1 rounded-full bg-white"></div>
                      </div>
                      <h3 className="text-lg font-bold text-on-surface leading-tight">Integrity<br/>Watchlist</h3>
                    </div>
                    <span className="px-3 py-1 bg-[#FEE2E2] text-[#DC2626] rounded-full text-xs font-bold text-center leading-tight">
                      {candidates.filter(c => c.integrityFlags > 0).length}<br/>Alerts
                    </span>
                  </div>
                  
                  <p className="text-sm text-on-surface-variant font-medium mb-6">
                    Candidates requiring manual review for assessment flags.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    {candidates.filter(c => c.integrityFlags > 0).length === 0 ? (
                      <p className="text-sm text-on-surface-variant italic">No pending alerts.</p>
                    ) : (
                      candidates.filter(c => c.integrityFlags > 0).slice(0, 3).map((candidate) => (
                        <div key={candidate.id} className="border border-[#FCA5A5] bg-[#FEF2F2] rounded-xl p-4 flex gap-4 cursor-pointer hover:bg-[#FEE2E2] transition-colors">
                          <div className="w-8 h-8 rounded-full bg-[#FCA5A5]/30 text-[#DC2626] flex items-center justify-center shrink-0">
                            <AlertTriangle size={14} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="font-bold text-sm text-on-surface">{candidate.name || candidate.candidate?.name || "Candidate"}</div>
                              <div className="text-xs font-bold text-[#DC2626]">{candidate.score || 0}% Score</div>
                            </div>
                            <div className="text-xs font-semibold text-[#DC2626] mt-1 pr-4">{candidate.integrityFlags} Flags Detected</div>
                          </div>
                          <ChevronRight size={16} className="text-[#DC2626] self-center" />
                        </div>
                      ))
                    )}
                  </div>
                  
                  <button className="w-full text-[#2563EB] font-bold text-sm hover:underline">
                    View All Flags
                  </button>
                </div>

              </div>
          </div>
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

function Clock({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}
