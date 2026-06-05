import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { HelpCircle, AlertTriangle, ArrowRight, ChevronRight, Briefcase, Bell } from "lucide-react";
import { applicationService } from "../services/api";
import { useNotifications } from "../hooks/useNotifications";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";
import { ProfileCompletionCard } from "../components/CandidateDashboard/ProfileCompletionCard";
import { StatsOverview } from "../components/CandidateDashboard/StatsOverview";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { unreadCount } = useNotifications(user);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingSession, setStartingSession] = useState(null);

  useEffect(() => {
    applicationService.getMyApplications()
      .then((appData) => {
        setApplications(appData.applications || appData || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const inProgressCampaigns = applications.filter(
    (a) => !["SUBMITTED", "ASSESSMENT_COMPLETED", "REJECTED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED"].includes(a.status)
  );
  const pendingAction = inProgressCampaigns.length > 0 ? inProgressCampaigns[0] : null;

  const startAssessmentSession = async (assessmentId) => {
    try {
      const data = await applicationService.startSession(assessmentId);
      const session = data.session || data;
      if (session?.id) {
        navigate(`/assessment/${session.id}`);
      } else {
        toast.error("Could not start session");
      }
    } catch (err) {
      toast.error(err.message || "Failed to start session");
    }
  };

  const handleStart = async (application) => {
    if (startingSession) return;
    const assessmentId = application.campaign?.assessment?.id;
    if (!assessmentId) {
      toast.error("This campaign does not have an active assessment.");
      return;
    }
    setStartingSession(application.id);
    await startAssessmentSession(assessmentId);
    setStartingSession(null);
  };

  const name = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role="candidate" />
      <main className="workspace">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-outline-variant/50 sticky top-0 z-40">
          <h1 className="text-title-lg font-bold text-on-surface">Overview</h1>
          <div className="flex items-center gap-4">
            <NotificationBell user={user} />
            <button className="icon-button w-10 h-10 hover:bg-surface-light text-on-surface-variant">
              <HelpCircle size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm ml-2 overflow-hidden border border-outline">
              {user?.profilePicUrl ? <img src={user.profilePicUrl} alt="Avatar" className="w-full h-full object-cover" /> : name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 mb-8 relative shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight">
                Welcome back, {name}!
              </h2>
              <div className="text-on-surface-variant font-medium">
                <p>Stay focused, your next opportunity is close.</p>
              </div>
            </div>
            <div className="hidden md:flex w-16 h-16 rounded-2xl bg-surface-container-low border border-outline-variant/50 text-on-surface items-center justify-center">
              <Briefcase size={28} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <StatsOverview applications={applications} navigate={navigate} />

              {pendingAction && (
                <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEF9C3] text-[#CA8A04] flex items-center justify-center shrink-0 border border-[#FEF08A]/50">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-lg">Pending Assessment</h4>
                      <p className="text-sm text-on-surface-variant font-medium mt-0.5">
                        <strong className="text-on-surface">{pendingAction.campaign?.title}</strong> at {pendingAction.campaign?.company?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/campaigns/${pendingAction.campaign?.id}/details`)}
                    className="w-full sm:w-auto bg-[#111827] hover:bg-[#1F2937] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm text-sm shrink-0"
                  >
                    Take Assessment <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <div
                onClick={() => navigate("/notifications")}
                className="cursor-pointer flex items-center gap-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl px-5 py-4 hover:bg-[#DBEAFE] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Bell size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1E40AF]">
                    You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-[#3B82F6] font-medium mt-0.5">Click to view your notifications</p>
                </div>
                <ChevronRight size={18} className="text-[#2563EB] shrink-0" />
              </div>
            )}

            <div className="space-y-6">
              <ProfileCompletionCard user={user} navigate={navigate} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

