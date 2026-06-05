import { useState, useEffect } from "react";
import { campaignService, applicationService, resultsService } from "../services/api";

export function useCampaignDetailsData(campaignId, toast, navigate) {
  const [campaign, setCampaign] = useState(null);
  const [application, setApplication] = useState(null);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
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

        const resData = await resultsService.getMyResults().catch(() => ({ results: [] }));
        const resList = resData.results || resData || [];
        const result = resList.find(r => (r.session?.assessment?.campaignId || r.session?.assessment?.campaign?.id) === campaignId);
        if (result) {
          setHasCompletedAssessment(true);
          setAssessmentResult(result);
        }
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

  return {
    campaign,
    application,
    hasCompletedAssessment,
    assessmentResult,
    loading,
    applying,
    starting,
    handleApplyOnly,
    handleApplyAndStart
  };
}
