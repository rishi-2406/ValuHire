import { AlertTriangle, Plus } from "lucide-react";
import EmptyState from "../common/EmptyState";
import { SkeletonTable } from "../common/Skeleton";

export function CampaignPipeline({
  loading,
  error,
  filteredCampaigns,
  setShowCreateModal,
  navigate
}) {
  return (
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
  );
}
