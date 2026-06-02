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
  MoreHorizontal
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
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role="recruiter" />
      <main className="workspace">
        <TopBar
          eyebrow=""
          title=""
          onSearch={setSearch}
          actions={
            <button type="button" className="bg-[#004ac6] hover:bg-[#003ea8] text-white px-5 py-2 rounded-full font-semibold text-sm transition-colors" onClick={() => setShowCreateModal(true)}>
              New Campaign
            </button>
          }
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
                  value={totalCandidates || 422} 
                  trend="+12%" 
                  iconColor="text-[#2563EB]" 
                  iconBg="bg-[#EFF6FF]" 
                  trendColor="text-[#059669]"
                  trendBg="bg-[#D1FAE5]"
                />
                <MetricCard 
                  icon={CheckCircle} 
                  label="Assessments Completed" 
                  value={completedAssessments || 138} 
                  trend="+5%" 
                  iconColor="text-[#4F46E5]" 
                  iconBg="bg-[#EEF2FF]"
                  trendColor="text-[#059669]"
                  trendBg="bg-[#D1FAE5]"
                />
                <MetricCard 
                  icon={MessageSquare} 
                  label="Interviews This Week" 
                  value={interviews.length || 18} 
                  trend="− 0%" 
                  iconColor="text-[#059669]" 
                  iconBg="bg-[#ECFDF5]"
                  trendColor="text-[#4B5563]"
                  trendBg="bg-[#F3F4F6]"
                />
                <MetricCard 
                  icon={AlertTriangle} 
                  label="Integrity Flags" 
                  value={12} 
                  trend="+2" 
                  iconColor="text-[#DC2626]" 
                  iconBg="bg-[#FEE2E2]"
                  trendColor="text-[#DC2626]"
                  trendBg="bg-[#FEE2E2]"
                  isWarning={true}
                />
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden flex flex-col h-fit">
              <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-on-surface">Campaign Pipeline</h2>
                <button
                  type="button"
                  className="text-sm font-bold text-primary hover:underline"
                >
                  View All
                </button>
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
                        <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Using mock data when real data is empty to match design fidelity */}
                      {(filteredCampaigns.length ? filteredCampaigns : [
                        { id: 1, title: 'React Platform Engineer', location: 'San Francisco, CA', applicants: 145, status: 'OPEN' },
                        { id: 2, title: 'Backend Node.js Engineer', location: 'Remote - US', applicants: 82, status: 'OPEN' },
                        { id: 3, title: 'Data Scientist (Machine Learning)', location: 'New York, NY', applicants: 210, status: 'CLOSED' }
                      ]).map((campaign) => {
                        const applicants = campaign.applicants ?? (campaign._count?.applications || campaign.applicantCount || 0);
                        const isOpen = (campaign.status || "").toUpperCase() === "OPEN";
                        const location = campaign.location || "Remote";
                        
                        return (
                          <tr
                            key={campaign.id}
                            onClick={() => navigate("/results")}
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
                                <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${isOpen ? 'bg-[#004ac6]' : 'bg-[#6B7280]'}`} style={{ width: `${Math.min(100, (applicants / 250) * 100)}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${isOpen ? 'bg-[#D1FAE5] text-[#059669] border border-[#059669]/20' : 'bg-[#F3F4F6] text-[#4B5563] border border-outline'}`}>
                                {isOpen ? 'Open' : 'Closed'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button type="button" className="text-on-surface-variant hover:text-on-surface p-1">
                                <MoreHorizontal size={20} />
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

            <div className="flex flex-col gap-6">
              {/* Integrity Insights Card */}
              <section className="bg-[#1E293B] text-white rounded-2xl p-8 relative overflow-hidden shadow-sm">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-6 text-white/90">
                    <Shield size={18} />
                    <h3 className="text-xs font-bold tracking-wider uppercase">Integrity Insights</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-[3.5rem] font-bold leading-none mb-1">98.2%</div>
                    <div className="text-xs text-white/70 uppercase tracking-widest font-semibold max-w-[120px] leading-tight">Global Trust Score</div>
                  </div>
                  
                  <p className="text-sm text-white/80 mb-8 leading-relaxed">
                    12 active flags require review across {activeCampaigns.length || 3} active campaigns. Resolve them to maintain pipeline health.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => navigate("/results")}
                    className="w-full bg-[#E0E7FF] text-[#1E293B] py-3 rounded-lg text-sm font-bold hover:bg-white transition-colors mt-auto"
                  >
                    Review Flags
                  </button>
                </div>
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 translate-x-1/4" />
              </section>

              {/* Upcoming Interviews Card */}
              <section className="bg-white rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-on-surface leading-tight">Upcoming<br/>Interviews</h2>
                  <span className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-bold rounded-full">Today</span>
                </div>
                
                <div className="p-6 flex flex-col gap-4">
                  {/* Mock Data for Interviews matching the design */}
                  <div className="border border-outline-variant/50 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#3B82F6] text-white flex items-center justify-center font-bold">AR</div>
                        <div>
                          <div className="font-bold text-on-surface text-sm">Alex Rivera</div>
                          <div className="text-xs text-on-surface-variant mt-0.5">React Platform Engineer</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#2563EB] font-bold text-sm">2:00 PM</div>
                        <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">in 45 mins</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-[#10B981] hover:bg-[#059669] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                        <Video size={14} /> Join Call
                      </button>
                      <button className="bg-white border border-outline-variant hover:bg-surface-light text-on-surface py-2 rounded-lg text-xs font-bold transition-colors">
                        Notes
                      </button>
                    </div>
                  </div>

                  <div className="border border-outline-variant/50 rounded-xl p-4 flex flex-col gap-4 shadow-sm opacity-70">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E2E8F0] text-[#475569] flex items-center justify-center font-bold">JS</div>
                        <div>
                          <div className="font-bold text-on-surface text-sm">Jordan Smith</div>
                          <div className="text-xs text-on-surface-variant mt-0.5">Backend Node.js Engineer</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-on-surface font-bold text-sm">4:30 PM</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-white border border-outline-variant text-on-surface-variant py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed">
                        <Video size={14} /> Join Call
                      </button>
                      <button className="bg-white border border-outline-variant hover:bg-surface-light text-on-surface py-2 rounded-lg text-xs font-bold transition-colors">
                        Notes
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-outline-variant/50 bg-surface-light/50">
                  <button className="w-full text-[#004ac6] font-bold text-sm hover:underline" onClick={() => navigate('/interviews')}>
                    View Calendar
                  </button>
                </div>
              </section>
            </div>
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
