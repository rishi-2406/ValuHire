import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Bell,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  Video,
  ChevronRight,
  Briefcase,
  Play,
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { applicationService } from "../services/api";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import { SkeletonCard } from "../components/Skeleton";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
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
    (a) => a.status !== "SUBMITTED" && a.status !== "REJECTED"
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
    setStartingSession(application.id);
    await startAssessmentSession(application.assessmentId || application.id);
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
            <button className="icon-button w-10 h-10 hover:bg-surface-light text-on-surface-variant">
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

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#F0F4FF] to-transparent border border-[#E0E7FF] rounded-3xl p-8 mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-[2.5rem] leading-tight font-extrabold text-[#111827] mb-2 tracking-tight">
                Welcome back, {name}!
              </h2>
              <div className="flex items-center gap-2 text-[#4B5563] text-lg font-medium">
                <span className="text-[#10B981]"><Sparkles size={20} /></span>
                <p>You're making great progress. Stay focused, your next opportunity is close.</p>
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Action Required Box */}
              {pendingAction && (
                <div className="bg-gradient-to-r from-[#FEFCE8] to-white border border-[#FEF08A] rounded-2xl p-7 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#EAB308]" />
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[#CA8A04] font-bold text-[11px] tracking-widest uppercase mb-3 bg-[#FEF9C3] w-max px-2.5 py-1 rounded-md">
                        <AlertTriangle size={14} />
                        ACTION REQUIRED
                      </div>
                      <h3 className="text-[1.75rem] font-bold text-[#1F2937] mb-2 leading-tight">
                        {pendingAction.campaign?.title || "System Design Assessment"}
                      </h3>
                      <div className="flex items-center gap-2 text-[#713F12] text-sm font-semibold opacity-90">
                        <Clock size={16} />
                        Due in 2 days
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 mt-2">
                      <button
                        onClick={() => handleStart(pendingAction)}
                        disabled={startingSession === pendingAction.id}
                        className="bg-[#EAB308] hover:bg-[#CA8A04] text-white px-7 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgb(234,179,8,0.39)] disabled:opacity-70 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {startingSession === pendingAction.id ? "Starting..." : "Start Assessment"}
                        <ArrowRight size={18} />
                      </button>
                      <div className="flex items-center gap-1.5 text-xs text-[#854D0E] font-medium opacity-80 mr-1">
                        <Clock size={14} />
                        60-min timer preview
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Applications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-on-surface">Active Applications</h3>
                  <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                    View All <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {applications.length > 0 ? applications.map(app => (
                    <div key={app.id} className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-xl font-bold text-on-surface">{app.campaign?.title || "Role"}</h4>
                          <div className="flex items-center gap-2 text-on-surface-variant text-sm mt-1">
                            <Briefcase size={16} />
                            <span>{app.campaign?.company || "Company Inc."}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
                          {app.status === "INTERVIEW" ? "Interviewing" : app.status === "SCREENING" ? "Under Review" : "Applied"}
                        </span>
                      </div>
                      
                      {renderProgressSteps(app.status)}
                    </div>
                  )) : (
                    <EmptyState
                      illustration="no-applications"
                      title="No active applications"
                      description="Apply to a campaign to see your progress here."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-[#F0F4FF] border border-[#DCE4FF] rounded-2xl p-8 text-center flex flex-col items-center shadow-sm">
                {(() => {
                  const missingItems = [];
                  if (!user?.name) missingItems.push("Full Name");
                  if (!user?.bio) missingItems.push("Bio");
                  if (!user?.profilePicUrl) missingItems.push("Profile Picture");
                  if (!(user?.skills?.length || user?.specialties?.length)) missingItems.push("Specialties");
                  
                  if (missingItems.length === 0) {
                    return (
                      <div className="py-2">
                        <h3 className="text-xl font-bold text-[#1F2937] mb-2">Add more skills</h3>
                        <p className="text-sm text-[#4B5563] mb-6 leading-relaxed">
                          Your profile is looking great! Add more skills to increase your chances of being noticed.
                        </p>
                        <button onClick={() => navigate('/settings')} className="w-full bg-white border-2 border-[#10B981] text-[#10B981] font-bold py-3 rounded-xl hover:bg-[#10B981] hover:text-white transition-all shadow-sm">
                          Add Skills
                        </button>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="py-2">
                      <h3 className="text-xl font-bold text-[#1F2937] mb-2">Complete your profile</h3>
                      <p className="text-sm text-[#4B5563] mb-5 leading-relaxed">
                        Add these missing details to unlock <strong className="text-[#10B981]">5x more opportunities</strong>:
                      </p>
                      <ul className="text-left w-full space-y-2.5 mb-6 bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-[#DCE4FF] shadow-sm">
                        {missingItems.map(item => (
                          <li key={item} className="text-sm text-[#374151] flex items-center gap-2.5 font-semibold">
                            <div className="w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => navigate('/settings')} className="w-full bg-[#10B981] text-white font-bold py-3 rounded-xl hover:bg-[#059669] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        Complete Profile
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

