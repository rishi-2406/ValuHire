import React from "react";
import { Plus, Trash2, Copy, LayoutTemplate, Eye, EyeOff } from "lucide-react";

export function CodingSection({
  codingDurationMinutes,
  setCodingDurationMinutes,
  codingSlots,
  updateCodingVariant,
  removeCodingVariant,
  addCodingVariant,
  addCodingSlot,
  addTestCase,
  updateTestCase,
  removeTestCase
}) {
  return (
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
                       {(variant.testCases || []).map((tc, tcIdx) => (
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
  );
}
