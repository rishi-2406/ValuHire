import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function ProfileCompletionCard({ user, navigate }) {
  // Core required fields
  const coreChecks = [
    { label: "Full Name",        ok: !!user?.name },
    { label: "Bio",              ok: !!user?.bio },
    { label: "Profile Picture",  ok: !!user?.profilePicUrl },
    { label: "Resume",           ok: !!user?.resumeUrl },
    { label: "Skills / Specialties", ok: !!(user?.skills?.length || user?.specialties?.length) },
  ];

  // Profile links (at least one recommended)
  const linkChecks = [
    { label: "GitHub profile",     ok: !!user?.githubUrl },
    { label: "LinkedIn profile",   ok: !!user?.linkedinUrl },
    { label: "LeetCode profile",   ok: !!user?.leetcodeUrl },
    { label: "Codeforces profile", ok: !!user?.codeforcesUrl },
    { label: "Portfolio / Website",ok: !!user?.portfolioUrl },
  ];

  const missingCore  = coreChecks.filter(c => !c.ok).map(c => ({ label: c.label, isLink: false }));
  const missingLinks = linkChecks.filter(c => !c.ok).map(c => ({ label: c.label, isLink: true }));
  const hasAnyLink   = linkChecks.some(c => c.ok);

  // "Complete" = all core fields + at least one link
  const isComplete = missingCore.length === 0 && hasAnyLink;

  // Compile display list
  const displayMissing = [
    ...missingCore,
    ...(!hasAnyLink ? [{ label: "At least one profile link", isLink: true }] : []),
  ];

  // Additional link suggestions when core is done but some links are absent
  const suggestLinks = hasAnyLink && missingLinks.length > 0 ? missingLinks : [];

  if (isComplete && suggestLinks.length === 0) {
    return (
      <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center mb-5 border border-outline-variant/50">
          <CheckCircle2 size={24} className="text-[#059669]" />
        </div>
        <h3 className="text-xl font-bold text-on-surface mb-2">Profile Complete</h3>
        <p className="text-sm text-on-surface-variant mb-6 font-medium leading-relaxed">
          Your profile is fully fleshed out. Feel free to keep adding more skills and projects.
        </p>
        <button onClick={() => navigate('/settings')} className="w-full bg-white hover:bg-surface-container-low border border-outline-variant text-on-surface font-bold py-3 rounded-xl transition-colors shadow-sm">
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center mb-5 border border-outline-variant/50">
        <AlertTriangle size={24} className={isComplete ? "text-[#D97706]" : "text-on-surface-variant"} />
      </div>

      <h3 className="text-xl font-bold text-on-surface mb-1">
        {isComplete ? "Add More Profiles" : "Incomplete Profile"}
      </h3>
      <p className="text-sm text-on-surface-variant mb-4 font-medium leading-relaxed">
        {isComplete
          ? "You look great! Consider adding more profile links:"
          : "Add these details to stand out to recruiters:"}
      </p>

      {/* Missing items */}
      {displayMissing.length > 0 && (
        <ul className="space-y-2 mb-4">
          {displayMissing.map(item => (
            <li key={item.label} className="text-sm text-on-surface font-semibold flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
              {item.label}
            </li>
          ))}
        </ul>
      )}

      {/* Suggested extra links */}
      {suggestLinks.length > 0 && (
        <div className="border-t border-outline-variant/30 pt-3 mt-3 mb-4">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Also recommended</p>
          <ul className="space-y-1.5">
            {suggestLinks.map(item => (
              <li key={item.label} className="text-xs text-on-surface-variant flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={() => navigate('/settings')} className="w-full bg-[#111827] text-white font-bold py-3 rounded-xl hover:bg-[#1F2937] transition-all shadow-sm active:scale-95 mt-2">
        {isComplete ? "Add Profile Links" : "Complete Profile"}
      </button>
    </div>
  );
}
