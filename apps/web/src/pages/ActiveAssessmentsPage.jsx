import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Bell,
  HelpCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { applicationService, resultsService } from "../services/api";
import Sidebar from "../components/layout/Sidebar";
import EmptyState from "../components/common/EmptyState";
import { ApplicationCard } from "../components/ActiveAssessmentsPage/ApplicationCard";

export default function ActiveAssessmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [resultsMap, setResultsMap] = useState({});

  useEffect(() => {
    Promise.all([
      applicationService.getMyApplications(),
      resultsService.getMyResults().catch(() => ({ results: [] }))
    ])
      .then(([appData, resData]) => {
        setApplications(appData.applications || appData || []);
        const rMap = {};
        const resList = resData.results || resData || [];
        resList.forEach(r => {
          const campaignId = r.session?.assessment?.campaignId || r.session?.assessment?.campaign?.id;
          if (campaignId) {
             rMap[campaignId] = r;
          }
        });
        setResultsMap(rMap);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const name = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role="candidate" />
      <main className="workspace">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-outline-variant/50 sticky top-0 z-40">
          <h1 className="text-title-lg font-bold text-on-surface">My Applications</h1>
          <div className="flex items-center gap-4">
            <button 
              className="icon-button w-10 h-10 hover:bg-surface-light text-on-surface-variant"
              onClick={() => navigate('/notifications')}
            >
              <Bell size={20} />
            </button>
            <button className="icon-button w-10 h-10 hover:bg-surface-light text-on-surface-variant">
              <HelpCircle size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm ml-2 overflow-hidden border border-outline">
              {user?.profilePicUrl ? <img src={user.profilePicUrl} alt="Avatar" className="w-full h-full object-cover" /> : name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Active & Past Applications</h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Track the progress of your submitted job applications and assessments.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin mb-3" />
              <span className="text-sm font-semibold text-on-surface-variant">Loading your applications...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
              <AlertTriangle className="shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-6">
              {applications.map(app => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  resultsMap={resultsMap}
                  navigate={navigate}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              illustration="no-applications"
              title="No applications yet"
              description="Browse active hiring campaigns and apply to start your assessment."
              action={
                <button
                  onClick={() => navigate("/campaigns")}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors text-sm shadow-sm"
                >
                  Browse Campaigns <ArrowRight size={16} />
                </button>
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
