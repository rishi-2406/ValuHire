import { useAuth } from "../hooks/useAuth";
import { FileCheck2, BarChart3, LogOut, Users, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { applicationService, campaignService } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      campaignService.getPublicCampaigns(),
      applicationService.getMyApplications()
    ])
      .then(([campaignData, appData]) => {
        setCampaigns(campaignData.campaigns || campaignData || []);
        setApplications(appData.applications || appData || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const appliedCampaignIds = new Set(applications.map(a => a.campaignId));

  const handleApply = async (campaignId) => {
    try {
      await applicationService.apply(campaignId);
      setApplications(prev => [...prev, { campaignId }]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">VH</div>
          <div>
            <strong>ValuHire</strong>
            <span>Technical hiring</span>
          </div>
        </div>
        <nav className="nav-list">
          <button className="nav-item active">
            <FileCheck2 size={17} />
            <span>Campaigns</span>
          </button>
          <button className="nav-item">
            <Play size={17} />
            <span>My Assessments</span>
          </button>
          <button className="nav-item">
            <BarChart3 size={17} />
            <span>Results</span>
          </button>
          <button className="nav-item">
            <Users size={17} />
            <span>Interviews</span>
          </button>
        </nav>
        <div className="sidebar-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={logout} className="icon-button" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">V1 MVP</span>
            <h1>Candidate Workspace</h1>
          </div>
        </header>

        <div className="stack">
          <section className="panel">
            <PanelHeader title="Available campaigns" action="Apply" icon={FileCheck2} />
            {loading && <div className="p-md text-body-sm text-[#6b7280]">Loading campaigns...</div>}
            {error && <div className="p-md text-body-sm text-red-500">{error}</div>}
            <div className="card-grid">
              {campaigns.map(campaign => {
                const hasApplied = appliedCampaignIds.has(campaign.id);
                return (
                  <article key={campaign.id} className="mini-card">
                    <strong>{campaign.title}</strong>
                    <p>{campaign.description || "Technical Assessment"}</p>
                    <button
                      className="secondary-button"
                      disabled={loading || hasApplied}
                      onClick={() => !hasApplied && handleApply(campaign.id)}
                    >
                      {hasApplied ? "Applied" : "Apply"}
                    </button>
                  </article>
                );
              })}
              {!loading && campaigns.length === 0 && (
                <p className="text-body-sm text-[#6b7280] col-span-2">No campaigns available right now.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <PanelHeader title="Past performance" action="History" icon={BarChart3} />
            <div className="timeline">
              <DataRow label="React Platform Engineer" value="92 / 100" />
              <DataRow label="Node.js API Engineer" value="84 / 100" />
              <DataRow label="Graduate Developer" value="76 / 100" />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function PanelHeader({ title, action, icon: Icon }) {
  return (
    <div className="panel-header">
      <div>
        <Icon size={18} />
        <h2>{title}</h2>
      </div>
      <button className="secondary-button">{action}</button>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="data-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}