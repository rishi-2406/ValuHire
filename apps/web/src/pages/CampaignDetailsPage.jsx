import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { 
  ArrowLeft, 
  Briefcase, 
  Clock, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Code, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";
import { campaignService, applicationService } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function CampaignDetailsPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const campaignData = await campaignService.getCampaignDetails(campaignId);
        setCampaign(campaignData.campaign || campaignData);

        const appsData = await applicationService.getMyApplications();
        const list = appsData.applications || appsData || [];
        const found = list.find(app => app.campaignId === campaignId);
        setApplication(found);
      } catch (err) {
        toast.error(err.message || "Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [campaignId, toast]);

  const handleApplyOnly = async () => {
    try {
      setApplying(true);
      const res = await applicationService.apply(campaignId);
      const newApp = res.application || res;
      setApplication(newApp);
      toast.success("Applied successfully!", { title: "You can start the assessment later from the dashboard." });
    } catch (err) {
      toast.error(err.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  const handleApplyAndStart = async () => {
    try {
      setStarting(true);
      let app = application;
      if (!app) {
        const res = await applicationService.apply(campaignId);
        app = res.application || res;
        setApplication(app);
      }

      const assessmentId = campaign?.assessment?.id;
      if (!assessmentId) {
        toast.error("This campaign does not have an active assessment.");
        return;
      }

      const sessionData = await applicationService.startSession(assessmentId);
      const session = sessionData.session || sessionData;
      if (session?.id) {
        navigate(`/assessment/${session.id}`);
      } else {
        toast.error("Could not start assessment session");
      }
    } catch (err) {
      toast.error(err.message || "Failed to start assessment");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell bg-[#F8FAFC]">
        <Sidebar role="candidate" />
        <main className="workspace flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin" />
            <span className="text-sm font-semibold text-on-surface-variant">Loading campaign details...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="app-shell bg-[#F8FAFC]">
        <Sidebar role="candidate" />
        <main className="workspace flex flex-col items-center justify-center p-8 text-center min-h-[80vh]">
          <AlertTriangle size={48} className="text-error-coral mb-4" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">Campaign Not Found</h2>
          <p className="text-on-surface-variant max-w-md mb-6">
            The campaign you are looking for does not exist or you do not have permission to view it.
          </p>
          <button onClick={() => navigate("/campaigns")} className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm">
            <ArrowLeft size={16} /> Back to Campaigns
          </button>
        </main>
      </div>
    );
  }

  const mcqs = campaign.assessment?.mcqQuestions || [];
  const codings = campaign.assessment?.codingQuestions || [];
  const hasAssessment = !!campaign.assessment;

  const totalMcqs = mcqs.length;
  const totalCodings = codings.length;

  const mcqDur = campaign.assessment?.mcqDurationMinutes || 0;
  const codingDur = campaign.assessment?.codingDurationMinutes || 0;
  const totalDur = mcqDur + codingDur || campaign.assessment?.durationMinutes || 60;

  const isSubmitted = application?.status === "ASSESSMENT_COMPLETED" || application?.status === "SUBMITTED";

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role="candidate" />
      <main className="workspace">
        <header className="h-20 bg-white border-b border-outline-variant/50 px-8 flex items-center gap-4 sticky top-0 z-40">
          <button 
            onClick={() => navigate("/campaigns")} 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant border border-outline-variant/60"
            title="Back to Campaigns"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">{campaign.title}</h1>
            <p className="text-xs text-on-surface-variant font-semibold flex items-center gap-1.5 mt-0.5">
              <Briefcase size={14} className="text-[#2563EB]/70" />
              {campaign.company?.name || "Company Details"}
            </p>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-3">Job Description & Details</h3>
                <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap font-medium">
                  {campaign.description || "No description provided for this job campaign. Please refer to the assessment parameters on the right."}
                </div>
              </div>

              {hasAssessment && campaign.assessment.instructions && (
                <div className="pt-6 border-t border-outline-variant/40">
                  <h3 className="text-lg font-bold text-on-surface mb-3">Assessment Instructions</h3>
                  <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap font-medium bg-[#F8FAFC] border border-outline-variant/50 rounded-2xl p-5">
                    {campaign.assessment.instructions}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] border border-[#E0E7FF] rounded-3xl p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0">
                <Sparkles size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-base mb-1">AI-Powered Skill Analysis</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                  This hiring campaign uses ValuHire assessment engine. Make sure you have a quiet environment and a stable internet connection.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Action / Stats Card */}
          <div className="space-y-6">
            <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-on-surface mb-4">Assessment Summary</h3>

              {hasAssessment ? (
                <div className="space-y-4 mb-6">
                  {/* Total Duration */}
                  <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                    <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Total Duration</div>
                      <div className="text-base font-extrabold text-on-surface">{totalDur} minutes</div>
                    </div>
                  </div>

                  {/* MCQ Details */}
                  {totalMcqs > 0 && (
                    <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                      <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">MCQ Section</div>
                        <div className="text-base font-extrabold text-on-surface">
                          {totalMcqs} Questions {mcqDur > 0 && `(${mcqDur}m)`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coding Details */}
                  {totalCodings > 0 && (
                    <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                      <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                        <Code size={18} />
                      </div>
                      <div>
                        <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Coding Challenges</div>
                        <div className="text-base font-extrabold text-on-surface">
                          {totalCodings} Tasks {codingDur > 0 && `(${codingDur}m)`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total Points */}
                  <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                    <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Evaluation Method</div>
                      <div className="text-base font-extrabold text-on-surface">Structured Sandbox</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-on-surface-variant font-semibold text-sm">
                  No active assessment set up for this campaign.
                </div>
              )}

              {/* Status & Actions */}
              <div className="pt-6 border-t border-outline-variant/40 mt-auto space-y-4">
                {isSubmitted ? (
                  <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 text-center space-y-2">
                    <div className="flex justify-center text-[#059669]">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="text-sm font-bold text-[#047857]">Assessment Completed</div>
                    <p className="text-xs text-[#065F46] font-medium leading-relaxed">
                      You have successfully submitted your assessment. Your results will be analyzed by the recruiting team shortly.
                    </p>
                  </div>
                ) : (
                  <>
                    {application ? (
                      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 text-center">
                        <p className="text-xs text-[#1E40AF] font-bold leading-relaxed">
                          You have applied to this campaign. You can start the assessment whenever you are ready.
                        </p>
                      </div>
                    ) : null}

                    {hasAssessment && (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleApplyAndStart}
                          disabled={starting || applying}
                          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-[#2563EB]/25"
                        >
                          <Play size={16} fill="currentColor" />
                          <span>{starting ? "Starting..." : application ? "Start Assessment" : "Apply & Start Assessment"}</span>
                        </button>
                        
                        {!application && (
                          <button
                            onClick={handleApplyOnly}
                            disabled={starting || applying}
                            className="w-full bg-white hover:bg-surface-light border border-outline-variant text-on-surface font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-0"
                          >
                            <span>{applying ? "Applying..." : "Apply Only"}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
