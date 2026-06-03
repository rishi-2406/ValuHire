import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { Briefcase, Clock, ArrowRight, Search, Filter, Users, Shield, Plus } from "lucide-react";
import { campaignService, applicationService } from "../services/api";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import NewCampaignModal from "../components/NewCampaignModal";

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
        location: data.location || "Remote",
        department: data.department,
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

  const handleApply = async (e, campaignId) => {
    e.stopPropagation();
    try {
      await applicationService.apply(campaignId);
      toast.success("Successfully applied to campaign!");
      navigate('/candidate');
    } catch (err) {
      toast.error(err.message || "Failed to apply");
    }
  };

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
                const isOpen = (c.status || "").toUpperCase() === "OPEN";
                const applicants = c.applicants ?? (c._count?.applications || c.applicantCount || 0);
                
                if (isCandidate) {
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => navigate(`/campaigns/${c.id}/details`)}
                      className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm flex flex-col group hover:border-[#2563EB]/50 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer h-full"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-on-surface-variant font-bold text-lg shadow-sm shrink-0">
                          {(c.company?.name || c.title || "C")[0]}
                        </div>
                        <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full text-xs font-bold border border-[#BFDBFE]">
                          {c.department || "Engineering"}
                        </span>
                      </div>
                      
                      <h4 className="text-xl font-bold text-on-surface mb-2 group-hover:text-[#2563EB] transition-colors line-clamp-2">{c.title}</h4>
                      <p className="text-sm text-on-surface-variant font-medium mb-4">{c.company?.name || "Hiring Company"}</p>
                      
                      <p className="text-sm text-on-surface-variant mb-6 line-clamp-3 flex-1">
                        {c.description || "Join our team and take part in solving exciting challenges. Apply now to start your assessment process and showcase your skills."}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2">
                          <Shield size={14} className="text-primary/70" />
                          <span>{c.location || "Remote"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2">
                          <Clock size={14} className="text-primary/70" />
                          <span>{c.assessment?.durationMinutes || 60} mins</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/campaigns/${c.id}/details`);
                        }} 
                        className="w-full flex items-center justify-center gap-2 bg-[#F8FAFC] text-on-surface-variant group-hover:bg-[#2563EB] group-hover:text-white px-4 py-3 rounded-xl font-bold text-sm border border-[#E2E8F0] group-hover:border-[#2563EB] transition-all"
                      >
                        View Details <ArrowRight size={16} />
                      </button>
                    </div>
                  );
                }

                return (
                  <div 
                    key={c.id} 
                    onClick={() => navigate(`/campaigns/${c.id}`)}
                    className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:border-[#2563EB]/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-on-surface-variant font-bold text-xl shadow-sm">
                        {(c.company?.name || c.title || "C")[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                           <h4 className="text-xl font-bold text-on-surface group-hover:text-[#2563EB] transition-colors">{c.title}</h4>
                           <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold ${isOpen ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#F3F4F6] text-[#4B5563]'}`}>
                             {isOpen ? 'OPEN' : 'CLOSED'}
                           </span>
                        </div>
                        <div className="flex items-center gap-5 text-on-surface-variant text-sm mt-1.5 font-medium">
                           <span className="flex items-center gap-1.5"><Users size={16} className="text-primary/70" /> {applicants} Applicants</span>
                           <span className="flex items-center gap-1.5"><Clock size={16} className="text-primary/70" /> {c.assessment?.durationMinutes || 60} mins</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                       <button onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${c.id}`); }} className="text-[#2563EB] font-bold flex items-center gap-2 bg-[#EFF6FF] px-4 py-2 rounded-lg border border-[#BFDBFE] hover:bg-[#DBEAFE]">
                         View Details <ArrowRight size={16} />
                       </button>
                    </div>
                  </div>
                );
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
