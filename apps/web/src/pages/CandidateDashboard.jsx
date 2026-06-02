import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Play,
  Clock,
  BarChart3,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Award,
  Briefcase,
  Timer,
  Languages
} from "lucide-react";
import { applicationService, campaignService, resultsService } from "../services/api";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import { SkeletonCard, SkeletonRow } from "../components/Skeleton";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [pastResults, setPastResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingSession, setStartingSession] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      campaignService.getPublicCampaigns().catch(() => ({ campaigns: [] })),
      applicationService.getMyApplications().catch(() => ({ applications: [] })),
      resultsService.getMyResults().catch(() => ({ results: [] }))
    ])
      .then(([campaignData, appData, resultsData]) => {
        setCampaigns(campaignData.campaigns || campaignData || []);
        setApplications(appData.applications || appData || []);
        setPastResults(resultsData.results || resultsData || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const appliedMap = new Map(applications.map((a) => [a.campaignId, a]));
  const availableCampaigns = campaigns.filter(
    (c) => !appliedMap.has(c.id) && (!search || c.title?.toLowerCase().includes(search.toLowerCase()))
  );
  const inProgressCampaigns = applications.filter(
    (a) => a.status !== "SUBMITTED" && a.status !== "REJECTED"
  );

  const startAssessmentSession = async (assessmentId) => {
    try {
      const data = await applicationService.startSession(assessmentId);
      const session = data.session || data;
      if (session?.id) {
        navigate(`/assessment/${session.id}`);
      } else {
        toast.error("Could not start session");
      }
    } catch (err) {
      toast.error(err.message || "Failed to start session");
    }
  };

  const handleApply = async (campaignId) => {
    if (startingSession) return;
    setStartingSession(campaignId);
    try {
      const data = await applicationService.apply(campaignId);
      const newApp = data.application || data;
      setApplications((prev) => [...prev, newApp]);
      toast.success("Application submitted", { title: "Good luck!" });
      const assessmentId = newApp.assessmentId || newApp.id;
      if (assessmentId) {
        await startAssessmentSession(assessmentId);
      } else {
        toast.info("Awaiting recruiter approval before starting");
      }
    } catch (err) {
      toast.error(err.message || "Application failed");
    } finally {
      setStartingSession(null);
    }
  };

  const handleStart = async (application) => {
    if (startingSession) return;
    setStartingSession(application.id);
    await startAssessmentSession(application.assessmentId || application.id);
    setStartingSession(null);
  };

  const totalScore = pastResults.length
    ? Math.round(pastResults.reduce((s, r) => s + (r.score ?? 0), 0) / pastResults.length)
    : 0;
  const bestScore = pastResults.length
    ? Math.max(...pastResults.map((r) => r.score ?? 0))
    : 0;
  const completedCount = pastResults.length;

  return (
    <div className="app-shell">
      <Sidebar role="candidate" />
      <main className="workspace">
        <TopBar
          eyebrow="Candidate Portal"
          title={`Welcome back, ${user?.name?.split(" ")[0] || "Candidate"}`}
          onSearch={setSearch}
        />

        <div className="stack">
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              icon={FileCheck2}
              label="In Progress"
              value={inProgressCampaigns.length}
              accent="primary"
            />
            <MetricCard
              icon={BarChart3}
              label="Average Score"
              value={totalScore || "—"}
              accent="primary"
            />
            <MetricCard
              icon={Award}
              label="Best Score"
              value={bestScore || "—"}
              accent="success"
            />
          </section>

          {inProgressCampaigns.length > 0 ? (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <Play size={20} className="text-primary" />
                  <h2>Continue Assessment</h2>
                </div>
              </div>
              <div className="card-grid">
                {inProgressCampaigns.map((app) => (
                  <article
                    key={app.id}
                    className="bg-gradient-to-br from-primary to-primary-container text-white p-5 rounded-2xl flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} />
                      <span className="text-label-md uppercase tracking-wider opacity-80">Ready to start</span>
                    </div>
                    <h3 className="text-title-lg">{app.campaign?.title || app.campaignTitle || "Assessment"}</h3>
                    <p className="text-sm opacity-90">
                      Status: <span className="font-semibold">{app.status || "In progress"}</span>
                    </p>
                    <button
                      type="button"
                      className="mt-2 bg-white text-primary font-semibold h-11 px-4 rounded-lg hover:bg-surface-light transition-colors inline-flex items-center justify-center gap-2"
                      disabled={loading || startingSession === app.id}
                      onClick={() => handleStart(app)}
                    >
                      <Play size={16} />
                      <span>{startingSession === app.id ? "Starting..." : "Resume assessment"}</span>
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section id="campaigns" className="panel">
            <div className="panel-header">
              <div>
                <Briefcase size={20} className="text-primary" />
                <h2>Available Campaigns</h2>
              </div>
              <span className="text-sm text-on-surface-variant">
                {availableCampaigns.length} open
              </span>
            </div>
            {loading ? (
              <div className="card-grid">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : error ? (
              <EmptyState
                icon={Sparkles}
                variant="warning"
                title="Could not load campaigns"
                description={error}
                primaryAction={{ label: "Retry", onClick: () => window.location.reload() }}
              />
            ) : availableCampaigns.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title={search ? "No matching campaigns" : "No new campaigns right now"}
                description={
                  search
                    ? "Try a different search term."
                    : "Check back later — recruiters add new roles every week."
                }
              />
            ) : (
              <div className="card-grid">
                {availableCampaigns.map((campaign) => (
                  <article key={campaign.id} className="mini-card">
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                      <span className="status-chip info">{campaign.difficulty || "Medium"}</span>
                      <span className="inline-flex items-center gap-1">
                        <Timer size={14} />
                        {campaign.duration || 60} min
                      </span>
                      {campaign.language ? (
                        <span className="inline-flex items-center gap-1">
                          <Languages size={14} />
                          {campaign.language}
                        </span>
                      ) : null}
                    </div>
                    <strong>{campaign.title}</strong>
                    <p>{campaign.description || "Technical assessment"}</p>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={!!startingSession}
                      onClick={() => handleApply(campaign.id)}
                    >
                      {startingSession === campaign.id ? "Applying..." : "Apply & Start"}
                      <ArrowRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <BarChart3 size={20} className="text-primary" />
                <h2>Past Performance</h2>
              </div>
              <button type="button" className="tertiary-button" onClick={() => navigate("/results")}>
                View full history
                <ArrowRight size={16} />
              </button>
            </div>
            {loading ? (
              <div className="stack">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : pastResults.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No submissions yet"
                description="Complete an assessment to see your scores and history here."
                primaryAction={{
                  label: "Browse campaigns",
                  onClick: () => document.getElementById("campaigns")?.scrollIntoView({ behavior: "smooth" })
                }}
              />
            ) : (
              <div className="timeline">
                {pastResults.slice(0, 5).map((r) => {
                  const score = r.score ?? 0;
                  return (
                    <div key={r.id || r.sessionId} className="data-row">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-medium text-sm">
                          {r.campaignTitle || r.campaign?.title || "Assessment"}
                        </span>
                        <span className="text-xs text-on-surface-variant inline-flex items-center gap-1">
                          <Clock size={12} />
                          {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "Recently"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={
                            "status-chip " +
                            (score >= 80 ? "success" : score >= 60 ? "info" : "warning")
                          }
                        >
                          {score} / 100
                        </span>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => navigate("/results")}
                          aria-label="View result"
                        >
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {completedCount >= 1 ? (
                  <p className="text-sm text-on-surface-variant mt-2">
                    {completedCount} assessment{completedCount === 1 ? "" : "s"} completed • Best: {bestScore}/100
                  </p>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, accent = "primary" }) {
  const accentClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success-green/10 text-success-green"
  }[accent] || "bg-primary/10 text-primary";
  return (
    <div className="metric-card">
      <div className={"metric-icon-wrapper " + accentClasses}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
