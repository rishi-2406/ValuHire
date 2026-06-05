import React, { useState } from "react";
import { Settings2, X } from "lucide-react";

export function SpecialtiesSection({ specialties, setSpecialties }) {
  const [newSpecialty, setNewSpecialty] = useState("");

  const removeSpecialty = (s) => setSpecialties(specialties.filter((x) => x !== s));

  const handleAddSpecialty = (e) => {
    e.preventDefault();
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  return (
    <div className="border border-outline-variant/80 rounded-lg p-6 bg-[#F8FAFC]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-on-surface">Specialties & Skills</h3>
        <Settings2 size={20} className="text-on-surface-variant" />
      </div>
      <p className="text-sm text-on-surface-variant mb-6">Tags help others find you in the directory.</p>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={newSpecialty}
          onChange={(e) => setNewSpecialty(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddSpecialty(e); }}
          placeholder="Add a skill or specialty..." 
          className="flex-1 border border-outline-variant/80 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#2563EB] text-on-surface font-medium"
        />
        <button type="button" onClick={handleAddSpecialty} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded text-sm font-bold transition-colors">
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {specialties.length === 0 && <span className="text-sm text-on-surface-variant italic">No specialties added yet.</span>}
        {specialties.map(s => (
          <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] text-white rounded-full text-xs font-semibold">
            {s}
            <button type="button" onClick={() => removeSpecialty(s)} className="hover:bg-black/10 rounded-full p-0.5"><X size={12} /></button>
          </span>
        ))}
      </div>
    </div>
  );
}
