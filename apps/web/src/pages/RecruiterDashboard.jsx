import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Users,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  CalendarDays
} from "lucide-react";
import { campaignService, interviewService } from "../services/api";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import { SkeletonMetricGrid } from "../components/common/Skeleton";
import NewCampaignModal from "../components/CampaignsPage/NewCampaignModal";
import { MetricCard } from "../components/RecruiterDashboard/MetricCard";
import { CampaignPipeline } from "../components/RecruiterDashboard/CampaignPipeline";

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
            <CampaignPipeline
              loading={loading}
              error={error}
              filteredCampaigns={filteredCampaigns}
              setShowCreateModal={setShowCreateModal}
              navigate={navigate}
            />
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
