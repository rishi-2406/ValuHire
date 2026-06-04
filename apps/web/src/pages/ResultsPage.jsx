import { useEffect, useState, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { BarChart3, Star, Code } from "lucide-react";
import { resultsService, campaignService, applicationService, interviewService } from "../services/api";
import Sidebar from "../components/Sidebar";
import ScheduleInterviewModal from "../components/ScheduleInterviewModal";

import ProfileModal from "../components/ResultsPage/ProfileModal";
import MetricsCards from "../components/ResultsPage/MetricsCards";
import RankingsTab from "../components/ResultsPage/RankingsTab";
import ShortlistedTab from "../components/ResultsPage/ShortlistedTab";
import QuestionsTab from "../components/ResultsPage/QuestionsTab";
import ResultsHeader from "../components/ResultsPage/ResultsHeader";

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

// ─── Main component ──────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const { campaignId } = useParams();

  const [activeTab, setActiveTab] = useState("rankings"); // "rankings" | "shortlisted" | "questions"
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
  const qualifiedMatches = candidates.filter(c => c.score >= 80).length;
  const conversionRate = totalCandidates ? Math.round((qualifiedMatches / totalCandidates) * 100) : 0;
  const passedIntegrity = candidates.filter(c => c.integrityFlags === 0).length;
  const integrityPassRate = totalCandidates ? ((passedIntegrity / totalCandidates) * 100).toFixed(1) : 0;

  // Selection
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

  const handleSaveQuestions = async () => {
    try {
      await campaignService.updateCampaign(campaignId, { interviewQuestions });
      toast.success("Questions saved for the campaign");
    } catch (err) {
      toast.error(err.message || "Failed to save questions");
    }
  };

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role={role} />
      <main className="workspace">
        <ResultsHeader 
          isCandidate={isCandidate}
          currentCampaign={currentCampaign}
          isCurrentlyOpen={isCurrentlyOpen}
          handleToggleCampaign={handleToggleCampaign}
        />

        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
          <MetricsCards 
            totalCandidates={totalCandidates}
            qualifiedMatches={qualifiedMatches}
            conversionRate={conversionRate}
            integrityPassRate={integrityPassRate}
            avgScore={avgScore}
          />

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
            <RankingsTab 
              isCandidate={isCandidate}
              filtered={filtered}
              paged={paged}
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              search={search}
              setSearch={setSearch}
              minMcqScore={minMcqScore}
              setMinMcqScore={setMinMcqScore}
              minCodingScore={minCodingScore}
              setMinCodingScore={setMinCodingScore}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              shortlisting={shortlisting}
              handleShortlist={handleShortlist}
              toggleSelectAll={toggleSelectAll}
              allPageSelected={allPageSelected}
              toggleOne={toggleOne}
              setSelectedCandidate={setSelectedCandidate}
              candidates={candidates}
              avgScore={avgScore}
              perPage={perPage}
            />
          )}

          {/* ── Shortlisted Tab ── */}
          {!isCandidate && activeTab === "shortlisted" && (
            <ShortlistedTab 
              shortlistedApps={shortlistedApps}
              shortlistLoading={shortlistLoading}
              setScheduleTarget={setScheduleTarget}
              campaignId={campaignId}
            />
          )}

          {/* ── Interview Questions Tab ── */}
          {!isCandidate && activeTab === "questions" && (
            <QuestionsTab 
              interviewQuestions={interviewQuestions}
              setInterviewQuestions={setInterviewQuestions}
              onSaveQuestions={handleSaveQuestions}
            />
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
