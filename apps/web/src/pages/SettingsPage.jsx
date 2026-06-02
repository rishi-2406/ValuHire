import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { userService } from "../services/api";
import { User, Bell, Lock, Shield, Settings as SettingsIcon, X, Settings2 } from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: SettingsIcon },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield }
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const role = user?.role || "CANDIDATE";
  const isRecruiter = role === "RECRUITER" || role === "ADMIN";
  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);

  // Derive real values from user — no hardcoded defaults
  const nameParts = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [email] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [specialties, setSpecialties] = useState(user?.specialties || []);

  // Derive avatar initials from real name
  const initials = ((nameParts[0]?.[0] || "") + (nameParts[1]?.[0] || "")).toUpperCase() || (user?.email?.[0] || "?").toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
      const data = await userService.updateProfile({ name: fullName, bio });
      updateUser(data.user || { name: fullName, bio });
      toast.success("Profile saved", { title: "Changes applied" });
    } catch (err) {
      toast.error(err.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const removeSpecialty = (s) => setSpecialties(specialties.filter((x) => x !== s));

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role={role} />
      <main className="workspace">
        <TopBar
          title=""
          eyebrow=""
          showSearch={false}
          actions={
            <div className="flex gap-3">
              <button type="button" className="bg-white border border-outline-variant/60 hover:bg-surface-light text-on-surface px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">
                Discard Changes
              </button>
              <button type="submit" form="settings-form" disabled={saving} className="bg-[#059669] hover:bg-[#047857] text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-60">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          }
        />

        <div className="p-8 max-w-5xl mx-auto h-full flex flex-col items-center justify-center">

          <div className="w-full bg-white rounded-xl shadow-lg border border-outline-variant/30 overflow-hidden flex min-h-[600px]">

            {/* Left settings nav */}
            <aside className="w-64 bg-[#F8FAFC] border-r border-outline-variant/50 p-6 flex flex-col shrink-0">
              <div className="mb-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xl font-bold">
                  {initials}
                </div>
                <div>
                  <h2 className="font-bold text-on-surface text-lg leading-tight">ValuHire Settings</h2>
                  <p className="text-sm text-on-surface-variant">Manage your account</p>
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors text-left ${isActive ? "bg-[#2563EB] text-white" : "text-on-surface-variant hover:bg-surface-container-high"}`}
                    >
                      <Icon size={18} />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Right content */}
            <section className="flex-1 p-10 overflow-y-auto">
              {activeSection === "profile" && (
                <form id="settings-form" onSubmit={handleSave} className="max-w-2xl">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-on-surface mb-2">Profile Information</h1>
                    <p className="text-on-surface-variant">Update your personal details here.</p>
                  </div>

                  <div className="h-px w-full bg-outline-variant/50 mb-8" />

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-[#E0E7FF] text-[#2563EB] flex items-center justify-center text-3xl font-bold border-2 border-transparent shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <button type="button" className="bg-white border border-outline-variant hover:bg-surface-light text-on-surface px-4 py-2 rounded font-semibold text-sm transition-colors">
                          Change avatar
                        </button>
                        <button type="button" className="text-[#DC2626] hover:text-[#B91C1C] font-semibold text-sm transition-colors">
                          Remove
                        </button>
                      </div>
                      <p className="text-xs text-on-surface-variant">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full border border-outline-variant/80 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full border border-outline-variant/80 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface font-medium"
                      />
                    </div>
                  </div>

                  {/* Email — read-only */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-on-surface mb-2">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full border border-outline-variant/80 rounded pl-10 pr-4 py-2.5 text-sm bg-surface-container-low focus:outline-none text-on-surface-variant font-medium cursor-not-allowed"
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">Email cannot be changed after registration.</p>
                  </div>

                  {/* Bio */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-on-surface mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={4}
                      placeholder="Write a few sentences about yourself..."
                      className="w-full border border-outline-variant/80 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface resize-none font-medium leading-relaxed"
                    />
                  </div>

                  {/* Recruiting Specialties — recruiters only */}
                  {isRecruiter && (
                    <div className="border border-outline-variant/80 rounded-lg p-6 bg-[#F8FAFC]">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-on-surface">Recruiting Specialties</h3>
                        <Settings2 size={20} className="text-on-surface-variant" />
                      </div>
                      <p className="text-sm text-on-surface-variant mb-6">Tags help candidates find you in the directory.</p>
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
                  )}

                  <div className="mt-8 flex justify-end gap-3 border-t border-outline-variant/50 pt-6">
                    <button type="button" className="bg-white border border-outline-variant/80 hover:bg-surface-light text-on-surface px-6 py-2.5 rounded font-bold text-sm transition-colors">
                      Discard Changes
                    </button>
                    <button type="submit" disabled={saving} className="bg-[#41765B] hover:bg-[#2F5A44] text-white px-6 py-2.5 rounded font-bold text-sm transition-colors shadow-sm disabled:opacity-60">
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
              {activeSection !== "profile" && (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                  <SettingsIcon size={48} className="mb-4 opacity-50" />
                  <p className="font-semibold text-lg">{SECTIONS.find(s => s.id === activeSection)?.label} settings</p>
                  <p className="text-sm mt-2">This section is coming soon.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
