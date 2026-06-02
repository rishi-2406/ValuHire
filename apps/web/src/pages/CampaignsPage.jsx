import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Briefcase, Clock, ArrowRight, Search, Filter } from "lucide-react";
import { campaignService } from "../services/api";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";

export default function CampaignsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    campaignService.getPublicCampaigns()
      .then(data => {
        setCampaigns(data.campaigns || data || []);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCampaigns = campaigns.filter(c => 
    !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.company?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role="candidate" />
      <main className="workspace">
        <header className="h-20 bg-white border-b border-outline-variant/50 px-8 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Browse Campaigns</h1>
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
            <button className="w-10 h-10 border border-outline-variant/60 rounded-lg flex items-center justify-center hover:bg-surface-container-low transition-colors">
              <Filter size={18} className="text-on-surface-variant" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-[1200px] mx-auto space-y-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-on-surface-variant">Loading campaigns...</div>
            ) : filteredCampaigns.length > 0 ? (
              filteredCampaigns.map(c => (
                <div key={c.id} className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:border-[#2563EB]/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-on-surface-variant font-bold text-xl shadow-sm">
                      {(c.company?.name || "C")[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-on-surface group-hover:text-[#2563EB] transition-colors">{c.title}</h4>
                      <div className="flex items-center gap-5 text-on-surface-variant text-sm mt-1.5 font-medium">
                        <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-primary/70" /> {c.company?.name || "Company"}</span>
                        <span className="flex items-center gap-1.5"><Clock size={16} className="text-primary/70" /> {c.assessment?.durationMinutes || 60} mins</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/candidate'); }} className="text-[#2563EB] font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 bg-[#EFF6FF] px-6 py-2.5 rounded-xl border border-[#BFDBFE]">
                    Apply Now <ArrowRight size={18} />
                  </button>
                </div>
              ))
            ) : (
              <EmptyState
                illustration="no-campaigns"
                title="No active campaigns found"
                description={search ? "We couldn't find any campaigns matching your search." : "There are no public campaigns available right now."}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
