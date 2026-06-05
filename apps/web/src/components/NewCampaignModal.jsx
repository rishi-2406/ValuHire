import { X, Megaphone, Briefcase, Calendar, ArrowRight } from "lucide-react";
import { useNewCampaign } from "../hooks/useNewCampaign";

export default function NewCampaignModal({ open, onClose, onCreate }) {
  const {
    title, setTitle,
    description, setDescription,
    targetRole, setTargetRole,
    duration, setDuration,
    tags, tagInput, setTagInput,
    submitting,
    addTag, removeTag, handleSubmit
  } = useNewCampaign(onCreate, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <form className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/50 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Megaphone size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Create New Campaign</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">Setup the details for your next hiring sprint.</p>
            </div>
          </div>
          <button type="button" className="text-on-surface-variant hover:text-on-surface transition-colors p-1" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="flex flex-col gap-6">
            
            <div>
              <label htmlFor="campaign-title" className="block text-sm font-semibold text-on-surface mb-2">
                Campaign Title <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="campaign-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Frontend Developer"
                required
                autoFocus
                className="w-full border border-outline-variant/80 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface"
              />
            </div>

            <div>
              <label htmlFor="campaign-desc" className="block text-sm font-semibold text-on-surface mb-2">Description</label>
              <textarea
                id="campaign-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of the campaign goals..."
                rows={4}
                className="w-full border border-outline-variant/80 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="campaign-role" className="block text-sm font-semibold text-on-surface mb-2">
                  Target Role / Position <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" />
                  <input
                    id="campaign-role"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Full Stack Developer"
                    required
                    className="w-full border border-outline-variant/80 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="campaign-duration" className="block text-sm font-semibold text-on-surface mb-2">Campaign Duration</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" />
                  <input
                    id="campaign-duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 30"
                    className="w-full border border-outline-variant/80 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface appearance-none bg-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-on-surface-variant pointer-events-none">Days</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="campaign-skills" className="block text-sm font-semibold text-on-surface mb-2">Required Skills</label>
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 border border-outline-variant/80 rounded-lg min-h-[46px] bg-white focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] rounded-full text-sm font-medium">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-black transition-colors" aria-label={`Remove ${tag}`}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <input
                  id="campaign-skills"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(e);
                    }
                  }}
                  placeholder="Type a skill and press enter..."
                  className="flex-1 min-w-[200px] outline-none text-sm bg-transparent border-none py-1"
                />
              </div>
            </div>          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-[#F8FAFC]">
          <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-on-surface hover:bg-black/5 rounded-lg transition-colors" disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm inline-flex items-center gap-2" disabled={submitting || !title.trim() || !targetRole.trim()}>
            <span>{submitting ? "Creating…" : "Create Campaign"}</span>
            {!submitting && <ArrowRight size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
