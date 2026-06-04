import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  Video,
  ChevronRight,
  Briefcase,
  Play,
  BarChart3,
  CheckCircle2,
  Bell
} from "lucide-react";
import { applicationService } from "../services/api";
import { useNotifications } from "../hooks/useNotifications";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import { SkeletonCard } from "../components/Skeleton";
import NotificationBell from "../components/NotificationBell";

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

  const renderProgressSteps = (currentStatus) => {
    const steps = [
      { id: "applied", label: "Applied" },
      { id: "screening", label: "Screening" },
      { id: "interview", label: "Interview" },
      { id: "offer", label: "Offer" }
    ];
    
    // Simple mock logic for status mapping
    let activeIndex = 0;
    if (currentStatus === "SCREENING") activeIndex = 1;
    if (currentStatus === "INTERVIEW") activeIndex = 2;
    if (currentStatus === "OFFER") activeIndex = 3;

    return (
      <div className="relative mt-6 px-4">
        <div className="absolute top-2.5 left-8 right-8 h-[2px] bg-outline-variant">
          <div 
            className="absolute top-0 left-0 h-full bg-[#3B82F6]" 
            style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-5 h-5 rounded-full flex items-center justify-center z-10 ${
                    isCompleted 
                      ? 'bg-[#3B82F6] text-white border-2 border-[#3B82F6]' 
                      : isActive 
                        ? 'bg-white border-[3px] border-[#3B82F6]' 
                        : 'bg-white border-2 border-outline-variant'
                  }`}
                >
                  {isCompleted && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4.5L3.5 7L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />}
                </div>
                <span className={`text-xs font-semibold ${isActive || isCompleted ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role="candidate" />
      <main className="workspace">
        {/* Custom Header for Candidate Dashboard */}
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
          {/* Welcome Banner */}
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
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 bg-white rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between group hover:border-[#2563EB]/40 transition-all cursor-pointer" onClick={() => navigate("/applications")}>
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-on-surface">{applications.length}</div>
                    <div className="text-sm text-on-surface-variant font-semibold mt-1">Total Applied</div>
                  </div>
                </div>
                
                <div className="p-6 bg-white rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between group hover:border-[#D97706]/40 transition-all cursor-pointer" onClick={() => navigate("/applications")}>
                  <div className="w-10 h-10 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-on-surface">{applications.filter(a => a.campaign?.assessment && !["SUBMITTED", "ASSESSMENT_COMPLETED", "REJECTED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED"].includes(a.status)).length}</div>
                    <div className="text-sm text-on-surface-variant font-semibold mt-1">Pending Test</div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between group hover:border-[#059669]/40 transition-all cursor-pointer" onClick={() => navigate("/interviews")}>
                  <div className="w-10 h-10 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Video size={20} />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-on-surface">{applications.filter(a => ["INTERVIEW_SCHEDULED", "INTERVIEW"].includes(a.status)).length}</div>
                    <div className="text-sm text-on-surface-variant font-semibold mt-1">Interviews</div>
                  </div>
                </div>
              </div>

              {/* Pending Assessment Reminder */}
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

            {/* Unread notification prompt */}
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

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm">
                {(() => {
                  // Core required fields
                  const coreChecks = [
                    { label: "Full Name",        ok: !!user?.name },
                    { label: "Bio",              ok: !!user?.bio },
                    { label: "Profile Picture",  ok: !!user?.profilePicUrl },
                    { label: "Resume",           ok: !!user?.resumeUrl },
                    { label: "Skills / Specialties", ok: !!(user?.skills?.length || user?.specialties?.length) },
                  ];

                  // Profile links (at least one recommended)
                  const linkChecks = [
                    { label: "GitHub profile",     ok: !!user?.githubUrl },
                    { label: "LinkedIn profile",   ok: !!user?.linkedinUrl },
                    { label: "LeetCode profile",   ok: !!user?.leetcodeUrl },
                    { label: "Codeforces profile", ok: !!user?.codeforcesUrl },
                    { label: "Portfolio / Website",ok: !!user?.portfolioUrl },
                  ];

                  const missingCore  = coreChecks.filter(c => !c.ok).map(c => ({ label: c.label, isLink: false }));
                  const missingLinks = linkChecks.filter(c => !c.ok).map(c => ({ label: c.label, isLink: true }));
                  const hasAnyLink   = linkChecks.some(c => c.ok);

                  // Count towards total: 5 core + "at least one link" counts as 1
                  const total    = coreChecks.length + 1;
                  const achieved = coreChecks.filter(c => c.ok).length + (hasAnyLink ? 1 : 0);
                  const pct      = Math.round((achieved / total) * 100);

                  // "Complete" = all core fields + at least one link
                  const isComplete = missingCore.length === 0 && hasAnyLink;

                  // Compile display list
                  const displayMissing = [
                    ...missingCore,
                    ...(!hasAnyLink ? [{ label: "At least one profile link", isLink: true }] : []),
                  ];

                  // Additional link suggestions when core is done but some links are absent
                  const suggestLinks = hasAnyLink && missingLinks.length > 0 ? missingLinks : [];

                  if (isComplete && suggestLinks.length === 0) {
                    return (
                      <div>
                        <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center mb-5 border border-outline-variant/50">
                          <CheckCircle2 size={24} className="text-[#059669]" />
                        </div>
                        <h3 className="text-xl font-bold text-on-surface mb-2">Profile Complete</h3>
                        <p className="text-sm text-on-surface-variant mb-6 font-medium leading-relaxed">
                          Your profile is fully fleshed out. Feel free to keep adding more skills and projects.
                        </p>
                        <button onClick={() => navigate('/settings')} className="w-full bg-white hover:bg-surface-container-low border border-outline-variant text-on-surface font-bold py-3 rounded-xl transition-colors shadow-sm">
                          Edit Profile
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center mb-5 border border-outline-variant/50">
                        <AlertTriangle size={24} className={isComplete ? "text-[#D97706]" : "text-on-surface-variant"} />
                      </div>

                      <h3 className="text-xl font-bold text-on-surface mb-1">
                        {isComplete ? "Add More Profiles" : "Incomplete Profile"}
                      </h3>
                      <p className="text-sm text-on-surface-variant mb-4 font-medium leading-relaxed">
                        {isComplete
                          ? "You look great! Consider adding more profile links:"
                          : "Add these details to stand out to recruiters:"}
                      </p>

                      {/* Missing items */}
                      {displayMissing.length > 0 && (
                        <ul className="space-y-2 mb-4">
                          {displayMissing.map(item => (
                            <li key={item.label} className="text-sm text-on-surface font-semibold flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                              {item.label}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Suggested extra links */}
                      {suggestLinks.length > 0 && (
                        <div className="border-t border-outline-variant/30 pt-3 mt-3 mb-4">
                          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Also recommended</p>
                          <ul className="space-y-1.5">
                            {suggestLinks.map(item => (
                              <li key={item.label} className="text-xs text-on-surface-variant flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" />
                                {item.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button onClick={() => navigate('/settings')} className="w-full bg-[#111827] text-white font-bold py-3 rounded-xl hover:bg-[#1F2937] transition-all shadow-sm active:scale-95 mt-2">
                        {isComplete ? "Add Profile Links" : "Complete Profile"}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Code({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  );
}
function Sparkles({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c7 7 9 9 9 9s-2 2-9 9-9-9-9-9 2-2 9-9z"></path>
    </svg>
  );
}

