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
  BarChart3
} from "lucide-react";
import { applicationService, campaignService, resultsService, interviewService } from "../services/api";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import { SkeletonCard } from "../components/Skeleton";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [pastResults, setPastResults] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingSession, setStartingSession] = useState(null);

  useEffect(() => {
    Promise.all([
      campaignService.getPublicCampaigns().catch(() => ({ campaigns: [] })),
      applicationService.getMyApplications().catch(() => ({ applications: [] })),
      resultsService.getMyResults().catch(() => ({ results: [] })),
      interviewService.getMyInterviews().catch(() => ({ slots: [] }))
    ])
      .then(([campaignData, appData, resultsData, interviewData]) => {
        setCampaigns(campaignData.campaigns || campaignData || []);
        setApplications(appData.applications || appData || []);
        setPastResults(resultsData.results || resultsData || []);
        setInterviews(interviewData.slots || interviewData.interviews || interviewData || []);
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
              {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Welcome Banner */}
          <div>
            <h2 className="text-[2.5rem] leading-tight font-extrabold text-[#111827] mb-2 tracking-tight">
              Welcome back, {name}!
            </h2>
            <div className="flex items-center gap-2 text-[#4B5563] text-lg">
              <span className="text-[#10B981]"><Sparkles size={20} /></span>
              <p>You're making great progress. Stay focused, your next opportunity is close.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Action Required Box */}
              {pendingAction && (
                <div className="bg-white border-l-4 border-l-[#EAB308] border-y border-r border-outline-variant/50 rounded-r-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[#EAB308] font-bold text-xs tracking-wider uppercase mb-3">
                        <AlertTriangle size={16} />
                        ACTION REQUIRED
                      </div>
                      <h3 className="text-[1.75rem] font-bold text-on-surface mb-2">
                        {pendingAction.campaign?.title || "System Design Assessment"}
                      </h3>
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                        <Clock size={16} />
                        Due in 2 days
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <button
                        onClick={() => handleStart(pendingAction)}
                        disabled={startingSession === pendingAction.id}
                        className="bg-[#EAB308] hover:bg-[#CA8A04] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                      >
                        {startingSession === pendingAction.id ? "Starting..." : "Start Assessment"}
                        <ArrowRight size={18} />
                      </button>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
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
                      icon={Briefcase}
                      title="No active applications"
                      description="Apply to a campaign to see your progress here."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <div className="bg-[#F0F4FF] border border-[#DCE4FF] rounded-2xl p-8 text-center flex flex-col items-center shadow-sm">
                <div className="relative w-32 h-32 mb-6">
                  {(() => {
                    let score = 20; // base score for signed up
                    if (user?.name) score += 20;
                    if (user?.bio) score += 20;
                    if (user?.avatar) score += 20;
                    if (user?.specialties?.length) score += 20;
                    const strokeOffset = 282.7 - (282.7 * (score / 100));
                    return (
                      <>
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#2B7B59" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset={strokeOffset} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[1.75rem] font-bold text-[#1E293B]">{score}%</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">Profile Completion</h3>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  Complete your profile to unlock <strong className="text-[#2B7B59]">5x more opportunities</strong> and stand out to recruiters.
                </p>
                <button onClick={() => navigate('/settings')} className="w-full bg-white border border-[#2B7B59] text-[#2B7B59] font-bold py-2.5 rounded-lg hover:bg-[#2B7B59]/5 transition-colors">
                  Complete Profile
                </button>
              </div>

              {/* Schedule */}
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-lg mb-6 text-on-surface">
                  <Clock size={20} />
                  Schedule
                </div>
                {interviews.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No upcoming interviews scheduled.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {interviews.slice(0, 3).map((interview) => {
                      const dt = new Date(interview.scheduledAt || interview.startsAt);
                      const month = dt.toLocaleString('default', { month: 'short' });
                      const day = dt.getDate();
                      const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={interview.id} className="flex gap-4">
                          <div className="bg-[#EFF6FF] rounded-xl p-3 flex flex-col items-center justify-center min-w-[72px]">
                            <span className="text-[10px] font-bold text-[#3B82F6] tracking-widest uppercase">{month}</span>
                            <span className="text-2xl font-bold text-[#1E293B] leading-none mt-1">{day}</span>
                          </div>
                          <div className="flex flex-col justify-center">
                            <h4 className="font-bold text-sm text-on-surface mb-1">{interview.campaign?.title || interview.role || "Technical Interview"}</h4>
                            <p className="text-xs text-on-surface-variant mb-2">{time}</p>
                            <button className="flex items-center gap-1.5 text-xs font-bold text-[#3B82F6] hover:underline">
                              <Video size={14} /> Join Link
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Recent Results */}
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-lg mb-6 text-on-surface">
                  <BarChart3 size={20} />
                  Recent Results
                </div>
                {pastResults.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No completed assessments.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {pastResults.slice(0, 3).map((result) => {
                       const dt = new Date(result.createdAt || result.completedAt || Date.now());
                       const month = dt.toLocaleString('default', { month: 'short' });
                       const day = dt.getDate();
                       return (
                         <div key={result.id} className="bg-[#F8FAFC] border border-outline-variant/50 rounded-xl p-4 flex items-center gap-4">
                           <div className="w-12 h-12 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#10B981]">
                             <Code size={20} />
                           </div>
                           <div className="flex-1">
                             <h4 className="font-bold text-sm text-on-surface">{result.campaign?.title || "Assessment"}</h4>
                             <p className="text-[11px] text-on-surface-variant mt-0.5">Completed {month} {day}</p>
                           </div>
                           <div className="text-right">
                             <div className="text-xl font-bold text-[#10B981]">{result.score || 0}%</div>
                           </div>
                         </div>
                       )
                    })}
                  </div>
                )}
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

