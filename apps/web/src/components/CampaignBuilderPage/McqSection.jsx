import React from "react";
import { Plus, Trash2, Copy, LayoutTemplate } from "lucide-react";

export function McqSection({
  mcqDurationMinutes,
  setMcqDurationMinutes,
  mcqSlots,
  updateMcqVariant,
  updateMcqOption,
  removeMcqVariant,
  addMcqVariant,
  addMcqSlot
}) {
  return (
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
  );
}
