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
    initializeData,
    addMcqSlot, addMcqVariant, updateMcqVariant, updateMcqOption, removeMcqVariant,
    addCodingSlot, addCodingVariant, updateCodingVariant, removeCodingVariant,
    addTestCase, updateTestCase, removeTestCase
  } = useCampaignBuilderData();

  useEffect(() => {
    campaignService.getCampaignDetails(campaignId)
      .then(data => {
         const camp = data.campaign || data;
         setCampaign(camp);
         if (camp.assessment) {
           initializeData(camp.assessment);
         }
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [campaignId, toast, initializeData]);

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
      navigate(`/campaigns/${campaignId}`);
    } catch (err) {
      toast.error(err.message || "Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading builder...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <div className="bg-white border-b border-outline-variant/60 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <div className="text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
            Assessment Builder
          </div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">{campaign?.title || "Setup Campaign"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/campaigns/${campaignId}`)} 
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1e3a8a] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md shadow-[#2563EB]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Assessment"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex max-w-[1600px] mx-auto w-full p-6 gap-6 h-[calc(100vh-80px)] overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-72 flex flex-col gap-4 shrink-0">
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
            <div className="px-4 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Assessment Modules
            </div>
            <button 
              onClick={() => setActiveTab("mcq")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'mcq' ? 'bg-[#2563EB] text-white shadow-md' : 'text-on-surface-variant hover:bg-[#F8FAFC] hover:text-on-surface'}`}
            >
              <ListChecks size={20} className={activeTab === 'mcq' ? 'text-white' : 'text-on-surface-variant'} />
              MCQ Section
            </button>
            <button 
              onClick={() => setActiveTab("coding")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'coding' ? 'bg-[#2563EB] text-white shadow-md' : 'text-on-surface-variant hover:bg-[#F8FAFC] hover:text-on-surface'}`}
            >
              <Code size={20} className={activeTab === 'coding' ? 'text-white' : 'text-on-surface-variant'} />
              Coding Section
            </button>
          </div>
          
          <div className="bg-white border border-[#CA8A04]/20 rounded-2xl p-5 shadow-sm text-sm">
            <div className="font-bold text-[#CA8A04] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse"></span>
              Tips
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Create multiple variants within a single question slot to prevent cheating. Ensure you add similar difficulty questions in variants. Candidates will receive one variant at random.
            </p>
          </div>
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
