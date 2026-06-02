import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Users,
  CheckCircle,
  CalendarDays,
  AlertTriangle,
  Plus,
  Megaphone,
  Video,
  ChevronRight,
  Briefcase,
  Shield
} from "lucide-react";
import { campaignService, interviewService } from "../services/api";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import { SkeletonMetricGrid, SkeletonTable } from "../components/Skeleton";
import NewCampaignModal from "../components/NewCampaignModal";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      campaignService.getMyCampaigns().catch((err) => { setError(err.message); return { campaigns: [] }; }),
      interviewService.getMyInterviews().catch(() => ({ interviews: [] }))
    ])
      .then(([c, i]) => {
        setCampaigns(c.campaigns || c || []);
        setInterviews((i.interviews || i || []).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalCandidates = campaigns.reduce((sum, c) => sum + (c._count?.applications || c.applicantCount || c.applicants || 0), 0);
  const completedAssessments = campaigns.reduce((sum, c) => sum + (c.completedCount || 0), 0);

  const handleCreateCampaign = async (payload) => {
    try {
      const data = await campaignService.createCampaign({
        title: payload.title,
        description: payload.description,
        difficulty: payload.difficulty,
        duration: payload.duration,
        language: payload.language,
        tags: payload.tags,
        status: "OPEN"
      });
      const newCampaign = data.campaign || data;
      setCampaigns((prev) => [newCampaign, ...prev]);
      toast.success("Campaign created", { title: "Recruitment ready" });
    } catch (err) {
      toast.error(err.message || "Failed to create campaign");
      throw err;
    }
  };

  const filteredCampaigns = campaigns.filter((c) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell">
      <Sidebar role="recruiter" />
      <main className="workspace">
        <TopBar
          eyebrow="Recruiter Portal"
          title={`Welcome back, ${user?.name?.split(" ")[0] || "Recruiter"}`}
          onSearch={setSearch}
          actions={
            <button type="button" className="primary-button" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              <span>New Campaign</span>
            </button>
          }
        />

        <div className="stack">
          <section>
            {loading ? (
              <SkeletonMetricGrid count={4} />
            ) : (
              <div className="metric-grid">
                <MetricCard icon={Users} label="Active Candidates" value={totalCandidates} />
                <MetricCard icon={CheckCircle} label="Assessments Completed" value={completedAssessments} />
                <MetricCard icon={CalendarDays} label="Interviews Scheduled" value={interviews.length} />
                <MetricCard icon={AlertTriangle} label="Open Campaigns" value={campaigns.filter((c) => (c.status || "").toUpperCase() === "OPEN").length} warning={false} />
              </div>
            )}
          </section>

          <section id="campaigns" className="panel">
            <div className="panel-header">
              <div>
                <Megaphone size={20} className="text-primary" />
                <h2>Your Campaigns</h2>
              </div>
              <button
                type="button"
                className="tertiary-button"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={16} />
                <span>New campaign</span>
              </button>
            </div>

            {loading ? (
              <SkeletonTable rows={4} />
            ) : error ? (
              <EmptyState
                icon={AlertTriangle}
                variant="warning"
                title="Could not load campaigns"
                description={error}
                primaryAction={{ label: "Retry", onClick: () => window.location.reload() }}
              />
            ) : filteredCampaigns.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title={search ? "No matching campaigns" : "No campaigns yet"}
                description={
                  search
                    ? "Try a different search term."
                    : "Spin up your first assessment campaign to start receiving applications."
                }
                primaryAction={{
                  label: "New Campaign",
                  icon: <Plus size={18} />,
                  onClick: () => setShowCreateModal(true)
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline">
                      <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider">Campaign</th>
                      <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider">Applicants</th>
                      <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider">Trend</th>
                      <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                      <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      {filteredCampaigns.map((campaign) => {
                      const applicants = campaign._count?.applications || campaign.applicantCount || 0;
                      const isOpen = (campaign.status || "").toUpperCase() === "OPEN";
                      return (
                        <tr
                          key={campaign.id}
                          onClick={() => navigate("/results")}
                          className="border-b border-outline hover:bg-surface-light transition-colors cursor-pointer"
                        >
                          <td className="px-md py-4">
                            <div className="flex flex-col">
                              <span className="text-title-md text-on-surface">{campaign.title}</span>
                              <span className="text-body-sm text-on-surface-variant line-clamp-1">
                                {campaign.description || campaign.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-md py-4 text-body-md text-on-surface">
                            <span className="font-semibold">{applicants}</span>
                            <span className="text-on-surface-variant ml-1">applicants</span>
                          </td>
                          <td className="px-md py-4">
                            <div className="flex items-end gap-1 h-9">
                              {[30, 60, 80, 50, 70].map((height, i) => (
                                <div
                                  key={i}
                                  className="w-1.5 rounded-full"
                                  style={{
                                    height: `${height}%`,
                                    background: isOpen ? "#004ac6" : "#c3c6d7",
                                    opacity: isOpen ? 1 : 0.4
                                  }}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="px-md py-4">
                            <span className={"status-chip " + (isOpen ? "info" : "muted")}>
                              {campaign.status || "DRAFT"}
                            </span>
                          </td>
                          <td className="px-md py-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); navigate("/results"); }}
                              className="tertiary-button text-sm"
                            >
                              View
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="panel lg:col-span-2">
              <div className="panel-header">
                <div>
                  <Video size={20} className="text-primary" />
                  <h2>Recent Interviews</h2>
                </div>
                <button type="button" className="tertiary-button" onClick={() => navigate("/interviews")}>
                  Open session manager
                  <ChevronRight size={16} />
                </button>
              </div>
              {interviews.length === 0 ? (
                <EmptyState
                  icon={Video}
                  title="No interviews scheduled"
                  description="Schedule your first interview from the Interviews page to see it here."
                  primaryAction={{ label: "Open interviews", onClick: () => navigate("/interviews") }}
                />
              ) : (
                <div className="stack">
                  {interviews.map((interview) => (
                    <div key={interview.id || interview.name} className="moderation-row">
                      <div className="moderation-info">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-semibold">
                          {(interview.candidateName || interview.name || "C").charAt(0)}
                        </div>
                        <div>
                          <strong>{interview.candidateName || interview.name || "Candidate"}</strong>
                          <span>
                            {interview.role || interview.position || "Technical Interview"}
                            {" • "}
                            {interview.scheduledAt
                              ? new Date(interview.scheduledAt).toLocaleString()
                              : interview.time || "TBD"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate("/interviews")}
                        className="primary-button text-sm"
                      >
                        <Video size={16} />
                        <span>Open</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-primary text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={20} />
                  <h3 className="text-title-md">Proctoring Trust</h3>
                </div>
                <p className="text-body-sm mb-5 opacity-90">
                  Every assessment records tab switches, focus loss, copy/paste, and presence events. Review
                  flagged candidates in Results.
                </p>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg mb-4 border border-white/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-label-md">Sessions Tracked</span>
                    <span className="text-title-md font-bold">
                      {campaigns.reduce((sum, c) => sum + (c._count?.sessions || 0), 0)}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">Across all your active campaigns</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/results")}
                  className="w-full bg-white text-primary py-2.5 rounded-lg text-label-md font-semibold hover:bg-surface-light transition-colors"
                >
                  Review Results
                </button>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
            </section>
          </div>
        </div>
      </main>

      <NewCampaignModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCampaign}
      />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, warning }) {
  return (
    <div className={"metric-card " + (warning ? "border-l-4 border-l-warning-amber" : "")}>
      <div className={"metric-icon-wrapper " + (warning ? "bg-warning-amber/10 text-warning-amber" : "")}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
