import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Users,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  Plus,
  Shield,
  Video,
  FileText,
  MoreHorizontal,
  CalendarDays
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
        setInterviews((i.slots || i.interviews || i || []).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalCandidates = campaigns.reduce((sum, c) => sum + (c._count?.applications || c.applicantCount || c.applicants || 0), 0);
  const completedAssessments = campaigns.reduce((sum, c) => sum + (c.completedCount || 0), 0);
  const activeCampaigns = campaigns.filter(c => (c.status || "").toUpperCase() === "OPEN");

  const handleCreateCampaign = async (payload) => {
    try {
      const data = await campaignService.createCampaign({
        title: payload.title,
        description: payload.description,
        difficulty: payload.difficulty,
        duration: payload.duration,
        language: payload.language,
        tags: payload.tags,
        status: "DRAFT"
      });
      const newCampaign = data.campaign || data;
      setCampaigns((prev) => [newCampaign, ...prev]);
      toast.success("Campaign created", { title: "Redirecting to Builder..." });
      
      // Navigate to the full-page builder for assessments
      navigate(`/campaigns/${newCampaign.id}/builder`);
    } catch (err) {
      toast.error(err.message || "Failed to create campaign");
      throw err;
    }
  };

  const handleToggleCampaign = async (e, campaign) => {
    e.stopPropagation();
    const isCurrentlyOpen = (campaign.status || "").toUpperCase() === "OPEN";
    const newStatus = isCurrentlyOpen ? "CLOSED" : "OPEN";
    const actionText = isCurrentlyOpen ? "close" : "open";
    
    if (window.confirm(`Are you sure you want to ${actionText} this campaign?`)) {
      try {
        await campaignService.updateCampaign(campaign.id, { status: newStatus });
        setCampaigns((prev) => prev.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c));
        toast.success(`Campaign ${isCurrentlyOpen ? "closed" : "opened"} successfully`);
      } catch (err) {
        toast.error(err.message || `Failed to ${actionText} campaign`);
      }
    }
  };

  const filteredCampaigns = campaigns.filter((c) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role="recruiter" />
      <main className="workspace">
        <TopBar
          eyebrow=""
          title=""
          onSearch={setSearch}
        />

        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-[2.5rem] font-bold text-[#111827] mb-2 leading-none">Overview</h1>
              <p className="text-[#4B5563] text-base">Here's what's happening in your pipeline today.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <CalendarDays size={16} />
              <span>Last updated: Just now</span>
            </div>
          </div>

          <section className="mb-8">
            {loading ? (
              <SkeletonMetricGrid count={4} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                  icon={Users} 
                  label="Active Candidates" 
                  value={totalCandidates} 
                  iconColor="text-[#2563EB]" 
                  iconBg="bg-[#EFF6FF]" 
                />
                <MetricCard 
                  icon={CheckCircle} 
                  label="Assessments Completed" 
                  value={completedAssessments} 
                  iconColor="text-[#4F46E5]" 
                  iconBg="bg-[#EEF2FF]"
                />
                <MetricCard 
                  icon={MessageSquare} 
                  label="Interviews This Week" 
                  value={interviews.length} 
                  iconColor="text-[#059669]" 
                  iconBg="bg-[#ECFDF5]"
                />
                <MetricCard 
                  icon={AlertTriangle} 
                  label="Integrity Flags" 
                  value={0} 
                  iconColor="text-[#DC2626]" 
                  iconBg="bg-[#FEE2E2]"
                  isWarning={true}
                />
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-6">
            <section className="bg-white rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden flex flex-col h-fit">
              <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-on-surface">Campaign Pipeline</h2>
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                    <Plus size={16} /> New Campaign
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/campaigns")}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-6"><SkeletonTable rows={4} /></div>
              ) : error ? (
                <div className="p-6">
                  <EmptyState
                    icon={AlertTriangle}
                    variant="warning"
                    title="Could not load campaigns"
                    description={error}
                    primaryAction={{ label: "Retry", onClick: () => window.location.reload() }}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/50">
                        <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant">Campaign Title</th>
                        <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant">Applicants</th>
                        <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCampaigns.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8">
                            <EmptyState
                              illustration="no-campaigns"
                              title="No campaigns found"
                              description="Create a new campaign to start recruiting."
                              primaryAction={{ label: "New Campaign", onClick: () => setShowCreateModal(true) }}
                            />
                          </td>
                        </tr>
                      ) : (
                        filteredCampaigns.map((campaign) => {
                          const applicants = campaign.applicants ?? (campaign._count?.applications || campaign.applicantCount || 0);
                          const isOpen = (campaign.status || "").toUpperCase() === "OPEN";
                          const location = campaign.location || "Remote";
                          
                          return (
                            <tr
                              key={campaign.id}
                              onClick={() => navigate(`/campaigns/${campaign.id}`)}
                              className="border-b border-outline-variant/30 hover:bg-surface-light transition-colors cursor-pointer last:border-0"
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-on-surface">{campaign.title}</span>
                                  <span className="text-xs text-on-surface-variant mt-0.5">
                                    {location}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-on-surface min-w-[28px]">{applicants}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${isOpen ? 'bg-[#D1FAE5] text-[#059669] border border-[#059669]/20' : 'bg-[#F3F4F6] text-[#4B5563] border border-outline'}`}>
                                  {isOpen ? 'Open' : 'Closed'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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

function MetricCard({ icon: Icon, label, value, trend, iconColor, iconBg, trendColor, trendBg, isWarning }) {
  return (
    <div className={`bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm relative overflow-hidden`}>
      {isWarning && <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEF2F2] rounded-full -translate-y-1/2 translate-x-1/3 -z-0" />}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
          {trend && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${trendBg} ${trendColor}`}>
              {trend}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[2rem] font-bold text-[#111827] leading-none mb-1">{value}</span>
          <span className="text-sm text-[#6B7280] font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}
