import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { Search, Plus } from "lucide-react";
import { campaignService } from "../services/api";
import Sidebar from "../components/layout/Sidebar";
import EmptyState from "../components/common/EmptyState";
import NewCampaignModal from "../components/CampaignsPage/NewCampaignModal";
import { CandidateCampaignCard } from "../components/CampaignsPage/CandidateCampaignCard";
import { RecruiterCampaignCard } from "../components/CampaignsPage/RecruiterCampaignCard";

export function formatTimeAgo(dateString) {
  if (!dateString) return "recently";
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
  interval = seconds / 2592000;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " min ago" : " mins ago");
  return "just now";
}

export default function CampaignsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const role = user?.role?.toLowerCase() || "candidate";
  const isCandidate = role === "candidate";

  const handleCreateCampaign = async (data) => {
    try {
      const resp = await campaignService.createCampaign({
        title: data.title,
        description: data.description,
        targetRole: data.targetRole,
        duration: data.duration,
        tags: data.tags,
        status: "DRAFT"
      });
      const newCampaign = resp.campaign || resp;
      setCampaigns((prev) => [newCampaign, ...prev]);
      toast.success("Campaign created", { title: "Redirecting to Builder..." });
      setShowCreateModal(false);
      navigate(`/campaigns/${newCampaign.id}/builder`);
    } catch (err) {
      toast.error(err.message || "Failed to create campaign");
      throw err;
    }
  };

  useEffect(() => {
    const fetcher = isCandidate ? campaignService.getPublicCampaigns() : campaignService.getMyCampaigns();
    
    fetcher
      .then(data => {
        setCampaigns(data.campaigns || data || []);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [isCandidate]);

  const filteredCampaigns = campaigns.filter(c => 
    !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.company?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role={role} />
      <main className="workspace">
        <header className="h-20 bg-white border-b border-outline-variant/50 px-8 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              {isCandidate ? "Browse Campaigns" : "All Campaigns"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/60 rounded-lg text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {!isCandidate && (
              <>
                <div className="w-px h-8 bg-outline-variant/50 mx-1"></div>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                  <Plus size={16} /> New Campaign
                </button>
              </>
            )}
          </div>
        </header>

        <div className="p-8 max-w-[1200px] mx-auto space-y-6">
          <div className={isCandidate ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {loading ? (
              <div className="text-center py-12 text-on-surface-variant col-span-full">Loading campaigns...</div>
            ) : filteredCampaigns.length > 0 ? (
              filteredCampaigns.map(c => {
                if (isCandidate) {
                  return <CandidateCampaignCard key={c.id} c={c} navigate={navigate} />;
                }
                return <RecruiterCampaignCard key={c.id} c={c} navigate={navigate} />;
              })
            ) : (
              <div className="col-span-full">
                <EmptyState
                  illustration="no-campaigns"
                  title="No campaigns found"
                  description={search ? "We couldn't find any campaigns matching your search." : "There are no campaigns available right now."}
                />
              </div>
            )}
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
