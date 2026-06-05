import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { campaignService } from "../services/api";
import { Save, Code, ListChecks } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import { McqSection } from "../components/CampaignBuilderPage/McqSection";
import { CodingSection } from "../components/CampaignBuilderPage/CodingSection";
import { useCampaignBuilderData } from "../hooks/useCampaignBuilderData";

export default function CampaignBuilderPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("mcq"); // mcq | coding

  const [campaign, setCampaign] = useState(null);

  const {
    mcqDurationMinutes, setMcqDurationMinutes,
    codingDurationMinutes, setCodingDurationMinutes,
    mcqSlots, codingSlots,
    addMcqSlot, addMcqVariant, updateMcqVariant, updateMcqOption, removeMcqVariant,
    addCodingSlot, addCodingVariant, updateCodingVariant, removeCodingVariant,
    addTestCase, updateTestCase, removeTestCase
  } = useCampaignBuilderData();

  useEffect(() => {
    campaignService.getPublicCampaigns() 
      .then(data => {
         setCampaign({ id: campaignId, title: "Assessment Builder" });
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [campaignId, toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const flatMcq = [];
      mcqSlots.forEach((slot, sIdx) => {
        slot.forEach(variant => {
           flatMcq.push({ ...variant, slotIndex: sIdx });
        });
      });

      const flatCoding = [];
      codingSlots.forEach((slot, sIdx) => {
        slot.forEach(variant => {
           flatCoding.push({ ...variant, slotIndex: sIdx });
        });
      });

      await campaignService.upsertAssessment(campaignId, {
         title: "Technical Assessment",
         durationMinutes: Number(mcqDurationMinutes) + Number(codingDurationMinutes),
         mcqDurationMinutes: Number(mcqDurationMinutes),
         codingDurationMinutes: Number(codingDurationMinutes),
         instructions: "Complete the MCQ and Coding sections. MCQs will auto-advance to Coding.",
         mcqQuestions: flatMcq,
         codingQuestions: flatCoding
      });
      
      toast.success("Assessment saved successfully");
      navigate("/recruiter");
    } catch (err) {
      toast.error(err.message || "Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading builder...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <TopBar 
        eyebrow="Assessment Builder"
        title={campaign?.title || "Setup Campaign"}
        showSearch={false}
        actions={
          <div className="flex gap-3">
            <button onClick={() => navigate('/recruiter')} className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors disabled:opacity-70">
              <Save size={16} />
              {saving ? "Saving..." : "Save Assessment"}
            </button>
          </div>
        }
      />

      <div className="flex-1 flex max-w-[1600px] mx-auto w-full p-6 gap-6 h-[calc(100vh-80px)] overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-64 bg-white border border-outline-variant/60 rounded-2xl p-4 shadow-sm flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab("mcq")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'mcq' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-on-surface-variant hover:bg-[#F8FAFC]'}`}
          >
            <ListChecks size={20} />
            MCQ Section
          </button>
          <button 
            onClick={() => setActiveTab("coding")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'coding' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-on-surface-variant hover:bg-[#F8FAFC]'}`}
          >
            <Code size={20} />
            Coding Section
          </button>
        </div>

        {/* Builder Canvas */}
        <div className="flex-1 bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-y-auto relative">
          
          {activeTab === "mcq" && (
            <McqSection
              mcqDurationMinutes={mcqDurationMinutes}
              setMcqDurationMinutes={setMcqDurationMinutes}
              mcqSlots={mcqSlots}
              updateMcqVariant={updateMcqVariant}
              updateMcqOption={updateMcqOption}
              removeMcqVariant={removeMcqVariant}
              addMcqVariant={addMcqVariant}
              addMcqSlot={addMcqSlot}
            />
          )}

          {activeTab === "coding" && (
            <CodingSection
              codingDurationMinutes={codingDurationMinutes}
              setCodingDurationMinutes={setCodingDurationMinutes}
              codingSlots={codingSlots}
              updateCodingVariant={updateCodingVariant}
              removeCodingVariant={removeCodingVariant}
              addCodingVariant={addCodingVariant}
              addCodingSlot={addCodingSlot}
              addTestCase={addTestCase}
              updateTestCase={updateTestCase}
              removeTestCase={removeTestCase}
            />
          )}
          
        </div>
      </div>
    </div>
  );
}
