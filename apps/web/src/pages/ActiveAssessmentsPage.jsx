import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Bell,
  HelpCircle,
  Clock,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { applicationService } from "../services/api";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";

export default function ActiveAssessmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    applicationService.getMyApplications()
      .then((appData) => {
        setApplications(appData.applications || appData || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const name = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const renderProgressSteps = (currentStatus) => {
    const steps = [
      { id: "applied", label: "Applied" },
      { id: "screening", label: "Screening" },
      { id: "interview", label: "Interview" },
      { id: "offer", label: "Offer" }
    ];
    
    let activeIndex = 0;
    if (currentStatus === "SCREENING") activeIndex = 1;
    if (currentStatus === "INTERVIEW") activeIndex = 2;
    if (currentStatus === "OFFER") activeIndex = 3;
    if (currentStatus === "ASSESSMENT_COMPLETED") activeIndex = 1;

    return (
      <div className="relative mt-6 px-4">
        <div className="absolute top-2.5 left-8 right-8 h-[2px] bg-outline-variant">
          <div 
            className="absolute top-0 left-0 h-full bg-[#2563EB]" 
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
                      ? 'bg-[#2563EB] text-white border-2 border-[#2563EB]' 
                      : isActive 
                        ? 'bg-white border-[3px] border-[#2563EB]' 
                        : 'bg-white border-2 border-outline-variant'
                  }`}
                >
                  {isCompleted && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4.5L3.5 7L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
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
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-outline-variant/50 sticky top-0 z-40">
          <h1 className="text-title-lg font-bold text-on-surface">My Applications</h1>
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
              {applications.map(app => {
                const hasAssessment = !!app.campaign?.assessment;
                const isCompleted = app.status === "ASSESSMENT_COMPLETED" || app.status === "SUBMITTED";
                const isInvited = app.status === "ASSESSMENT_INVITED" || app.status === "PENDING";
                
                return (
                  <div key={app.id} className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-[#111827]">{app.campaign?.title || "Role"}</h3>
                          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-semibold mt-1">
                            <Briefcase size={16} className="text-[#2563EB]/70" />
                            <span>{app.campaign?.company?.name || "Company Inc."}</span>
                          </div>
                        </div>
                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                          isCompleted 
                            ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' 
                            : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                        }`}>
                          {app.status === "INTERVIEW" ? "Interviewing" : isCompleted ? "Assessment Done" : "Assessment Pending"}
                        </span>
                      </div>

                      {renderProgressSteps(app.status)}
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-outline-variant/40 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                      {hasAssessment && (
                        <div className="text-left md:text-right">
                          <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Assessment</div>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold ${isCompleted ? 'text-[#059669]' : 'text-[#D97706]'}`}>
                            {isCompleted ? (
                              <><CheckCircle2 size={14} /> Completed</>
                            ) : (
                              <><Clock size={14} /> Pending Action</>
                            )}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/campaigns/${app.campaign.id}/details`)}
                        className={`w-full md:w-auto font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm border ${
                          isCompleted
                            ? 'bg-white hover:bg-surface-light border-outline-variant text-on-surface'
                            : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-transparent shadow-sm'
                        }`}
                      >
                        {isCompleted ? "View Details" : "Start Assessment"}
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
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
