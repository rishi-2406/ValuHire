import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { campaignService } from "../services/api";
import { 
  ArrowLeft, Save, Plus, Trash2, CheckCircle2, Copy, 
  Code, ListChecks, Settings2, Eye, EyeOff, LayoutTemplate
} from "lucide-react";
import TopBar from "../components/TopBar";

export default function CampaignBuilderPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("mcq"); // mcq | coding

  const [campaign, setCampaign] = useState(null);
  const [mcqDurationMinutes, setMcqDurationMinutes] = useState(30);
  const [codingDurationMinutes, setCodingDurationMinutes] = useState(60);

  // Data structure: Array of Slots. Each slot is an array of variants.
  const [mcqSlots, setMcqSlots] = useState([]);
  const [codingSlots, setCodingSlots] = useState([]);

  useEffect(() => {
    campaignService.getPublicCampaigns() // We should ideally get the specific campaign, but we'll mock fetch here or use existing list
      .then(data => {
         // This is a workaround since getPublicCampaigns returns all. A real app would fetch campaign details.
         // For now, let's just assume we have it or mock it if empty.
         setCampaign({ id: campaignId, title: "Assessment Builder" });
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [campaignId, toast]);

  // Generators for empty variants
  const createEmptyMcqVariant = () => ({
    id: Date.now() + Math.random(),
    prompt: "",
    options: ["", "", "", ""],
    correctKey: "0",
    points: 10
  });

  const createEmptyCodingVariant = () => ({
    id: Date.now() + Math.random(),
    title: "",
    statement: "",
    language: "python",
    difficulty: "Medium",
    points: 20,
    testCases: [{ input: "", expectedOutput: "", isHidden: false }]
  });

  // Handlers for MCQ
  const addMcqSlot = () => setMcqSlots([...mcqSlots, [createEmptyMcqVariant()]]);
  const addMcqVariant = (slotIndex) => {
    const newSlots = [...mcqSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex], createEmptyMcqVariant()];
    setMcqSlots(newSlots);
  };
  const updateMcqVariant = (slotIndex, variantIndex, field, value) => {
    const newSlots = [...mcqSlots];
    newSlots[slotIndex][variantIndex] = { ...newSlots[slotIndex][variantIndex], [field]: value };
    setMcqSlots(newSlots);
  };
  const updateMcqOption = (slotIndex, variantIndex, optIndex, value) => {
    const newSlots = [...mcqSlots];
    newSlots[slotIndex][variantIndex].options[optIndex] = value;
    setMcqSlots(newSlots);
  };
  const removeMcqVariant = (slotIndex, variantIndex) => {
    const newSlots = [...mcqSlots];
    newSlots[slotIndex].splice(variantIndex, 1);
    if (newSlots[slotIndex].length === 0) newSlots.splice(slotIndex, 1);
    setMcqSlots(newSlots);
  };

  // Handlers for Coding
  const addCodingSlot = () => setCodingSlots([...codingSlots, [createEmptyCodingVariant()]]);
  const addCodingVariant = (slotIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex], createEmptyCodingVariant()];
    setCodingSlots(newSlots);
  };
  const updateCodingVariant = (slotIndex, variantIndex, field, value) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex][variantIndex] = { ...newSlots[slotIndex][variantIndex], [field]: value };
    setCodingSlots(newSlots);
  };
  const addTestCase = (slotIndex, variantIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex][variantIndex].testCases.push({ input: "", expectedOutput: "", isHidden: false });
    setCodingSlots(newSlots);
  };
  const updateTestCase = (slotIndex, variantIndex, tcIndex, field, value) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex][variantIndex].testCases[tcIndex] = { ...newSlots[slotIndex][variantIndex].testCases[tcIndex], [field]: value };
    setCodingSlots(newSlots);
  };
  const removeTestCase = (slotIndex, variantIndex, tcIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex][variantIndex].testCases.splice(tcIndex, 1);
    setCodingSlots(newSlots);
  };
  const removeCodingVariant = (slotIndex, variantIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex].splice(variantIndex, 1);
    if (newSlots[slotIndex].length === 0) newSlots.splice(slotIndex, 1);
    setCodingSlots(newSlots);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Flatten arrays for API
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
            <div className="p-8">
              <div className="flex justify-between items-end mb-8 border-b border-outline-variant/50 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface mb-2">Multiple Choice Questions</h2>
                  <p className="text-on-surface-variant text-sm">Add questions and group them into slots. Candidates will be served a random variant from each slot.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Time Limit (Minutes)</label>
                  <input type="number" value={mcqDurationMinutes} onChange={e => setMcqDurationMinutes(e.target.value)} className="w-24 border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
              </div>

              <div className="space-y-8">
                {mcqSlots.map((slot, sIdx) => (
                  <div key={sIdx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 relative">
                    <div className="absolute top-4 right-4 bg-[#2563EB] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Slot {sIdx + 1}
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-4">Question {sIdx + 1} Variants</h3>
                    
                    <div className="space-y-4">
                      {slot.map((variant, vIdx) => (
                        <div key={variant.id} className="bg-white border border-outline-variant/50 rounded-xl p-5 shadow-sm group">
                           <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-2">
                               <LayoutTemplate size={16} className="text-[#64748B]" />
                               <span className="font-semibold text-sm text-[#475569]">Variant {String.fromCharCode(65 + vIdx)}</span>
                             </div>
                             <button onClick={() => removeMcqVariant(sIdx, vIdx)} className="text-on-surface-variant hover:text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                           </div>

                           <div className="grid grid-cols-1 gap-4 mb-4">
                              <textarea placeholder="Enter question prompt..." value={variant.prompt} onChange={e => updateMcqVariant(sIdx, vIdx, 'prompt', e.target.value)} rows={2} className="w-full border border-outline-variant/60 rounded-lg px-4 py-2.5 text-sm focus:border-[#2563EB] outline-none" />
                           </div>

                           <div className="grid grid-cols-2 gap-3 mb-4">
                             {variant.options.map((opt, oIdx) => (
                               <div key={oIdx} className="flex items-center gap-2">
                                  <input type="radio" checked={variant.correctKey === oIdx.toString()} onChange={() => updateMcqVariant(sIdx, vIdx, 'correctKey', oIdx.toString())} name={`correct-${variant.id}`} className="w-4 h-4 text-[#2563EB]" />
                                  <input type="text" placeholder={`Option ${oIdx + 1}`} value={opt} onChange={e => updateMcqOption(sIdx, vIdx, oIdx, e.target.value)} className="flex-1 border border-outline-variant/60 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#2563EB]" />
                               </div>
                             ))}
                           </div>
                           
                           <div className="flex justify-between items-center border-t border-outline-variant/40 pt-4 mt-2">
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-on-surface-variant">Points:</label>
                                <input type="number" value={variant.points} onChange={e => updateMcqVariant(sIdx, vIdx, 'points', e.target.value)} className="w-16 border border-outline-variant rounded px-2 py-1 text-sm outline-none" />
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => addMcqVariant(sIdx)} className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF] px-4 py-2 rounded-lg transition-colors">
                      <Copy size={16} /> Add Variant to Slot {sIdx + 1}
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addMcqSlot} className="mt-8 w-full border-2 border-dashed border-outline-variant hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] rounded-2xl py-6 flex flex-col items-center justify-center gap-2 transition-all font-bold">
                <Plus size={24} />
                Add New Question Slot
              </button>
            </div>
          )}

          {activeTab === "coding" && (
            <div className="p-8">
              <div className="flex justify-between items-end mb-8 border-b border-outline-variant/50 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface mb-2">Coding Questions</h2>
                  <p className="text-on-surface-variant text-sm">Add programming challenges with automated test cases.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Time Limit (Minutes)</label>
                  <input type="number" value={codingDurationMinutes} onChange={e => setCodingDurationMinutes(e.target.value)} className="w-24 border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
              </div>

              <div className="space-y-8">
                {codingSlots.map((slot, sIdx) => (
                  <div key={sIdx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 relative">
                    <div className="absolute top-4 right-4 bg-[#2563EB] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Slot {sIdx + 1}
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-4">Challenge {sIdx + 1} Variants</h3>
                    
                    <div className="space-y-6">
                      {slot.map((variant, vIdx) => (
                        <div key={variant.id} className="bg-white border border-outline-variant/50 rounded-xl p-5 shadow-sm group">
                           <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-2">
                               <LayoutTemplate size={16} className="text-[#64748B]" />
                               <span className="font-semibold text-sm text-[#475569]">Variant {String.fromCharCode(65 + vIdx)}</span>
                             </div>
                             <button onClick={() => removeCodingVariant(sIdx, vIdx)} className="text-on-surface-variant hover:text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                           </div>

                           <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-xs font-bold text-on-surface-variant mb-1">Challenge Title</label>
                                <input type="text" value={variant.title} onChange={e => updateCodingVariant(sIdx, vIdx, 'title', e.target.value)} className="w-full border border-outline-variant rounded-md px-3 py-2 text-sm outline-none focus:border-[#2563EB]" placeholder="e.g. Array Reversal" />
                              </div>
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Language</label>
                                  <select value={variant.language} onChange={e => updateCodingVariant(sIdx, vIdx, 'language', e.target.value)} className="w-full border border-outline-variant rounded-md px-3 py-2 text-sm outline-none bg-white">
                                    <option value="python">Python 3</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                  </select>
                                </div>
                                <div className="w-24">
                                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Points</label>
                                  <input type="number" value={variant.points} onChange={e => updateCodingVariant(sIdx, vIdx, 'points', e.target.value)} className="w-full border border-outline-variant rounded-md px-3 py-2 text-sm outline-none" />
                                </div>
                              </div>
                           </div>

                           <div className="mb-4">
                              <label className="block text-xs font-bold text-on-surface-variant mb-1">Problem Statement</label>
                              <textarea value={variant.statement} onChange={e => updateCodingVariant(sIdx, vIdx, 'statement', e.target.value)} rows={3} className="w-full border border-outline-variant rounded-md px-3 py-2 text-sm outline-none focus:border-[#2563EB]" placeholder="Describe the problem, constraints, and expected I/O..." />
                           </div>

                           <div className="bg-[#F8FAFC] border border-outline-variant/60 rounded-lg p-4">
                             <h4 className="text-sm font-bold text-on-surface mb-3 flex items-center justify-between">
                               Test Cases
                               <button onClick={() => addTestCase(sIdx, vIdx)} className="text-[#2563EB] flex items-center gap-1 text-xs"><Plus size={14} /> Add Case</button>
                             </h4>
                             
                             <div className="space-y-3">
                               {variant.testCases.map((tc, tcIdx) => (
                                 <div key={tcIdx} className="flex items-start gap-2 bg-white p-2 rounded border border-outline-variant/50">
                                   <div className="flex-1 space-y-2">
                                     <input type="text" placeholder="Input (e.g. 1 2 3)" value={tc.input} onChange={e => updateTestCase(sIdx, vIdx, tcIdx, 'input', e.target.value)} className="w-full text-xs border border-outline-variant rounded px-2 py-1 outline-none font-mono" />
                                     <input type="text" placeholder="Expected Output" value={tc.expectedOutput} onChange={e => updateTestCase(sIdx, vIdx, tcIdx, 'expectedOutput', e.target.value)} className="w-full text-xs border border-outline-variant rounded px-2 py-1 outline-none font-mono" />
                                   </div>
                                   <div className="flex flex-col gap-2 shrink-0">
                                     <button onClick={() => updateTestCase(sIdx, vIdx, tcIdx, 'isHidden', !tc.isHidden)} className={`p-1.5 rounded ${tc.isHidden ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#ECFDF5] text-[#10B981]'}`} title={tc.isHidden ? "Hidden from candidate" : "Visible to candidate"}>
                                       {tc.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                     </button>
                                     <button onClick={() => removeTestCase(sIdx, vIdx, tcIdx)} className="p-1.5 text-on-surface-variant hover:text-[#DC2626]"><Trash2 size={14} /></button>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => addCodingVariant(sIdx)} className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF] px-4 py-2 rounded-lg transition-colors">
                      <Copy size={16} /> Add Variant to Slot {sIdx + 1}
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addCodingSlot} className="mt-8 w-full border-2 border-dashed border-outline-variant hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] rounded-2xl py-6 flex flex-col items-center justify-center gap-2 transition-all font-bold">
                <Plus size={24} />
                Add New Coding Challenge Slot
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
