import { BarChart3, Star, Code, CheckCircle2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
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
                { key: "shortlisted", label: `Shortlisted (${pendingApps.length})`, icon: Star },
                { key: "completed", label: `Completed (${completedApps.length})`, icon: CheckCircle2 },
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
