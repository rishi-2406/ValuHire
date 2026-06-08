import { BarChart3, Star, Code, CheckCircle2, ArrowLeft } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import ScheduleInterviewModal from "../components/ScheduleInterviewModal";

import ProfileModal from "../components/ResultsPage/ProfileModal";
import MetricsCards from "../components/ResultsPage/MetricsCards";
import RankingsTab from "../components/ResultsPage/RankingsTab";
import ShortlistedTab from "../components/ResultsPage/ShortlistedTab";
import CompletedTab from "../components/ResultsPage/CompletedTab";
import QuestionsTab from "../components/ResultsPage/QuestionsTab";
import ResultsHeader from "../components/ResultsPage/ResultsHeader";
import { useResultsPage } from "../hooks/useResultsPage";

export default function ResultsPage() {
  const {
    campaignId,
    activeTab, setActiveTab,
    candidates,
    pendingApps, completedApps,
    shortlistLoading,
    search, setSearch,
    minMcqScore, setMinMcqScore,
    minCodingScore, setMinCodingScore,
    page, setPage,
    selectedIds, setSelectedIds,
    selectedCandidate, setSelectedCandidate,
    scheduleTarget, setScheduleTarget,
    shortlisting,
    interviewQuestions, setInterviewQuestions,
    perPage,
    role, isCandidate,
    currentCampaign, isCurrentlyOpen,
    filtered, totalPages, paged,
    totalCandidates, avgScore, qualifiedMatches, conversionRate, integrityPassRate,
    allPageSelected,
    toggleSelectAll, toggleOne,
    handleShortlist, handleScheduleInterview, handleToggleCampaign, handleSaveQuestions
  } = useResultsPage();

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
          {(isCandidate || activeTab === "overview") && (
            <MetricsCards 
              totalCandidates={totalCandidates}
              qualifiedMatches={qualifiedMatches}
              conversionRate={conversionRate}
              integrityPassRate={integrityPassRate}
              avgScore={avgScore}
              campaignId={campaignId}
              role={role}
            />
          )}

          {/* Back button when inside a specific view */}
          {!isCandidate && activeTab !== "overview" && (
            <button
              onClick={() => setActiveTab("overview")}
              className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors w-fit bg-white px-4 py-2 rounded-xl border border-outline-variant/60 shadow-sm"
            >
              <ArrowLeft size={16} /> Back to Overview
            </button>
          )}

          {/* Overview Cards (recruiter only) */}
          {!isCandidate && activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { key: "rankings", label: "Candidate Rankings", icon: BarChart3, desc: "View and filter all candidate results", color: "bg-[#EFF6FF] text-[#2563EB]" },
                { key: "shortlisted", label: `Shortlisted (${pendingApps.length})`, icon: Star, desc: "Candidates waiting for interview", color: "bg-[#FEFCE8] text-[#CA8A04]" },
                { key: "completed", label: `Completed (${completedApps.length})`, icon: CheckCircle2, desc: "Candidates with completed interviews", color: "bg-[#ECFDF5] text-[#059669]" },
                { key: "questions", label: "Interview Questions", icon: Code, desc: "Manage questions for this campaign", color: "bg-[#F3E8FF] text-[#9333EA]" },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.key}
                    onClick={() => setActiveTab(card.key)}
                    className="flex flex-col text-left bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#2563EB]/30 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${card.color}`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-lg font-bold text-on-surface mb-1">{card.label}</div>
                    <div className="text-sm text-on-surface-variant">{card.desc}</div>
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
              shortlistedApps={pendingApps}
              shortlistLoading={shortlistLoading}
              setScheduleTarget={setScheduleTarget}
              campaignId={campaignId}
            />
          )}

          {/* ── Completed Tab ── */}
          {!isCandidate && activeTab === "completed" && (
            <CompletedTab 
              completedApps={completedApps}
              loading={shortlistLoading}
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
