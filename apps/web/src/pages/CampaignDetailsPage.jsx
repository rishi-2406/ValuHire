import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { ArrowLeft, Briefcase, AlertTriangle } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import ResultsBreakdownModal from "../components/ResultsPage/ResultsBreakdownModal";
import { CampaignMainDetails } from "../components/CampaignDetailsPage/CampaignMainDetails";
import { AssessmentSummaryCard } from "../components/CampaignDetailsPage/AssessmentSummaryCard";
import { useCampaignDetailsData } from "../hooks/useCampaignDetailsData";

export default function CampaignDetailsPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const {
    campaign,
    application,
    hasCompletedAssessment,
    assessmentResult,
    loading,
    applying,
    starting,
    handleApplyOnly,
    handleApplyAndStart
  } = useCampaignDetailsData(campaignId, toast, navigate);

  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

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

  const isSubmitted = application?.status === "ASSESSMENT_COMPLETED" || application?.status === "SUBMITTED" || hasCompletedAssessment;

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
          <CampaignMainDetails
            campaign={campaign}
            hasAssessment={hasAssessment}
            isSubmitted={isSubmitted}
            assessmentResult={assessmentResult}
            setIsBreakdownOpen={setIsBreakdownOpen}
          />

          <AssessmentSummaryCard
            hasAssessment={hasAssessment}
            totalDur={totalDur}
            totalMcqs={totalMcqs}
            mcqDur={mcqDur}
            totalCodings={totalCodings}
            codingDur={codingDur}
            isSubmitted={isSubmitted}
            assessmentResult={assessmentResult}
            application={application}
            starting={starting}
            applying={applying}
            handleApplyAndStart={handleApplyAndStart}
            handleApplyOnly={handleApplyOnly}
          />
        </div>
      </main>
      
      <ResultsBreakdownModal 
        isOpen={isBreakdownOpen} 
        onClose={() => setIsBreakdownOpen(false)} 
        assessmentResult={assessmentResult} 
      />
    </div>
  );
}
