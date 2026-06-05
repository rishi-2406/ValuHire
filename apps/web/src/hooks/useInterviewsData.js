import { useState, useEffect } from "react";
import { interviewService, resultsService } from "../services/api";
import { useToast } from "./useToast";

export function useInterviewsData() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    interviewService.getMyInterviews()
      .then((data) => {
        const list = data.slots || data.interviews || data || [];
        setInterviews(list);
      })
      .catch((err) => {
        setError(err.message || "Could not load interviews");
        setInterviews([]);
      })
      .finally(() => setLoading(false));

    resultsService.getMyResults().catch(() => ({})).then((data) => {
      const ranked = data.results || data || [];
      if (ranked.length > 0) {
        setCandidates(
          ranked.map((r, i) => ({
            id: r.id || r.userId || i,
            name: r.name || r.candidateName || `Candidate ${i + 1}`,
            role: r.role || r.position
          }))
        );
      }
    });
  }, []);

  const handleSchedule = async (payload) => {
    try {
      const startsAt = new Date(`${payload.date}T${payload.time}`).toISOString();
      const durationMin = parseInt(payload.duration) || 60;
      const endsAt = new Date(new Date(startsAt).getTime() + durationMin * 60000).toISOString();
      const candidateId = payload.candidateId || (payload.attendees?.[0]?.id);
      const campaignId = payload.campaignId;

      if (!campaignId || !candidateId) {
        toast.warning("Please select a candidate and campaign to schedule.");
        return;
      }

      const data = await interviewService.scheduleInterview({ campaignId, candidateId, startsAt, endsAt });
      const newSlot = data.slot || data.interview || data;
      setInterviews((prev) => [newSlot, ...prev]);
      toast.success("Interview scheduled", { title: payload.date });
    } catch (err) {
      toast.error(err.message || "Failed to schedule interview");
      throw err;
    }
  };

  return {
    interviews,
    loading,
    error,
    candidates,
    handleSchedule
  };
}
